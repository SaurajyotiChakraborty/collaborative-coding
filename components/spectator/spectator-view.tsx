'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, Code } from 'lucide-react';
import { getCompetitions } from '@/app/actions/competition';

interface ParticipantProgress {
  id: string;
  username: string;
  submissionsCount: number;
}

interface LiveCompetition {
  id: number;
  mode: string;
  participants: any[];
  startTime: Date | null;
  status: string;
}

export const SpectatorView: React.FC = () => {
  const [liveCompetitions, setLiveCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spectatorCount] = useState<number>(Math.floor(Math.random() * 50) + 10);

  const fetchLiveCompetitions = async () => {
    setLoading(true);
    try {
      const result = await getCompetitions('InProgress');
      if (result.success && result.competitions) {
        setLiveCompetitions(result.competitions);
      }
    } catch (error) {
      console.error('Failed to fetch live competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCompetitions();
    const interval = setInterval(fetchLiveCompetitions, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Spectator Mode
              </CardTitle>
              <CardDescription>Watch active coding battles in real-time</CardDescription>
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
          <CardContent className="p-12 text-center">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg font-medium">No live battles at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start a challenge or join one to bring the heat!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {liveCompetitions.map((competition) => (
            <Card
              key={competition.id}
              className="hover:shadow-lg transition-all border-l-4 border-l-orange-500 overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-orange-500" />
                      Battle #{competition.id}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{competition.mode} Mode</Badge>
                      <Badge className="bg-orange-500">Live</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {competition.participants.length} Players
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex -space-x-3 overflow-hidden p-1">
                    {competition.participants.map((p: any) => (
                      <div
                        key={p.id}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-orange-500 flex items-center justify-center text-xs text-white font-bold"
                        title={p.username}
                      >
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Started: {competition.startTime ? new Date(competition.startTime).toLocaleTimeString() : 'Recently'}
                    </div>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      asChild
                    >
                      <a href={`/compete/${competition.id}`}>
                        Spectate Now
                      </a>
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
