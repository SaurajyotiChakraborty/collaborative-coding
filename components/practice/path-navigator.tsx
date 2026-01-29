'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle2, ChevronRight, ArrowLeft, Play } from 'lucide-react';
import { getPathDetails } from '@/app/actions/practice';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface PathNavigatorProps {
    pathId: string;
    onBack: () => void;
    onStartQuestion: (questionId: bigint) => void;
}

export function PathNavigator({ pathId, onBack, onStartQuestion }: PathNavigatorProps) {
    const { data: session } = useSession();
    const [path, setPath] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!session?.user) return;
            setLoading(true);
            const res = await getPathDetails(pathId, (session.user as any).id);
            if (res.success) {
                setPath(res.path);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [pathId, session?.user]);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 dark:bg-gray-900 rounded-lg" />)}
                </div>
            </div>
        );
    }

    if (!path) return null;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={onBack} className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Practice
            </Button>

            <Card className="glass-strong border-purple-200 dark:border-purple-800 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
                    <Badge className="mb-2 bg-white/20 hover:bg-white/30 border-none">{path.category}</Badge>
                    <CardTitle className="text-3xl font-bold mb-2">{path.name}</CardTitle>
                    <CardDescription className="text-purple-50 text-base max-w-2xl">
                        {path.description}
                    </CardDescription>
                </div>
                <CardContent className="p-0">
                    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-b border-purple-100 dark:border-purple-900">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold">{Math.floor(path.progress)}% Complete</span>
                            <span className="text-muted-foreground">{path.questions.filter((q: any) => q.isCompleted).length} / {path.questions.length} Steps</span>
                        </div>
                        <div className="mt-2 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                style={{ width: `${path.progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {path.questions.map((question: any, index: number) => (
                            <div key={question.id} className="relative flex items-start gap-4">
                                {index !== path.questions.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
                                )}

                                <div className={cn(
                                    "mt-1 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                                    question.isCompleted
                                        ? "bg-green-500 border-green-500 text-white"
                                        : question.isLocked
                                            ? "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                                            : "bg-white dark:bg-black border-purple-500 text-purple-600 animate-pulse-subtle"
                                )}>
                                    {question.isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : question.isLocked ? (
                                        <Lock className="h-5 w-5" />
                                    ) : (
                                        <span className="font-bold">{index + 1}</span>
                                    )}
                                </div>

                                <div className={cn(
                                    "flex-1 pb-8",
                                    question.isLocked && "opacity-60"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg">{question.title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{question.description}</p>
                                        </div>
                                        {!question.isLocked && (
                                            <Button
                                                onClick={() => onStartQuestion(BigInt(question.id))}
                                                className={cn(
                                                    "ml-4",
                                                    question.isCompleted
                                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200"
                                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                                )}
                                            >
                                                {question.isCompleted ? 'Review' : 'Start'}
                                                <Play className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
