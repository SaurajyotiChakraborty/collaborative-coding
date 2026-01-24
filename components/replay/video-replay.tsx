'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Video } from 'lucide-react';
import { useSpacetime } from '@/hooks/use-spacetime';

interface ReplayFrame {
  timestamp: number;
  code: string;
  action: string;
}

interface CompetitionReplay {
  competitionId: bigint;
  username: string;
  questionTitle: string;
  finalScore: number;
  duration: number;
  frames: ReplayFrame[];
  language: string;
}

export const VideoReplay: React.FC = () => {
  const { db } = useSpacetime();
  const [replays, setReplays] = useState<CompetitionReplay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<CompetitionReplay | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mockReplays: CompetitionReplay[] = [
      {
        competitionId: BigInt(1),
        username: 'CodeMaster2000',
        questionTitle: 'Two Sum Problem',
        finalScore: 95,
        duration: 180,
        language: 'javascript',
        frames: [
          { timestamp: 0, code: '// Starting solution\n', action: 'Started coding' },
          { timestamp: 30, code: '// Starting solution\nfunction twoSum(nums, target) {\n', action: 'Added function' },
          { timestamp: 60, code: '// Starting solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n', action: 'Created map' },
          { timestamp: 90, code: '// Starting solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n', action: 'Added loop' },
          { timestamp: 120, code: '// Starting solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}', action: 'Completed solution' },
          { timestamp: 150, code: '// Starting solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}', action: 'Added return statement' },
          { timestamp: 180, code: '// Starting solution\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}', action: 'Submitted solution' },
        ],
      },
      {
        competitionId: BigInt(2),
        username: 'AlgoNinja',
        questionTitle: 'Binary Search',
        finalScore: 88,
        duration: 240,
        language: 'python',
        frames: [
          { timestamp: 0, code: '# Binary search implementation\n', action: 'Started coding' },
          { timestamp: 60, code: '# Binary search implementation\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n', action: 'Initialized pointers' },
          { timestamp: 120, code: '# Binary search implementation\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n', action: 'Added while loop' },
          { timestamp: 180, code: '# Binary search implementation\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n', action: 'Added conditions' },
          { timestamp: 240, code: '# Binary search implementation\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1', action: 'Submitted solution' },
        ],
      },
    ];

    setReplays(mockReplays);
  }, []);

  useEffect(() => {
    if (isPlaying && selectedReplay && currentFrame < selectedReplay.frames.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= selectedReplay.frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
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

  const handleSkipForward = (): void => {
    if (selectedReplay && currentFrame < selectedReplay.frames.length - 1) {
      setCurrentFrame(currentFrame + 1);
    }
  };

  const handleSkipBack = (): void => {
    if (currentFrame > 0) {
      setCurrentFrame(currentFrame - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="grid gap-4 md:grid-cols-2">
          {replays.map((replay) => (
            <Card
              key={replay.competitionId.toString()}
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
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{replay.language}</span>
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
                  value={selectedReplay.frames[currentFrame]?.code || ''}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{selectedReplay.frames[currentFrame]?.action}</span>
                  <span className="text-muted-foreground">
                    {formatTime(selectedReplay.frames[currentFrame]?.timestamp || 0)}
                  </span>
                </div>

                <Slider
                  value={[currentFrame]}
                  max={selectedReplay.frames.length - 1}
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
                  <Button size="icon" variant="outline" onClick={handleSkipBack}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={handlePlayPause}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={handleSkipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    <Button
                      size="sm"
                      variant={playbackSpeed === 0.5 ? 'default' : 'outline'}
                      onClick={() => setPlaybackSpeed(0.5)}
                    >
                      0.5x
                    </Button>
                    <Button
                      size="sm"
                      variant={playbackSpeed === 1 ? 'default' : 'outline'}
                      onClick={() => setPlaybackSpeed(1)}
                    >
                      1x
                    </Button>
                    <Button
                      size="sm"
                      variant={playbackSpeed === 2 ? 'default' : 'outline'}
                      onClick={() => setPlaybackSpeed(2)}
                    >
                      2x
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Frame {currentFrame + 1} of {selectedReplay.frames.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
