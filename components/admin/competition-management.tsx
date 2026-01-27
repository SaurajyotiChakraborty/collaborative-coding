'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Trophy,
    MoreVertical,
    StopCircle,
    Archive,
    RefreshCw,
    Users,
    Clock
} from 'lucide-react';
import { getCompetitions } from '@/app/actions/competition';
import { toast } from 'sonner';

interface Competition {
    id: number;
    mode: string;
    status: string;
    maxParticipants: number;
    participants: any[];
    hasTimeLimit: boolean;
    timeLimitMinutes: number;
    startTime: Date | null;
    createdAt: Date;
    createdBy: { username: string };
}

export function CompetitionManagement() {
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            const result = await getCompetitions();
            if (result.success && result.competitions) {
                setCompetitions(result.competitions as Competition[]);
            }
        } catch (error) {
            toast.error('Failed to fetch competitions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const handleForceEnd = async (id: number) => {
        try {
            const response = await fetch(`/api/admin/competitions/${id}/end`, { method: 'POST' });
            if (response.ok) {
                toast.success('Competition ended');
                fetchCompetitions();
            }
        } catch (error) {
            toast.error('Failed to end competition');
        }
    };

    const handleArchive = async (id: number) => {
        try {
            const response = await fetch(`/api/admin/competitions/${id}/archive`, { method: 'POST' });
            if (response.ok) {
                toast.success('Competition archived');
                fetchCompetitions();
            }
        } catch (error) {
            toast.error('Failed to archive competition');
        }
    };

    const filteredCompetitions = competitions.filter(comp => {
        if (filter === 'active') return comp.status === 'InProgress';
        if (filter === 'completed') return comp.status === 'Completed';
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Waiting': return 'bg-blue-100 text-blue-700';
            case 'InProgress': return 'bg-orange-100 text-orange-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Competition Management
                        </CardTitle>
                        <CardDescription>Manage active and completed competitions</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                        <Button
                            variant={filter === 'active' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </Button>
                        <Button
                            variant={filter === 'completed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchCompetitions}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                ) : filteredCompetitions.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No competitions found</p>
                    </div>
                ) : (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Mode</TableHead>
                                    <TableHead>Players</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time Limit</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCompetitions.map((comp) => (
                                    <TableRow key={comp.id}>
                                        <TableCell className="font-mono">#{comp.id}</TableCell>
                                        <TableCell>{comp.createdBy.username}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{comp.mode}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {comp.participants.length}/{comp.maxParticipants}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(comp.status)}>
                                                {comp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {comp.hasTimeLimit ? (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {comp.timeLimitMinutes}m
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(comp.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {comp.status === 'InProgress' && (
                                                        <DropdownMenuItem
                                                            onClick={() => handleForceEnd(comp.id)}
                                                            className="text-red-600"
                                                        >
                                                            <StopCircle className="h-4 w-4 mr-2" />
                                                            Force End
                                                        </DropdownMenuItem>
                                                    )}
                                                    {comp.status === 'Completed' && (
                                                        <DropdownMenuItem onClick={() => handleArchive(comp.id)}>
                                                            <Archive className="h-4 w-4 mr-2" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
