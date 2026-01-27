'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, User, Target, Share2, Award, Users, Bot, Gift, Code, Eye, Video, Settings } from 'lucide-react';
import { SideNav } from '@/components/layout/side-nav';
import { WorkspaceContainer } from '@/components/workspace/workspace-container';
import { CompeteContainer } from '@/components/dashboard/compete-container';
import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';
import { VideoReplay } from '@/components/replay/video-replay';
import { SpectatorView } from '@/components/spectator/spectator-view';
import { PracticeMode } from '@/components/practice/practice-mode';
import { PracticeArena } from '@/components/practice/practice-arena';
import { PerformanceAnalytics } from '@/components/analytics/performance-analytics';
import { getUserAnalytics } from '@/app/actions/analytics';
import type { UserAnalytics } from '@/types/extended-types';
import { BarChart as BarChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPanel } from '@/components/admin/admin-panel';
import { BannedView } from '@/components/shared/banned-view';

// Sub-components for better hook isolation
const AchievementsContent = () => (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                        <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold">Master Coder {i}</h3>
                        <p className="text-sm text-muted-foreground">Solve 100 challenges</p>
                    </div>
                </Card>
            ))}
        </div>
    </div>
);

const AnalyticsContent = ({ loading, data }: { loading: boolean, data: UserAnalytics | null }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }
    return data ? (
        <PerformanceAnalytics analytics={data} />
    ) : (
        <div className="text-center p-12">
            <p className="text-muted-foreground">No analytics data available yet. Start competing to see your stats!</p>
        </div>
    );
};

const LoadingContent = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
);

const WelcomeContent = ({ user, onTabChange }: { user: any, onTabChange: (tab: string) => void }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground mt-2">Ready to compete and improve your coding skills?</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-xl hover:shadow-purple-500/10 transition-all border-b-4 border-b-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <Trophy className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{user?.rating || 1200}</div>
                    <p className="text-xs text-muted-foreground">Your competitive rank</p>
                </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-xl hover:shadow-pink-500/10 transition-all border-b-4 border-b-pink-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Experience</CardTitle>
                    <Zap className="h-4 w-4 text-pink-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-pink-600">{user?.xp} XP</div>
                    <p className="text-xs text-muted-foreground">Total platform XP</p>
                </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-xl hover:shadow-orange-500/10 transition-all border-b-4 border-b-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Role</CardTitle>
                    <User className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <Badge variant={user?.role === 'Admin' ? 'default' : 'secondary'} className="text-sm">
                        {user?.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Account privilege level</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
                { title: 'Start Competing', desc: 'Join real-time battles', icon: Target, color: 'purple', tab: 'daily' },
                { title: 'Collaboration', desc: 'Real-time workspaces', icon: Users, color: 'pink', tab: 'workspace' },
                { title: 'Leaderboard', desc: 'Climb the rankings', icon: Share2, color: 'orange', tab: 'leaderboard' },
                { title: 'Achievements', desc: 'Unlock your potential', icon: Award, color: 'blue', tab: 'achievements' },
            ].map((action) => (
                <Card
                    key={action.title}
                    onClick={() => onTabChange(action.tab)}
                    className="cursor-pointer group hover:scale-105 transition-all duration-300 border-none bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-800/30 backdrop-blur-xl shadow-lg"
                >
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className={`w-12 h-12 rounded-2xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center mx-auto text-${action.color}-600 group-hover:rotate-12 transition-transform`}>
                            <action.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">{action.title}</h3>
                            <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);

const FeaturePlaceholder = ({ tab, onBack }: { tab: string, onBack: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in zoom-in duration-500 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="h-10 w-10 text-white animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {tab.replace('-', ' ')}
        </h2>
        <p className="text-muted-foreground text-lg italic">
            This feature is currently under high-priority development. Stay tuned for updates!
        </p>
        <div className="grid grid-cols-2 gap-4 w-full pt-8">
            <Card className="p-6 bg-purple-50/50 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900 border-dashed">
                <Code className="h-6 w-6 mb-2 text-purple-600" />
                <h4 className="font-bold">Next Level Coding</h4>
                <p className="text-xs text-muted-foreground">Advanced algorithms coming soon</p>
            </Card>
            <Card className="p-6 bg-pink-50/50 dark:bg-pink-950/10 border-pink-100 dark:border-pink-900 border-dashed">
                <Gift className="h-6 w-6 mb-2 text-pink-600" />
                <h4 className="font-bold">Exclusive Rewards</h4>
                <p className="text-xs text-muted-foreground">Earn tokens and custom themes</p>
            </Card>
        </div>
        <Button onClick={onBack} className="mt-8 px-8 py-6 text-lg rounded-full shadow-lg shadow-purple-600/20 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all">
            Back to Dashboard
        </Button>
    </div>
);

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [analyticsData, setAnalyticsData] = useState<UserAnalytics | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [selectedPracticeQuestion, setSelectedPracticeQuestion] = useState<number | null>(null);

    useEffect(() => {
        if (activeTab === 'analytics' && !analyticsData && session?.user?.id) {
            const fetchAnalytics = async () => {
                setLoadingAnalytics(true);
                try {
                    const result = await getUserAnalytics(session.user.id);
                    if (result.success && result.analytics) {
                        setAnalyticsData(result.analytics);
                    }
                } catch (error) {
                    console.error('Error fetching analytics:', error);
                } finally {
                    setLoadingAnalytics(false);
                }
            };
            fetchAnalytics();
        }
    }, [activeTab, session?.user?.id, analyticsData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'profile') {
            router.push('/profile');
            // Reset active tab so it doesn't keep redirecting if they go back
            setActiveTab('dashboard');
        }
    }, [activeTab, router]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Final check for renderContent
    const user = session?.user;

    // Content rendering logic
    const renderContent = () => {
        // Admin gets completely different dashboard
        if (user?.role === 'Admin' && (activeTab === 'admin' || activeTab === 'dashboard')) {
            return <AdminPanel />;
        }

        // Banned user restrictions
        const restrictedTabs = ['workspace', 'daily', 'compete', 'practice', 'spectate'];
        if (user?.isCheater && restrictedTabs.includes(activeTab)) {
            return <BannedView />;
        }

        if (activeTab === 'workspace') return <WorkspaceContainer />;
        if (activeTab === 'daily' || activeTab === 'compete') return <CompeteContainer />;
        if (activeTab === 'leaderboard') return <LeaderboardView />;
        if (activeTab === 'achievements') return <AchievementsContent />;
        if (activeTab === 'spectate') return <SpectatorView />;
        if (activeTab === 'practice') {
            if (selectedPracticeQuestion) {
                return (
                    <PracticeArena
                        questionId={selectedPracticeQuestion}
                        onBack={() => setSelectedPracticeQuestion(null)}
                    />
                );
            }
            return (
                <PracticeMode
                    onStartPractice={(qId) => setSelectedPracticeQuestion(Number(qId))}
                    onStartPath={(path) => {
                        const firstQuestionId = path.questions[0];
                        if (firstQuestionId) {
                            setSelectedPracticeQuestion(Number(firstQuestionId));
                            toast.success(`Starting ${path.name}`);
                        } else {
                            toast.error('This path has no questions');
                        }
                    }}
                />
            );
        }
        if (activeTab === 'replays') return <VideoReplay />;
        if (activeTab === 'analytics') {
            return <AnalyticsContent loading={loadingAnalytics} data={analyticsData} />;
        }
        if (activeTab === 'profile') return <LoadingContent />;
        if (activeTab === 'dashboard') {
            return <WelcomeContent user={user} onTabChange={setActiveTab} />;
        }
        return <FeaturePlaceholder tab={activeTab} onBack={() => setActiveTab('dashboard')} />;
    };


    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {status === 'loading' ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
                </div>
            ) : !user ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Redirecting to login...</p>
                </div>
            ) : (
                <>
                    <SideNav
                        username={user.username}
                        role={user.role}
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setSelectedPracticeQuestion(null);
                        }}
                    />
                    <main className="flex-1 transition-all duration-300 md:ml-64 p-8">
                        {renderContent()}
                    </main>
                </>
            )}
        </div>
    );
}
