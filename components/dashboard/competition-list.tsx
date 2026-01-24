'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Trophy, ArrowRight } from 'lucide-react';
import { getCompetitions, joinCompetition } from '@/app/actions/competition';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const CompetitionList: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [competitions, setCompetitions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            const result = await getCompetitions('Waiting');
            if (result.success && result.competitions) {
                setCompetitions(result.competitions);
            }
        } catch (error) {
            console.error('Failed to fetch competitions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const handleJoin = async (id: number) => {
        if (!session?.user?.id) return;

        try {
            const result = await joinCompetition(id, session.user.id);
            if (result.success) {
                toast.success('Joined competition!');
                router.push(`/compete/${id}`); // Navigate to competition page
            } else {
                toast.error(result.error || 'Failed to join');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Challenges</h2>
                <Button variant="outline" size="sm" onClick={fetchCompetitions}>Refresh</Button>
            </div>

            {competitions.length === 0 ? (
                <Card className="text-center p-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-dashed">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold">No active challenges</h3>
                    <p className="text-muted-foreground">Create one and wait for players to join!</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {competitions.map((comp) => (
                        <Card key={comp.id} className="overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-purple-500">
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold">Challenge by {comp.createdBy.username}</h3>
                                            <Badge variant={comp.mode === 'Ai' ? 'default' : 'secondary'}>
                                                {comp.mode} Mode
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {comp.participants.length} / {comp.maxParticipants} Players
                                            </div>
                                            {comp.hasTimeLimit && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {comp.timeLimitMinutes} min
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {comp.participants.slice(0, 3).map((p: any) => (
                                                <div key={p.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                                                    {p.username.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {comp.participants.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                                                    +{comp.participants.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleJoin(comp.id)}
                                            disabled={comp.participants.some((p: any) => p.id === session?.user?.id)}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                                        >
                                            {comp.participants.some((p: any) => p.id === session?.user?.id) ? 'Joined' : 'Join Match'}
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
