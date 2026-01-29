'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Clock, Loader2, Users, Target, ShieldCheck } from 'lucide-react';
import { getScheduledTournaments, joinTournament, getCompletedTournaments } from '@/app/actions/tournament';
import { toast } from 'sonner';

export function TournamentView() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [completedTournaments, setCompletedTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const [scheduledRes, completedRes] = await Promise.all([
                getScheduledTournaments(),
                getCompletedTournaments()
            ]);

            if (scheduledRes.success) {
                setTournaments(scheduledRes.tournaments || []);
            }
            if (completedRes.success) {
                setCompletedTournaments(completedRes.tournaments || []);
            }
        } catch (error) {
            toast.error('Failed to load tournaments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleJoin = async (id: number) => {
        try {
            const res = await joinTournament(id);
            if (res.success) {
                toast.success('Successfully joined the tournament!');
                fetchTournaments();
            } else {
                toast.error(res.error || 'Failed to join');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <p className="text-muted-foreground animate-pulse">Loading arena...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                        Global Tournaments
                    </h1>
                    <p className="text-muted-foreground mt-2">Compete with the best and climb the worldwide rankings</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-xl flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-purple-600" />
                        <span className="font-bold text-purple-600">Legendary Rewards</span>
                    </div>
                </div>
            </div>

            {/* Upcoming Tournaments */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-purple-600" />
                    Upcoming Events
                </h2>

                {tournaments.length === 0 ? (
                    <Card className="border-2 border-dashed p-12 text-center bg-gray-50/50 dark:bg-gray-900/20">
                        <CardContent className="space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <Clock className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold italic">No Upcoming Tournaments</h3>
                            <p className="text-muted-foreground">Stay tuned for the next major event!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {tournaments.map((t) => (
                            <Card key={t.id} className="group overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border-purple-500/10 glass">
                                <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />
                                <CardHeader className="relative">
                                    <Badge className="absolute top-4 right-4 bg-orange-100 text-orange-600 hover:bg-orange-100 border-none animate-pulse">
                                        Upcoming
                                    </Badge>
                                    <CardTitle className="text-2xl pt-2">{t.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-[3rem] italic">
                                        {t.description || "The ultimate test of speed and logic."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Start</p>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                                {new Date(t.startTime).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">End</p>
                                            <div className="flex items-center gap-2 font-semibold">
                                                <Clock className="h-4 w-4 text-pink-600" />
                                                {t.endTime ? new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:scale-[1.02] transition-transform shadow-lg shadow-purple-600/20 rounded-2xl"
                                        onClick={() => handleJoin(t.id)}
                                    >
                                        Participate Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Tournaments */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Past Winners
                </h2>

                {completedTournaments.length === 0 ? (
                    <p className="text-muted-foreground italic">No past tournaments recorded yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {completedTournaments.map((t) => (
                            <Card key={t.id} className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{t.title}</h3>
                                        <p className="text-xs text-muted-foreground">Ended {new Date(t.endTime).toLocaleDateString()}</p>
                                    </div>
                                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                        {t.rankings.length} Winners
                                    </Badge>
                                </div>
                                <div className="p-0">
                                    {t.rankings.map((r: any, i: number) => (
                                        <div key={r.userId} className={`flex items-center gap-4 p-4 ${i === 0 ? 'bg-yellow-500/5 dark:bg-yellow-500/10' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                                                #{i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{r.username}</span>
                                                    {r.achievements?.slice(0, 2).map((a: string) => (
                                                        <Badge key={a} variant="secondary" className="text-[10px] px-1 h-4">{a}</Badge>
                                                    ))}
                                                </div>
                                                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                                    <span>✓ {r.correctCount} solved</span>
                                                    <span>⏱ {(r.totalTime / 1000).toFixed(1)}s</span>
                                                </div>
                                            </div>
                                            {i === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
