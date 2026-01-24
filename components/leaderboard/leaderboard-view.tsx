'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Award, Zap } from 'lucide-react';
import { getLeaderboard } from '@/app/actions/leaderboard';

interface LeaderboardEntry {
    userId: string;
    rank: number;
    totalPoints: bigint;
    totalWins: number;
    currentStreak: number;
    bestStreak: number;
    competitionsCompleted: number;
    user: {
        username: string;
        role: string;
        achievements: string[];
        titles: string[];
    };
}

export function LeaderboardView() {
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLeaderboards();
    }, []);

    const loadLeaderboards = async () => {
        setIsLoading(true);
        const [global, weekly] = await Promise.all([
            getLeaderboard('global', 100),
            getLeaderboard('weekly', 50)
        ]);

        if (global.success && global.entries) {
            setGlobalLeaderboard(global.entries as any);
        }
        if (weekly.success && weekly.entries) {
            setWeeklyLeaderboard(weekly.entries as any);
        }
        setIsLoading(false);
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-orange-600';
        return 'text-gray-600';
    };

    const getRankIcon = (rank: number) => {
        if (rank <= 3) return <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />;
        return null;
    };

    const renderLeaderboard = (entries: LeaderboardEntry[]) => (
        <div className="space-y-2">
            {entries.map((entry) => (
                <Card key={entry.userId} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 w-12">
                                    {getRankIcon(entry.rank)}
                                    <span className={`font-bold text-lg ${getRankColor(entry.rank)}`}>
                                        #{entry.rank}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-lg">{entry.user.username}</span>
                                        {entry.user.role === 'Admin' && (
                                            <Badge variant="destructive" className="text-xs">Admin</Badge>
                                        )}
                                        {entry.user.titles.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {entry.user.titles[0]}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Trophy className="h-3 w-3" />
                                            {entry.totalWins} wins
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-3 w-3" />
                                            {entry.currentStreak} streak
                                        </span>
                                        <span>{entry.competitionsCompleted} competitions</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {entry.totalPoints.toString()}
                                </div>
                                <div className="text-xs text-muted-foreground">points</div>
                            </div>
                        </div>

                        {entry.user.achievements.length > 0 && (
                            <div className="flex gap-1 mt-2">
                                {entry.user.achievements.slice(0, 5).map((achievement, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        <Award className="h-3 w-3 mr-1" />
                                        {achievement}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card className="glass-strong border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        <CardTitle className="gradient-text text-2xl">Leaderboard</CardTitle>
                    </div>
                    <CardDescription>Top performers in competitive coding</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="global" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="global" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Global
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        This Week
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="global" className="space-y-2">
                    {renderLeaderboard(globalLeaderboard)}
                </TabsContent>

                <TabsContent value="weekly" className="space-y-2">
                    {renderLeaderboard(weeklyLeaderboard)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
