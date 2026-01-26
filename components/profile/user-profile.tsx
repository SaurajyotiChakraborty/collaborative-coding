'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Trophy,
    Award,
    Github,
    Linkedin,
    Twitter,
    Download,
    Copy,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface UserProfileProps {
    userId?: string;
}

export function UserProfile({ userId: manualUserId }: UserProfileProps) {
    const { data: session } = useSession();
    const userId = manualUserId || session?.user?.id;

    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Dynamic user data from session for now (until Prisma client regenerates)
    const userData = session?.user;
    const leaderboardEntry = { rank: 0, totalWins: 0, currentStreak: 0, bestStreak: 0, totalPoints: 0 };
    const achievements: any[] = [];

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-center p-12">
                <p className="text-muted-foreground">User not found.</p>
            </div>
        );
    }

    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/profile/${userData.username}`
        : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast.success('Profile link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLinkedIn = () => {
        const text = `Check out my Optimize Coder profile! Rating: ${userData.rating}`;
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareTwitter = () => {
        const text = `I'm on @OptimizeCoder with a rating of ${userData.rating}! 🚀`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
        window.open(url, '_blank');
    };

    const handleShareGithub = () => {
        const markdown = `## 🏆 Optimize Coder Achievements

**Rating:** ${userData.rating} | **XP:** ${userData.xp}

[View Full Profile](${profileUrl})
`;
        navigator.clipboard.writeText(markdown);
        toast.success('Markdown copied! Paste it in your GitHub profile README');
    };

    const downloadAchievementCard = () => {
        toast.info('Achievement card download coming soon!');
    };

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <Card className="glass-strong border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-4 border-purple-600">
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                                {userData.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold gradient-text mb-1">{userData.username}</h1>
                            <p className="text-muted-foreground mb-3">{userData.email}</p>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-purple-600">{userData.rating || 1200}</div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-yellow-600">#{leaderboardEntry.rank || '-'}</div>
                                    <div className="text-xs text-muted-foreground">Global Rank</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-green-600">{leaderboardEntry.totalWins}</div>
                                    <div className="text-xs text-muted-foreground">Wins</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-orange-600">{leaderboardEntry.currentStreak}🔥</div>
                                    <div className="text-xs text-muted-foreground">Streak</div>
                                </div>
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopyLink}>
                                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShareLinkedIn}>
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShareTwitter}>
                                <Twitter className="h-4 w-4 mr-2" />
                                Twitter
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShareGithub}>
                                <Github className="h-4 w-4 mr-2" />
                                GitHub MD
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="achievements" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Achievements ({achievements.length})</h2>
                        <Button variant="outline" size="sm" onClick={downloadAchievementCard}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Card
                        </Button>
                    </div>

                    {achievements.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No achievements unlocked yet. Start competing to earn badges!</p>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {achievements.map((achievement: any) => (
                                <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="text-4xl">{achievement.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{achievement.name}</h3>
                                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Competition Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Wins</span>
                                    <span className="font-semibold">{leaderboardEntry.totalWins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Best Streak</span>
                                    <span className="font-semibold">{leaderboardEntry.bestStreak} wins</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total XP</span>
                                    <span className="font-semibold">{String(userData.xp || 0)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rating Progress</CardTitle>
                                <CardDescription>Your rating over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                                    <p className="text-muted-foreground">Chart coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Competitions</h2>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No competition history yet. Join a match to get started!</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
