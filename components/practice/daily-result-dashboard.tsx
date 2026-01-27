'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Trophy, Star, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface DailyResultProps {
    challenges: any[];
    submissions: any[];
    onClose: () => void;
}

export function DailyResultDashboard({ challenges, submissions, onClose }: DailyResultProps) {
    const solvedCount = submissions.filter(s => s.allTestsPassed).length;
    const totalXP = solvedCount * 50 + (solvedCount === 3 ? 100 : 0); // Bonus for all 3

    return (
        <Card className="max-w-2xl mx-auto border-purple-200 dark:border-purple-800 glass-strong shadow-2xl">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-2">
                    <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl font-extrabold gradient-text">Daily Challenge Complete!</CardTitle>
                <CardDescription>You've earned {totalXP} XP today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl text-center space-y-1">
                        <div className="text-2xl font-bold">{solvedCount}/3</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Solved</div>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-xl text-center space-y-1">
                        <div className="text-2xl font-bold text-purple-600">+{totalXP}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">XP Earned</div>
                    </div>
                    <div className="p-4 bg-orange-500/10 rounded-xl text-center space-y-1">
                        <div className="text-2xl font-bold text-orange-600">
                            {solvedCount === 3 ? '100%' : Math.round((solvedCount / 3) * 100) + '%'}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Strength</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Today's Recap
                    </h4>
                    {challenges.map((q, idx) => {
                        const sub = submissions.find(s => s.questionId === q.id);
                        const isSolved = sub?.allTestsPassed;

                        return (
                            <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                                <div className="flex items-center gap-3">
                                    {isSolved ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <div className="text-sm font-bold">{q.title}</div>
                                        <div className="text-[10px] text-muted-foreground">{idx === 0 ? 'Easy' : idx === 1 ? 'Medium' : 'Hard'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {sub && !isSolved && (
                                        <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200">
                                            Sub-optimal
                                        </Badge>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <Button onClick={onClose} variant="outline" className="flex-1">
                        Back to Practice
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                        Continue Learning
                        <Zap className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
