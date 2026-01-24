import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Trophy, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CompetePage() {
    // Mock data - will be replaced with real data from server actions
    const activeCompetitions = [
        {
            id: 1,
            mode: 'Human',
            participants: 3,
            maxParticipants: 4,
            status: 'Waiting',
            timeLimit: 60,
        },
        {
            id: 2,
            mode: 'AI',
            participants: 1,
            maxParticipants: 1,
            status: 'InProgress',
            timeLimit: 30,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Competitions</h1>
                    <p className="text-muted-foreground">Join or create coding competitions</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Competition
                </Button>
            </div>

            {/* Active Competitions */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Active Competitions</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {activeCompetitions.map((comp) => (
                        <Card key={comp.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Competition #{comp.id}</CardTitle>
                                    <Badge variant={comp.status === 'Waiting' ? 'secondary' : 'default'}>
                                        {comp.status}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {comp.mode} vs {comp.mode === 'AI' ? 'AI' : 'Human'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        {comp.participants}/{comp.maxParticipants} players
                                    </span>
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {comp.timeLimit} min
                                    </span>
                                </div>
                                <Button className="w-full" variant={comp.status === 'Waiting' ? 'default' : 'outline'}>
                                    {comp.status === 'Waiting' ? 'Join Competition' : 'Spectate'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Past Competitions */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Recent Competitions</h2>
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div>
                                    <p className="font-medium">Competition #42</p>
                                    <p className="text-sm text-muted-foreground">2 hours ago • 4 players</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Trophy className="h-3 w-3 text-yellow-600" />
                                        1st Place
                                    </Badge>
                                    <span className="text-sm text-green-600">+100 XP</span>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
