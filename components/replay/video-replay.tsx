'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Video } from 'lucide-react';
import { getCompetitionReplays } from '@/app/actions/replay';

interface ReplayEntry {
  competitionId: number;
  username: string;
  questionTitle: string;
  finalScore: number;
  duration: number;
  language: string;
  code: string;
}

export const VideoReplay: React.FC = () => {
  const [replays, setReplays] = useState<ReplayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReplay, setSelectedReplay] = useState<ReplayEntry | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchReplays = async () => {
      setLoading(true);
      try {
        const result = await getCompetitionReplays(20);
        if (result.success && result.replays) {
          setReplays(result.replays as ReplayEntry[]);
        }
      } catch (error) {
        console.error('Failed to fetch replays:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReplays();
  }, []);

  // Generate frames from code by splitting into lines for animation
  const generateFrames = (code: string) => {
    const lines = code.split('\n');
    return lines.map((_, idx) => ({
      timestamp: idx * 5,
      code: lines.slice(0, idx + 1).join('\n'),
      action: idx === lines.length - 1 ? 'Completed' : 'Typing...'
    }));
  };

  useEffect(() => {
    if (isPlaying && selectedReplay) {
      const frames = generateFrames(selectedReplay.code);
      if (currentFrame < frames.length - 1) {
        intervalRef.current = setInterval(() => {
          setCurrentFrame((prev) => {
            if (prev >= frames.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          });
        }, 1000 / playbackSpeed);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, selectedReplay, currentFrame, playbackSpeed]);

  const handlePlayPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = (): void => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading replays...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Competition Replays
          </CardTitle>
          <CardDescription>Watch how top coders solved challenges</CardDescription>
        </CardHeader>
      </Card>

      {!selectedReplay ? (
        replays.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No replays available yet. Complete a competition to see your replay here!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {replays.map((replay, idx) => (
              <Card
                key={`${replay.competitionId}-${idx}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedReplay(replay);
                  setCurrentFrame(0);
                  setIsPlaying(false);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{replay.questionTitle}</CardTitle>
                    <Badge>{replay.finalScore} pts</Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-medium">{replay.username}</span>
                      <span>•</span>
                      <span>{formatTime(replay.duration)}</span>
                      <span>•</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{replay.language}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Watch Replay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedReplay.questionTitle}</CardTitle>
                  <CardDescription>
                    {selectedReplay.username} • {formatTime(selectedReplay.duration)} • Score: {selectedReplay.finalScore}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedReplay(null)}>
                  Back to List
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-96 border rounded-md overflow-hidden">
                <Editor
                  height="100%"
                  language={selectedReplay.language}
                  value={generateFrames(selectedReplay.code)[currentFrame]?.code || ''}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </div>

              <div className="space-y-3">
                <Slider
                  value={[currentFrame]}
                  max={generateFrames(selectedReplay.code).length - 1}
                  step={1}
                  onValueChange={(value) => {
                    setCurrentFrame(value[0] || 0);
                    setIsPlaying(false);
                  }}
                  className="w-full"
                />

                <div className="flex items-center justify-center gap-2">
                  <Button size="icon" variant="outline" onClick={handleRestart}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => setCurrentFrame(c => Math.min(c + 1, generateFrames(selectedReplay.code).length - 1))}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    {[0.5, 1, 2].map(speed => (
                      <Button
                        key={speed}
                        size="sm"
                        variant={playbackSpeed === speed ? 'default' : 'outline'}
                        onClick={() => setPlaybackSpeed(speed)}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Frame {currentFrame + 1} of {generateFrames(selectedReplay.code).length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
