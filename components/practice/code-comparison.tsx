'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Zap, Timer, HardDrive, GitCompare, ArrowRight } from 'lucide-react';

interface CodeComparisonProps {
    userCode: string;
    optimalCode: string;
    userTime: string;
    optimalTime: string;
    userSpace: string;
    optimalSpace: string;
    language: string;
}

export function CodeComparison({
    userCode,
    optimalCode,
    userTime,
    optimalTime,
    userSpace,
    optimalSpace,
    language
}: CodeComparisonProps) {
    return (
        <Card className="w-full border-purple-100 dark:border-purple-800 glass-strong">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <GitCompare className="h-5 w-5 text-purple-600" />
                            Optimization Comparison
                        </CardTitle>
                        <CardDescription>Compare your solution with the optimal approach</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30 border-none">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">Your Solution</span>
                                <Badge variant="outline">Complexity: Sub-optimal</Badge>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Timer className="h-3 w-3" />
                                    Time: <span className="text-foreground font-mono">{userTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <HardDrive className="h-3 w-3" />
                                    Space: <span className="text-foreground font-mono">{userSpace}</span>
                                </div>
                            </div>
                            <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-[10px] sm:text-xs overflow-x-auto max-h-[300px] font-mono leading-relaxed">
                                {userCode}
                            </pre>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-500/5 border-purple-500/20">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-purple-600 dark:text-purple-400">Optimal Solution</span>
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Most Efficient
                                </Badge>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Timer className="h-3 w-3" />
                                    Time: <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{optimalTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <HardDrive className="h-3 w-3" />
                                    Space: <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{optimalSpace}</span>
                                </div>
                            </div>
                            <pre className="p-3 bg-gray-900 text-gray-100 rounded-md text-[10px] sm:text-xs overflow-x-auto max-h-[300px] font-mono border border-purple-500/30 leading-relaxed shadow-lg">
                                {optimalCode}
                            </pre>
                        </CardContent>
                    </Card>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <ArrowRight className="h-4 w-4" />
                        Optimization Tips
                    </h4>
                    <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                        The optimal solution achieves <span className="font-bold">{optimalTime}</span> complexity. Consider using better data structures or algorithm paradigms (like sliding windows or hash maps) to reduce redundant operations.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
