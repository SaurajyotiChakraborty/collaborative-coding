'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlatformStats } from '@/app/actions/admin-management';
import { Loader2, TrendingUp, Users, Code2, Trophy, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const PlatformAnalytics = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getPlatformStats();
            if (res.success) setStats(res.stats);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>;
    }

    if (!stats) return <div>Failed to load stats.</div>;

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-strong border-purple-200 dark:border-purple-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-full">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                            <p className="text-2xl font-bold">{stats.userCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-strong border-pink-200 dark:border-pink-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-pink-100 dark:bg-pink-900/40 p-3 rounded-full">
                            <Code2 className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Questions</p>
                            <p className="text-2xl font-bold">{stats.questionCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-strong border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                            <Trophy className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Competitions</p>
                            <p className="text-2xl font-bold">{stats.competitionCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-strong border-green-200 dark:border-green-800">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-full">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Submissions</p>
                            <p className="text-2xl font-bold">{stats.submissionCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Languages Breakdown */}
                <Card className="glass-strong border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            Language Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.languageStats.map((item: any) => {
                                const percentage = ((item._count / stats.submissionCount) * 100).toFixed(1);
                                return (
                                    <div key={item.language} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold capitalize">{item.language}</span>
                                            <span className="text-muted-foreground">{item._count} submissions ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.languageStats.length === 0 && (
                                <p className="text-center py-4 text-muted-foreground">No submission data yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Difficulty Breakdown */}
                <Card className="glass-strong border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Question Difficulty
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {['Easy', 'Medium', 'Hard'].map(diff => {
                                const item = stats.difficultyStats.find((s: any) => s.difficulty === diff);
                                const count = item?._count || 0;
                                const percentage = stats.questionCount > 0 ? ((count / stats.questionCount) * 100).toFixed(1) : 0;

                                return (
                                    <div key={diff} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold">{diff}</span>
                                            <span className="text-muted-foreground">{count} questions ({percentage}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${diff === 'Easy' ? 'bg-green-500' :
                                                        diff === 'Medium' ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Vitality */}
            <Card className="glass-strong border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Submissions</CardTitle>
                    <CardDescription>Live feed of platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stats.recentSubmissions.map((sub: any) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full ${sub.allTestsPassed ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {sub.user.username} <span className="font-normal text-muted-foreground">solved</span> {sub.question.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="capitalize">{sub.language}</Badge>
                                    <Badge variant={sub.allTestsPassed ? 'default' : 'destructive'} className="text-[10px]">
                                        {sub.allTestsPassed ? 'Passed' : 'Failed'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {stats.recentSubmissions.length === 0 && (
                            <p className="text-center py-8 text-muted-foreground">No recent activity.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
