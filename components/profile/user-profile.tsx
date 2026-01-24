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
    Code2,
    TrendingUp,
    Share2,
    Github,
    Linkedin,
    Twitter,
    Download,
    Copy,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileProps {
    userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
    const [user, setUser] = useState({
        username: 'johndoe',
        email: 'john@example.com',
        rating: 1450,
        xp: 2500,
        rank: 42,
        totalWins: 15,
        currentStreak: 5,
        bestStreak: 12,
        competitionsCompleted: 48,
        titles: ['Code Master', 'Optimization Expert'],
        achievements: [
            { id: 1, name: 'First Win', description: 'Won your first competition', icon: '🏆', earnedAt: '2024-01-15' },
            { id: 2, name: 'Speed Demon', description: 'Fastest submission in a competition', icon: '⚡', earnedAt: '2024-01-20' },
            { id: 3, name: 'Perfectionist', description: '100% test pass rate in 10 competitions', icon: '✨', earnedAt: '2024-02-01' },
            { id: 4, name: 'Streak Master', description: '10-win streak', icon: '🔥', earnedAt: '2024-02-10' },
            { id: 5, name: 'Code Optimizer', description: 'Best complexity score in 5 competitions', icon: '🎯', earnedAt: '2024-02-15' },
        ],
        stats: {
            totalSubmissions: 156,
            avgComplexity: 'O(n log n)',
            favoriteLanguage: 'JavaScript',
            totalCodeLines: 12500,
        }
    });

    const [copied, setCopied] = useState(false);

    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/profile/${user.username}`
        : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast.success('Profile link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLinkedIn = () => {
        const text = `Check out my Optimize Coder profile! Rating: ${user.rating}, Rank: #${user.rank}`;
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const handleShareTwitter = () => {
        const text = `I'm ranked #${user.rank} on @OptimizeCoder with a rating of ${user.rating}! 🚀`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`;
        window.open(url, '_blank');
    };

    const handleShareGithub = () => {
        // Copy achievements as markdown for GitHub profile
        const markdown = `## 🏆 Optimize Coder Achievements

**Rating:** ${user.rating} | **Rank:** #${user.rank} | **Wins:** ${user.totalWins}

### Achievements
${user.achievements.map(a => `- ${a.icon} **${a.name}**: ${a.description}`).join('\n')}

[View Full Profile](${profileUrl})
`;
        navigator.clipboard.writeText(markdown);
        toast.success('Markdown copied! Paste it in your GitHub profile README');
    };

    const downloadAchievementCard = () => {
        // This would generate an image card with achievements
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
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold gradient-text mb-1">{user.username}</h1>
                            <p className="text-muted-foreground mb-3">{user.email}</p>

                            {/* Titles */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                                {user.titles.map((title, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-sm">
                                        <Award className="h-3 w-3 mr-1" />
                                        {title}
                                    </Badge>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-purple-600">{user.rating}</div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-yellow-600">#{user.rank}</div>
                                    <div className="text-xs text-muted-foreground">Global Rank</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-green-600">{user.totalWins}</div>
                                    <div className="text-xs text-muted-foreground">Wins</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="text-2xl font-bold text-orange-600">{user.currentStreak}🔥</div>
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
                        <h2 className="text-xl font-semibold">Achievements ({user.achievements.length})</h2>
                        <Button variant="outline" size="sm" onClick={downloadAchievementCard}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Card
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {user.achievements.map((achievement) => (
                            <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl">{achievement.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{achievement.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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
                                    <span className="text-muted-foreground">Total Competitions</span>
                                    <span className="font-semibold">{user.competitionsCompleted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Win Rate</span>
                                    <span className="font-semibold">{((user.totalWins / user.competitionsCompleted) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Best Streak</span>
                                    <span className="font-semibold">{user.bestStreak} wins</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total XP</span>
                                    <span className="font-semibold">{user.xp.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Coding Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Submissions</span>
                                    <span className="font-semibold">{user.stats.totalSubmissions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Complexity</span>
                                    <span className="font-semibold">{user.stats.avgComplexity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Favorite Language</span>
                                    <span className="font-semibold">{user.stats.favoriteLanguage}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Lines of Code</span>
                                    <span className="font-semibold">{user.stats.totalCodeLines.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress Chart Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rating Progress</CardTitle>
                            <CardDescription>Your rating over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded">
                                <p className="text-muted-foreground">Chart coming soon</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <h2 className="text-xl font-semibold">Recent Competitions</h2>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Competition #42</p>
                                            <p className="text-sm text-muted-foreground">2 hours ago • 4 players</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-yellow-600">
                                                <Trophy className="h-3 w-3 mr-1" />
                                                1st Place
                                            </Badge>
                                            <span className="text-sm text-green-600">+100 XP</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Competition #41</p>
                                            <p className="text-sm text-muted-foreground">1 day ago • 3 players</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">2nd Place</Badge>
                                            <span className="text-sm text-green-600">+50 XP</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
