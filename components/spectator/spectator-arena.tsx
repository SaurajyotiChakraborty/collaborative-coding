'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import { Eye, Users, ArrowLeft, Code2, Trophy, RefreshCcw, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { getCompetitionById, getCompetitionRankings } from '@/app/actions/competition';
import { getLatestSubmission } from '@/app/actions/submission';
import { getLiveDraft } from '@/app/actions/live-draft';
import { cn } from '@/lib/utils';

interface SpectatorArenaProps {
    competitionId: number;
    onBack: () => void;
}

interface Participant {
    id: string;
    username: string;
}

interface Question {
    id: number;
    title: string;
    description: string;
    difficulty: string;
}

export function SpectatorArena({ competitionId, onBack }: SpectatorArenaProps) {
    const [competition, setCompetition] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [liveCode, setLiveCode] = useState<string>('// Waiting for participant to submit code...');
    const [codeLanguage, setCodeLanguage] = useState<string>('javascript');
    const [submissionStatus, setSubmissionStatus] = useState<{ passed: boolean; time: string } | null>(null);
    const [rankings, setRankings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<string>('code');
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compResult, rankResult] = await Promise.all([
                    getCompetitionById(competitionId),
                    getCompetitionRankings(competitionId)
                ]);

                if (compResult.success && compResult.competition) {
                    setCompetition(compResult.competition);
                    // Select first participant by default
                    if (compResult.competition.participants.length > 0 && !selectedParticipant) {
                        setSelectedParticipant(compResult.competition.participants[0]);
                    }
                    // Set first question if available
                    if (compResult.competition.questions?.length > 0) {
                        setCurrentQuestion(compResult.competition.questions[0]);
                    }
                }
                if (rankResult.success && rankResult.rankings) {
                    setRankings(rankResult.rankings);
                }
            } catch (error) {
                console.error('Failed to fetch spectator data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [competitionId]);

    // Fetch the actual live code for the selected participant
    useEffect(() => {
        if (!selectedParticipant || !competitionId) return;

        const fetchLiveCode = async () => {
            try {
                // First try to get live draft (real-time typing)
                const draftResult = await getLiveDraft(competitionId, selectedParticipant.id);

                if (draftResult.success && draftResult.draft) {
                    setLiveCode(draftResult.draft.code);
                    setCodeLanguage(draftResult.draft.language || 'javascript');
                    setSubmissionStatus({
                        passed: false, // Draft, not submitted yet
                        time: `Draft: ${new Date(draftResult.draft.updatedAt).toLocaleTimeString()}`
                    });
                    return;
                }

                // Fall back to latest submission if no draft
                const result = await getLatestSubmission(competitionId, selectedParticipant.id);
                if (result.success && result.submission) {
                    setLiveCode(result.submission.code);
                    setCodeLanguage(result.submission.language || 'javascript');
                    setSubmissionStatus({
                        passed: result.submission.allTestsPassed,
                        time: new Date(result.submission.submittedAt).toLocaleTimeString()
                    });
                } else {
                    setLiveCode(`// ${selectedParticipant.username} hasn't started coding yet.\n// Their code will appear here in real-time.`);
                    setSubmissionStatus(null);
                }
            } catch (error) {
                console.error('Failed to fetch live code:', error);
            }
        };

        fetchLiveCode();
        // Poll for new code every 2 seconds for near real-time experience
        const interval = setInterval(fetchLiveCode, 2000);
        return () => clearInterval(interval);
    }, [selectedParticipant, competitionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!competition) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Eye className="h-12 w-12 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">Competition not found.</p>
                <Button onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-orange-500/10 dark:bg-orange-900/20 p-4 rounded-xl backdrop-blur-sm border border-orange-500/20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Eye className="h-5 w-5 text-orange-500" />
                            Spectating: {competition.title || `Battle #${competition.id}`}
                            <Badge className="bg-orange-500 animate-pulse">LIVE</Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {competition.mode} Mode • {competition.participants.length} Participants
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {Math.floor(Math.random() * 20) + 5} watching
                    </Badge>
                </div>
            </div>

            {/* Main Content: 1:4 Ratio */}
            <div className="flex-1 grid grid-cols-5 gap-4 min-h-0">
                {/* Left Panel: Participants List (1 part) */}
                <div className="col-span-1 flex flex-col gap-4">
                    <Card className="flex-1 overflow-hidden border-orange-500/20">
                        <CardHeader className="py-3 border-b border-orange-500/10">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                Participants
                            </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-2">
                            <div className="space-y-2">
                                {competition.participants.map((p: Participant, idx: number) => {
                                    const rank = rankings.find(r => r.userId === p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedParticipant(p)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left border",
                                                selectedParticipant?.id === p.id
                                                    ? "bg-orange-500/10 border-orange-500"
                                                    : "bg-white/50 dark:bg-gray-800/50 border-transparent hover:border-orange-500/50"
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {p.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium text-sm truncate">{p.username}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {rank?.correctCount || 0} solved
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>

                {/* Right Panel: Tabs for Code/Question (4 parts) */}
                <div className="col-span-4">
                    <Card className="h-full overflow-hidden border-orange-500/20 flex flex-col">
                        {/* Tab Header */}
                        <div className="bg-gray-900 p-2 border-b border-gray-800 flex items-center justify-between">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex items-center justify-between w-full">
                                    <TabsList className="bg-gray-800">
                                        <TabsTrigger value="code" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                                            <Code2 className="h-4 w-4 mr-2" />
                                            Live Code
                                        </TabsTrigger>
                                        <TabsTrigger value="question" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Problem
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="flex items-center gap-2">
                                        {submissionStatus && (
                                            <Badge variant="outline" className={cn(
                                                "text-[10px] flex items-center gap-1",
                                                submissionStatus.passed ? "text-green-400 border-green-400/30" : "text-red-400 border-red-400/30"
                                            )}>
                                                {submissionStatus.passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                Last: {submissionStatus.time}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-orange-400 border-orange-400/30 text-[10px] flex items-center gap-1">
                                            <RefreshCcw className="h-3 w-3 animate-spin" />
                                            READ-ONLY
                                        </Badge>
                                    </div>
                                </div>
                            </Tabs>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 min-h-0">
                            {activeTab === 'code' && (
                                <div className="h-full bg-[#1e1e1e]">
                                    <Editor
                                        height="100%"
                                        defaultLanguage={codeLanguage}
                                        language={codeLanguage}
                                        theme="vs-dark"
                                        value={liveCode}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily: "'Fira Code', monospace",
                                            fontLigatures: true,
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            padding: { top: 20 },
                                            domReadOnly: true,
                                            cursorStyle: 'underline-thin',
                                        }}
                                    />
                                </div>
                            )}
                            {activeTab === 'question' && currentQuestion && (
                                <ScrollArea className="h-full p-6 bg-gray-900">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-white">{currentQuestion.title}</h2>
                                            <Badge className={cn(
                                                currentQuestion.difficulty === 'Easy' && 'bg-green-500',
                                                currentQuestion.difficulty === 'Medium' && 'bg-yellow-500',
                                                currentQuestion.difficulty === 'Hard' && 'bg-red-500',
                                            )}>
                                                {currentQuestion.difficulty}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">
                                            {currentQuestion.description}
                                        </CardDescription>
                                        {competition.questions.length > 1 && (
                                            <div className="pt-4 border-t border-gray-700">
                                                <p className="text-sm text-muted-foreground mb-2">Problems in this match:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {competition.questions.map((q: Question) => (
                                                        <Button
                                                            key={q.id}
                                                            variant={currentQuestion.id === q.id ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => setCurrentQuestion(q)}
                                                            className={cn(currentQuestion.id === q.id && "bg-blue-600")}
                                                        >
                                                            {q.title}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            )}
                            {activeTab === 'question' && !currentQuestion && (
                                <div className="h-full flex items-center justify-center bg-gray-900">
                                    <p className="text-muted-foreground">No question data available.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
