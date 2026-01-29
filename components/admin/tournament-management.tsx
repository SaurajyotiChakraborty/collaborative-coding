'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, Plus, Loader2, Clock, Trash2 } from 'lucide-react';
import { getQuestions } from '@/app/actions/question';
import { createTournament, getScheduledTournaments } from '@/app/actions/tournament';
import { toast } from 'sonner';

export function TournamentManagement() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [badgeTitle, setBadgeTitle] = useState('');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [maxParticipants, setMaxParticipants] = useState(100);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [questionsRes, tournamentsRes] = await Promise.all([
                getQuestions(),
                getScheduledTournaments()
            ]);
            if (questionsRes.success) setQuestions(questionsRes.questions || []);
            if (tournamentsRes.success) setTournaments(tournamentsRes.tournaments || []);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTournament = async () => {
        if (!title || !startDate || !startTime || !endDate || !endTime || selectedQuestionIds.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsCreating(true);
        try {
            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(`${endDate}T${endTime}`);

            if (endDateTime <= startDateTime) {
                toast.error('End time must be after start time');
                setIsCreating(false);
                return;
            }

            const res = await createTournament({
                title,
                description,
                startTime: startDateTime,
                endTime: endDateTime,
                questionIds: selectedQuestionIds,
                maxParticipants,
                badgeTitle: badgeTitle || undefined
            });

            if (res.success) {
                toast.success('Tournament scheduled successfully!');
                setTitle('');
                setDescription('');
                setStartDate('');
                setStartTime('');
                setEndDate('');
                setEndTime('');
                setBadgeTitle('');
                setSelectedQuestionIds([]);
                fetchData();
            } else {
                toast.error(res.error || 'Failed to create tournament');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    const toggleQuestion = (id: number) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Create Tournament Form */}
                <Card className="glass-strong border-purple-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-purple-600" />
                            Schedule New Tournament
                        </CardTitle>
                        <CardDescription>set date, time, badge and selected challenges</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tournament Title</Label>
                            <Input
                                placeholder="Elite Coding Championship"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="The ultimate test of speed and efficiency..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Winner Badge Title (Optional)</Label>
                            <Input
                                placeholder="e.g. 'Algorithm Master 2024'"
                                value={badgeTitle}
                                onChange={(e) => setBadgeTitle(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">This badge will be awarded to the top 3 winners</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Question Pool</Label>
                            <div className="border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                                {questions.map(q => (
                                    <div
                                        key={q.id}
                                        onClick={() => toggleQuestion(q.id)}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${selectedQuestionIds.includes(q.id)
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        <span className="text-sm truncate">{q.title}</span>
                                        <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Selected: {selectedQuestionIds.length} challenges</p>
                        </div>
                        <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={handleCreateTournament}
                            disabled={isCreating}
                        >
                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                            Schedule Tournament
                        </Button>
                    </CardContent>
                </Card>

                {/* Scheduled Tournaments List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Upcoming Events
                        </CardTitle>
                        <CardDescription>Current scheduled tournaments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            </div>
                        ) : tournaments.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                No scheduled tournaments
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tournaments.map(t => (
                                    <Card key={t.id} className="p-4 border-l-4 border-l-purple-500">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h4 className="font-bold">{t.title}</h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(t.startTime).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {t._count.participants} Joined
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-orange-600 animate-pulse">Scheduled</Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
