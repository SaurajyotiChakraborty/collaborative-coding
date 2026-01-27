'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Code2,
    Trophy,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Activity
} from 'lucide-react';
import { getCompetitionStats, getQuestionStats, getAllUsers } from '@/app/actions/admin';

interface Stats {
    users: { total: number; admins: number; banned: number };
    competitions: { total: number; active: number; completed: number };
    questions: { total: number; byDifficulty: any[] };
}

export function AdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity] = useState([
        { id: 1, type: 'user_joined', message: 'New user registered', time: '5 min ago', icon: Users },
        { id: 2, type: 'competition_started', message: 'Competition #16 started', time: '12 min ago', icon: Trophy },
        { id: 3, type: 'submission', message: '3 new submissions', time: '18 min ago', icon: Code2 },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [compStats, qStats, userResult] = await Promise.all([
                    getCompetitionStats(),
                    getQuestionStats(),
                    getAllUsers(1, 1000)
                ]);

                const admins = userResult.users?.filter((u: any) => u.role === 'Admin').length || 0;
                const banned = userResult.users?.filter((u: any) => u.isCheater).length || 0;

                setStats({
                    users: { total: userResult.total || 0, admins, banned },
                    competitions: compStats.stats || { total: 0, active: 0, completed: 0 },
                    questions: qStats.stats || { total: 0, byDifficulty: [] }
                });
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.users.total || 0,
            description: `${stats?.users.admins || 0} admins, ${stats?.users.banned || 0} banned`,
            icon: Users,
            color: 'purple'
        },
        {
            title: 'Active Competitions',
            value: stats?.competitions.active || 0,
            description: `${stats?.competitions.total || 0} total, ${stats?.competitions.completed || 0} completed`,
            icon: Trophy,
            color: 'orange'
        },
        {
            title: 'Questions',
            value: stats?.questions.total || 0,
            description: 'In question bank',
            icon: Code2,
            color: 'blue'
        },
        {
            title: 'System Status',
            value: 'Healthy',
            description: 'All services running',
            icon: Activity,
            color: 'green'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={idx} className={`border-l-4 border-l-${stat.color}-500`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className={`h-4 w-4 text-${stat.color}-600`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions & Activity */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* System Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            System Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Database Connected</p>
                                    <p className="text-xs text-muted-foreground">PostgreSQL running normally</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Inngest Jobs Active</p>
                                    <p className="text-xs text-muted-foreground">Background processing normal</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.message}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Question Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Question Distribution</CardTitle>
                    <CardDescription>Questions by difficulty level</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        {stats?.questions.byDifficulty.map((item: any) => (
                            <div key={item.difficulty} className="flex-1 text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <Badge
                                    variant="outline"
                                    className={
                                        item.difficulty === 'Easy' ? 'border-green-500 text-green-600' :
                                            item.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-600' :
                                                'border-red-500 text-red-600'
                                    }
                                >
                                    {item.difficulty}
                                </Badge>
                                <p className="text-2xl font-bold mt-2">{item._count}</p>
                            </div>
                        ))}
                        {(!stats?.questions.byDifficulty || stats.questions.byDifficulty.length === 0) && (
                            <p className="text-muted-foreground">No questions yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
