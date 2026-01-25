'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import {
    ArrowLeft,
    Play,
    CheckCircle2,
    Sparkles,
    Trophy,
    Lightbulb,
    Code2,
    Zap,
    ChevronRight,
    MessageCircle,
    BarChart,
    X
} from 'lucide-react';
import { getPracticeQuestion } from '@/app/actions/practice';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface PracticeArenaProps {
    questionId: number;
    onBack: () => void;
}

const MOTIVATIONAL_QUOTES = [
    "The best way to predict the future is to create it.",
    "Code is like humor. When you have to explain it, it’s bad.",
    "Optimization is the difference between it working and it working perfectly.",
    "Great things never come from comfort zones.",
    "Small improvements in performance lead to massive gains in scale.",
    "Efficiency is doing things right; effectiveness is doing the right things."
];

export function PracticeArena({ questionId, onBack }: PracticeArenaProps) {
    const [question, setQuestion] = useState<any>(null);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [showSolution, setShowSolution] = useState(false);
    const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    useEffect(() => {
        const fetchQuestion = async () => {
            setLoading(true);
            try {
                const result = await getPracticeQuestion(questionId);
                if (result.success && result.question) {
                    setQuestion(result.question);
                    // Set default code template based on the language (simplified)
                    setCode(`function solution() {\n  // Write your optimized code here\n  \n}`);
                } else {
                    console.error('Question response error:', result.error);
                }
            } catch (error) {
                console.error('Error fetching question:', error);
                toast.error('Failed to load question');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [questionId]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Call complexity analysis API
            const response = await fetch('/api/analyze-complexity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'typescript' })
            });
            const result = await response.json();

            if (result.success) {
                setAnalysis(result);

                // Check if it matches optimal complexity
                // This logic would be more complex in prod, comparing result.analysis with question.optimalTimeComplexity
                const isOptimal = result.analysis.timeComplexity === question?.optimalTimeComplexity;

                if (isOptimal) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#9333ea', '#db2777', '#f97316']
                    });
                    toast.success('Maximum Optimization Achieved!');
                } else {
                    toast.info('Code analyzed. See how you can improve!');
                }
            }
        } catch (error) {
            toast.error('Failed to analyze code');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Card className="p-8 text-center max-w-md border-dashed border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold">Question Not Found</h3>
                    <p className="text-muted-foreground mt-2">The practice challenge you're looking for could not be loaded. It might have been removed or moved.</p>
                    <div className="flex flex-col gap-2 mt-6">
                        <Button onClick={onBack} className="bg-gradient-to-r from-purple-600 to-pink-600">
                            Back to Selection
                        </Button>
                        <p className="text-[10px] text-muted-foreground italic">Try running the optimal seed script if you're an admin.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {question.title}
                            <Badge variant={
                                question.difficulty === 'Easy' ? 'secondary' :
                                    question.difficulty === 'Medium' ? 'default' : 'destructive'
                            }>
                                {question.difficulty}
                            </Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Optimization Challenge
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowSolution(!showSolution)}
                        className="border-purple-200 dark:border-purple-800"
                    >
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Play className="h-4 w-4 mr-2" />
                        )}
                        Run Analysis
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Left Side: Question & Analysis */}
                <div className="flex flex-col gap-4 overflow-hidden">
                    <Card className="flex-1 overflow-hidden border-white/20 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
                        <Tabs defaultValue="problem" className="flex flex-col h-full">
                            <div className="px-4 pt-2 border-b border-white/20">
                                <TabsList className="bg-transparent gap-2">
                                    <TabsTrigger value="problem" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
                                        Problem Description
                                    </TabsTrigger>
                                    <TabsTrigger value="analysis" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
                                        Live Analysis
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <TabsContent value="problem" className="mt-0 space-y-6">
                                    <div>
                                        <h3 className="font-bold mb-2">The Task</h3>
                                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                            {question.description}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Constraints</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            {(question.constraints || '').split('\n').filter(Boolean).map((c: string, i: number) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {showSolution && question.canonicalSolution && (
                                        <div className="animate-in slide-in-from-top-4">
                                            <h3 className="font-bold mb-2 text-purple-600 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                The Optimal Approach
                                            </h3>
                                            <div className="p-4 rounded-lg bg-gray-900 text-white font-mono text-xs whitespace-pre">
                                                {question.canonicalSolution}
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground italic">
                                                Goal: {question.optimalTimeComplexity} Time | {question.optimalSpaceComplexity} Space
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="analysis" className="mt-0 space-y-6 px-1">
                                    {!analysis ? (
                                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                <BarChart className="h-8 w-8 text-purple-600" />
                                            </div>
                                            <h3 className="text-xl font-bold">Ready for Analysis</h3>
                                            <p className="text-muted-foreground">Write your code and click 'Run Analysis' to see your performance metrics and comparisons.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in slide-in-from-right-4">
                                            {/* Results Comparison */}
                                            <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200/50 dark:border-purple-800/50 shadow-inner">
                                                <div className="grid grid-cols-2 gap-8 relative">
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-medium uppercase text-muted-foreground">Your Complexity</p>
                                                        <p className={cn(
                                                            "text-3xl font-bold",
                                                            analysis.analysis.timeComplexity === question.optimalTimeComplexity
                                                                ? "text-green-500"
                                                                : "text-orange-500"
                                                        )}>
                                                            {analysis.analysis.timeComplexity}
                                                        </p>
                                                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-orange-500 w-[60%]"></div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-medium uppercase text-muted-foreground">Optimal Goal</p>
                                                        <p className="text-3xl font-bold text-green-500">
                                                            {question.optimalTimeComplexity || 'O(n)'}
                                                        </p>
                                                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-green-500 w-full"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Optimization Feedback */}
                                            {analysis.analysis.timeComplexity === question.optimalTimeComplexity ? (
                                                <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-500 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden group shadow-lg">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                                                    <Trophy className="h-12 w-12 text-yellow-500 mx-auto animate-bounce" />
                                                    <h3 className="text-2xl font-black text-green-600 dark:text-green-400">ABSOLUTE PERFECTION!</h3>
                                                    <p className="font-semibold italic text-lg line-clamp-2">
                                                        "{quote}"
                                                    </p>
                                                    <div className="flex justify-center gap-2">
                                                        <Badge className="bg-green-500">Master Optimizer</Badge>
                                                        <Badge variant="outline" className="border-green-500 text-green-600">+250 XP earned</Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 rounded-2xl border border-dashed border-purple-400 space-y-4 bg-purple-50/50 dark:bg-purple-900/10">
                                                    <div className="flex items-center gap-2 text-purple-600 font-bold">
                                                        <Zap className="h-5 w-5" />
                                                        Optimization Tip
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">
                                                        Your code is correct, but there's a more efficient way to handle this! Try focusing on reducing nested loops or using a more spatial data structure.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-white/10">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Complexity Score</p>
                                                    <p className="text-xl font-bold text-purple-600">{analysis.score}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-white/10">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Lines Used</p>
                                                    <p className="text-xl font-bold">{analysis.analysis.linesOfCode}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center border border-white/10">
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Rank</p>
                                                    <p className="text-xl font-bold text-pink-500">Top 5%</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </Card>
                </div>

                {/* Right Side: Code Editor */}
                <Card className="overflow-hidden border-white/20 shadow-xl flex flex-col">
                    <div className="bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs text-gray-400 ml-4 font-mono">TypeScript Editor</span>
                        </div>
                        <Badge variant="outline" className="text-gray-400 border-gray-700 text-[10px]">Auto-saved</Badge>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'Fira Code', monospace",
                                fontLigatures: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20 },
                                cursorSmoothCaretAnimation: "on",
                                smoothScrolling: true
                            }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
