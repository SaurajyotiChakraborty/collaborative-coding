'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getCompetitionById } from '@/app/actions/competition';
import { CodeArena } from '@/components/competition/code-arena';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function CompetitionArenaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const [competition, setCompetition] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompetition = async () => {
        try {
            const result = await getCompetitionById(Number(id));
            if (result.success && result.competition) {
                setCompetition(result.competition);
            } else {
                toast.error(result.error || 'Competition not found');
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to fetch competition:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        if (authStatus === 'authenticated') {
            fetchCompetition();
        }
    }, [id, authStatus]);

    // Polling for status updates if in Waiting state
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (competition?.status === 'Waiting') {
            interval = setInterval(fetchCompetition, 3000);
        }
        return () => clearInterval(interval);
    }, [competition?.status]);

    if (loading || authStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!competition) return null;

    if (competition.status === 'Waiting') {
        return (
            <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-2xl border-purple-500/20">
                    <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Users className="h-10 w-10 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold">Waiting for Lobbies</CardTitle>
                        <CardDescription className="text-lg">
                            {competition.participants.length} / {competition.maxParticipants} players joined
                        </CardDescription>
                    </div>

                    <div className="grid gap-4">
                        {competition.participants.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                    {p.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{p.username}</span>
                                {p.id === competition.createdById && <Badge variant="secondary" className="ml-auto">Host</Badge>}
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-muted-foreground animate-bounce">
                        The match will start automatically once the lobby is full...
                    </p>

                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Exit Lobby
                    </Button>
                </Card>
            </div>
        );
    }

    if (competition.status === 'InProgress') {
        // Map questions to the format CodeArena expects
        const mappedQuestions = competition.questions.map((q: any) => ({
            questionId: BigInt(q.id),
            title: q.title,
            description: q.description,
            difficulty: q.difficulty.toString(),
        }));

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-4">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            <div>
                                <h1 className="text-xl font-bold">Competition Arena</h1>
                                <p className="text-xs text-muted-foreground">Match #{competition.id} • {competition.mode} Mode</p>
                            </div>
                        </div>
                        {competition.hasTimeLimit && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg font-mono font-bold border border-red-200 dark:border-red-800">
                                <Clock className="h-4 w-4" />
                                <span>TIMER ACTIVATED</span>
                            </div>
                        )}
                    </div>

                    <CodeArena
                        competitionId={BigInt(competition.id)}
                        questions={mappedQuestions}
                    />
                </div>
            </div>
        );
    }

    if (competition.status === 'Completed') {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <Card className="max-w-2xl w-full p-8 text-center space-y-6">
                    <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
                    <CardTitle className="text-3xl font-bold">Match Completed!</CardTitle>
                    <CardDescription>Final results are being calculated...</CardDescription>
                    <Button onClick={() => router.push('/dashboard')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return null;
}
