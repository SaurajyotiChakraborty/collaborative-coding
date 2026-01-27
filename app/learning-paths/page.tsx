'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight, Loader2, Trophy, Clock } from 'lucide-react';
import { getAvailableLearningPaths, enrollInPath } from '@/app/actions/user-learning';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LearningPathsPage() {
    const { data: session } = useSession();
    const [paths, setPaths] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            loadPaths();
        }
    }, [session]);

    const loadPaths = async () => {
        setIsLoading(true);
        try {
            const res = await getAvailableLearningPaths(session!.user!.id);
            if (res.success) {
                setPaths(res.paths || []);
            }
        } catch (error) {
            toast.error('Failed to load learning paths');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async (pathId: string) => {
        try {
            const res = await enrollInPath(pathId, session!.user!.id);
            if (res.success) {
                toast.success('Enrolled successfully!');
                loadPaths();
            }
        } catch (error) {
            toast.error('Enrollment failed');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-12 w-12 text-purple-600" /></div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Learning Paths</h1>
                <p className="text-muted-foreground text-lg">Curated tracks to master specific skills and concepts.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paths.map(path => {
                    const userProgress = path.userProgress?.[0];
                    const isEnrolled = !!userProgress;
                    const progressValue = userProgress?.progress || 0;

                    return (
                        <Card key={path.id} className="flex flex-col glass-strong border-purple-100 dark:border-purple-900 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">{path.category}</Badge>
                                    <Badge variant="secondary">{path.difficulty}</Badge>
                                </div>
                                <CardTitle className="text-xl font-bold">{path.name}</CardTitle>
                                <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end space-y-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{path.questions.length} steps</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Trophy className="h-4 w-4" />
                                        <span>Bonus XP</span>
                                    </div>
                                </div>

                                {isEnrolled ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-semibold">
                                            <span>Progress</span>
                                            <span>{Math.round(progressValue)}%</span>
                                        </div>
                                        <Progress value={progressValue} className="h-1.5" />
                                        <Link href={`/learning-paths/${path.id}`} className="block">
                                            <Button className="w-full mt-2 gap-2" variant="default">
                                                Continue Learning
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <Button className="w-full gap-2" variant="outline" onClick={() => handleEnroll(path.id)}>
                                        Enroll Now
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {paths.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold mb-1">No Paths Available</h3>
                        <p className="text-muted-foreground">Check back later for new curriculum content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
