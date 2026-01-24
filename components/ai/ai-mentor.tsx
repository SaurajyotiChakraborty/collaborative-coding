'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Lightbulb, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import type { AIMentor } from '@/types/extended-types';

interface AIMentorProps {
  mentor: AIMentor;
  currentQuestionId?: bigint;
  onRequestHint: (level: 'small' | 'medium' | 'large') => void;
  onRequestExplanation: (topic: string) => void;
}

export function AIMentorComponent({ 
  mentor, 
  currentQuestionId,
  onRequestHint, 
  onRequestExplanation 
}: AIMentorProps): JSX.Element {
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text text-2xl">AI Mentor</CardTitle>
        </div>
        <CardDescription>Your personal coding coach powered by AI</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hints" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="explanations">Learn</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="hints" className="space-y-4">
            {currentQuestionId ? (
              <>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-purple-500" />
                    <h3 className="font-bold">Request a Hint</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get progressively detailed hints to help you solve the problem
                  </p>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => onRequestHint('small')}
                      variant="outline"
                      className="justify-between"
                    >
                      <span>Small Hint</span>
                      <Badge variant="secondary">Free</Badge>
                    </Button>
                    <Button
                      onClick={() => onRequestHint('medium')}
                      variant="outline"
                      className="justify-between"
                    >
                      <span>Medium Hint</span>
                      <Badge variant="secondary">10 XP</Badge>
                    </Button>
                    <Button
                      onClick={() => onRequestHint('large')}
                      variant="outline"
                      className="justify-between"
                    >
                      <span>Large Hint</span>
                      <Badge variant="secondary">25 XP</Badge>
                    </Button>
                  </div>
                </div>

                {mentor.hints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">Your Hints</h3>
                    {mentor.hints.map((hint, idx) => (
                      <Card key={hint.id} className="border-purple-200/50 dark:border-purple-800/50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize">{hint.level} Hint</Badge>
                            <Badge variant="secondary">{hint.cost} XP</Badge>
                          </div>
                          <p className="text-sm">{hint.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a competition to receive hints from your AI mentor</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="explanations" className="space-y-4">
            <div className="grid gap-2">
              {['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search'].map(topic => (
                <Button
                  key={topic}
                  variant="outline"
                  onClick={() => {
                    setSelectedTopic(topic);
                    onRequestExplanation(topic);
                  }}
                  className="justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {topic}
                </Button>
              ))}
            </div>

            {mentor.explanations.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-bold">Recent Explanations</h3>
                {mentor.explanations.slice(-3).map((explanation, idx) => (
                  <Card key={idx} className="border-purple-200/50 dark:border-purple-800/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <h4 className="font-bold">{explanation.topic}</h4>
                        <Badge variant="outline" className="capitalize text-xs">
                          {explanation.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{explanation.content}</p>
                      {explanation.examples.length > 0 && (
                        <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-900/30">
                          <p className="text-xs font-semibold mb-1">Examples:</p>
                          {explanation.examples.map((example, i) => (
                            <pre key={i} className="text-xs text-muted-foreground">
                              {example}
                            </pre>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-3">
            {mentor.suggestions.length > 0 ? (
              mentor.suggestions.map((suggestion, idx) => (
                <Card key={idx} className="border-purple-200/50 dark:border-purple-800/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <Badge variant="outline" className="capitalize text-xs">
                        {suggestion.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.content}</p>
                    {suggestion.actionable && (
                      <Button size="sm" variant="outline" className="mt-2">
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete more challenges to receive personalized suggestions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
