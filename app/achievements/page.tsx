'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Shield, Target, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { getUserAchievements } from '@/app/actions/user-learning';
import { toast } from 'sonner';

export default function AchievementsPage() {
    const { data: session } = useSession();
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            loadAchievements();
        }
    }, [session]);

    const loadAchievements = async () => {
        setIsLoading(true);
        try {
            const res = await getUserAchievements(session!.user!.id);
            if (res.success) {
                setAchievements(res.achievements || []);
            }
        } catch (error) {
            toast.error('Failed to load achievements');
        } finally {
            setIsLoading(false);
        }
    };

    const earnedCount = achievements.filter(a => a.isEarned).length;

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-12 w-12 text-purple-600" /></div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl space-y-12">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-8 rounded-3xl border border-purple-100 dark:border-purple-900/50">
                <div className="h-24 w-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Trophy className="h-12 w-12 text-white" />
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Hall of Fame</h1>
                    <p className="text-muted-foreground text-lg">Your journey through milestones and legendary feats.</p>
                </div>
                <div className="text-center px-6 py-4 bg-white dark:bg-black/20 rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-purple-600">{earnedCount}/{achievements.length}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unlocked</div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.map(a => (
                    <Card key={a.id} className={`group relative flex flex-col overflow-hidden transition-all duration-300 ${a.isEarned
                            ? 'glass-strong border-purple-200 dark:border-purple-800 shadow-lg'
                            : 'opacity-70 grayscale border-dashed border-gray-300 dark:border-gray-800'
                        }`}>
                        <CardHeader className="items-center pb-2 text-center">
                            <div className={`h-20 w-20 mb-4 rounded-2xl flex items-center justify-center text-4xl transition-transform group-hover:scale-110 ${a.isEarned ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                {a.icon}
                            </div>
                            <CardTitle className="text-lg font-bold">{a.name}</CardTitle>
                            <CardDescription className="text-xs h-10 line-clamp-2">{a.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end space-y-4 pt-4">
                            <div className="flex items-center justify-between text-xs">
                                <Badge variant={a.isEarned ? 'default' : 'secondary'} className="gap-1">
                                    <Star className="h-3 w-3 fill-current" />
                                    {a.xpReward} XP
                                </Badge>
                                <span className="text-muted-foreground font-medium">
                                    {a.requirementValue} {a.requirementType}
                                </span>
                            </div>

                            {a.isEarned ? (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    UNLOCKED {new Date(a.earnedAt).toLocaleDateString()}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold py-2 px-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-800">
                                    <Lock className="h-3.5 w-3.5" />
                                    LOCKED
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
