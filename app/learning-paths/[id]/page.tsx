'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    BookOpen,
    ChevronLeft,
    CheckCircle2,
    Circle,
    Play,
    Loader2,
    Trophy,
    ArrowRight
} from 'lucide-react';
import { getLearningPathDetails } from '@/app/actions/user-learning';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LearningPathDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [path, setPath] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id && id) {
            loadDetails();
        }
    }, [session, id]);

    const loadDetails = async () => {
        setIsLoading(true);
        try {
            const res = await getLearningPathDetails(id as string, session!.user!.id);
            if (res.success) {
                setPath(res.path);
            }
        } catch (error) {
            toast.error('Failed to load path details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-12 w-12 text-purple-600" /></div>;
    }

    if (!path) return <div className="text-center py-12">Path not found.</div>;

    const userProgress = path.userProgress?.[0];
    const progressValue = userProgress?.progress || 0;

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl space-y-8">
            <Link href="/learning-paths">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-purple-600">
                    <ChevronLeft className="h-4 w-4" />
                    Back to Curriculum
                </Button>
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200">
                        {path.category}
                    </Badge>
                    <h1 className="text-4xl font-extrabold tracking-tight">{path.name}</h1>
                    <p className="text-muted-foreground text-lg">{path.description}</p>
                </div>
                <Card className="w-full md:w-64 glass-strong border-purple-100 dark:border-purple-800">
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                <span>Completion</span>
                                <span>{Math.round(progressValue)}%</span>
                            </div>
                            <Progress value={progressValue} className="h-2" />
                        </div>
                        <div className="pt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Difficulty</span>
                            <Badge variant="secondary">{path.difficulty}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Steps</span>
                            <span className="font-bold">{path.questions.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Path Outline
                </h2>
                <div className="grid gap-3">
                    {path.questions.map((question: any, index: number) => {
                        const isCompleted = question.submissions.length > 0;
                        const isLocked = index > 0 && path.questions[index - 1].submissions.length === 0;

                        return (
                            <Card key={question.id} className={`transition-all duration-300 ${isLocked ? 'opacity-50' : 'hover:border-purple-400 group'
                                }`}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${isCompleted
                                            ? 'bg-green-100 border-green-500 text-green-600'
                                            : isLocked ? 'bg-gray-100 border-gray-300 text-gray-400'
                                                : 'bg-purple-50 border-purple-500 text-purple-600'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <span className="font-bold text-sm">{index + 1}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-lg">{question.title}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Badge variant="outline" className="text-[10px]">{question.difficulty}</Badge>
                                            <div className="flex gap-1">
                                                {question.tags.slice(0, 2).map((t: string) => (
                                                    <span key={t} className="text-[10px] text-muted-foreground">#{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={isLocked ? '#' : `/compete/${question.id}`}>
                                        <Button
                                            variant={isCompleted ? 'outline' : 'default'}
                                            size="sm"
                                            disabled={isLocked}
                                            className="gap-2"
                                        >
                                            {isCompleted ? 'Retry' : 'Start'}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
