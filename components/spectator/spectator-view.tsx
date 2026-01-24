'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSpacetime } from '@/hooks/use-spacetime';
import { Eye, Users, Clock, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ParticipantProgress {
  username: string;
  questionsCompleted: number;
  totalQuestions: number;
  currentQuestion: string;
  lastActivity: Date;
}

interface LiveCompetition {
  competitionId: bigint;
  mode: string;
  participants: ParticipantProgress[];
  timeRemaining: number;
  status: string;
}

export const SpectatorView: React.FC = () => {
  // const { db } = useSpacetime(); // Removed
  const [liveCompetitions, setLiveCompetitions] = useState<LiveCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<LiveCompetition | null>(null);
  const [spectatorCount] = useState<number>(Math.floor(Math.random() * 50) + 10);

  // Removed SpacetimeDB subscription logic
  // In production, this would fetch from Server Actions or WebSocket

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Spectator Mode
              </CardTitle>
              <CardDescription>Watch live competitions in real-time</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {spectatorCount} watching
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {liveCompetitions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No live competitions at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon to watch coders compete!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {liveCompetitions.map((competition) => (
            <Card
              key={competition.competitionId.toString()}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCompetition(competition)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {competition.mode} Competition
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {competition.participants.length}
                    </Badge>
                    {competition.timeRemaining > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(competition.timeRemaining)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {competition.participants.map((participant, index) => (
                      <div key={index} className="space-y-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{participant.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {participant.questionsCompleted}/{participant.totalQuestions} completed
                          </span>
                        </div>
                        <Progress
                          value={(participant.questionsCompleted / participant.totalQuestions) * 100}
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Working on: {participant.currentQuestion}</span>
                          <span>Active {Math.floor((Date.now() - participant.lastActivity.getTime()) / 1000)}s ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCompetition && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Live Competition Details</CardTitle>
            <CardDescription>Real-time updates every 5 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{selectedCompetition.participants.length}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {selectedCompetition.participants.reduce((sum, p) => sum + p.questionsCompleted, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (selectedCompetition.participants.reduce((sum, p) => sum + p.questionsCompleted, 0) /
                        (selectedCompetition.participants.length * selectedCompetition.participants[0]?.totalQuestions || 1)) *
                      100
                    )}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
