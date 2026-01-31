'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { createCompetition } from '@/app/actions/competition';
import { getQuestions } from '@/app/actions/question';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CompetitionCreatorProps {
  onCreated?: () => void;
}

export const CompetitionCreator: React.FC<CompetitionCreatorProps> = ({ onCreated }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [mode, setMode] = useState<'ai' | 'human'>('human');
  const [participants, setParticipants] = useState<number>(2);
  const [hasTimeLimit, setHasTimeLimit] = useState<boolean>(false);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [availableQuestions, setAvailableQuestions] = useState<Array<{ questionId: bigint; title: string; difficulty: string }>>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setCurrentUser(session.user);
    }

    // Fetch questions
    const fetchQuestions = async () => {
      const { questions, success } = await getQuestions();
      if (success && questions) {
        const mapped = questions.map((q: any) => ({
          questionId: BigInt(q.id),
          title: q.title,
          difficulty: q.difficulty
        }));
        setAvailableQuestions(mapped);
        if (mapped.length >= 3 && selectedQuestions.length === 0) {
          setSelectedQuestions(mapped.slice(0, 3).map((q: any) => q.questionId));
        }
      }
    };
    fetchQuestions();
  }, [status, session, selectedQuestions.length]);

  const handleCreateCompetition = async (): Promise<void> => {
    if (selectedQuestions.length !== 3) {
      toast.error('Please select exactly 3 questions');
      return;
    }

    if (!session?.user) {
      toast.error('You must be logged in to create a competition');
      return;
    }

    setIsLoading(true);

    try {
      const userId = session.user.id;

      const result = await createCompetition({
        mode: mode === 'ai' ? 'Ai' : 'Human',
        maxParticipants: mode === 'ai' ? 1 : participants,
        questionIds: selectedQuestions.map(id => Number(id)),
        hasTimeLimit,
        timeLimitMinutes: hasTimeLimit ? timeLimit : 0,
        createdById: userId
      });

      if (result.success && (result as any).competition) {
        toast.success(`Competition created! ${mode === 'human' ? 'Waiting for players...' : 'Starting AI match...'}`);
        onCreated?.();
        router.push(`/compete/${(result as any).competition.id}`);
      } else {
        toast.error(result.error || 'Failed to create competition');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create competition';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Competition</CardTitle>
        <CardDescription>Choose your challenge settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Competition Mode</Label>
          <Select value={mode} onValueChange={(value: string) => setMode(value as 'ai' | 'human')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="human">Compete with Humans</SelectItem>
              <SelectItem value="ai">Compete with AI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === 'human' && (
          <div className="space-y-2">
            <Label>Number of Participants (1-8)</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={participants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParticipants(Number(e.target.value))}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="time-limit">Time Limit</Label>
          <Switch
            id="time-limit"
            checked={hasTimeLimit}
            onCheckedChange={setHasTimeLimit}
          />
        </div>

        {hasTimeLimit && (
          <div className="space-y-2">
            <Label>Time Limit (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={120}
              value={timeLimit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeLimit(Number(e.target.value))}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Available Questions ({availableQuestions.length})</Label>
          {availableQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions available. Contact admin to add questions.</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {selectedQuestions.length === 3 ? '3 questions automatically selected' : 'Select 3 questions'}
            </p>
          )}
        </div>

        <Button
          onClick={handleCreateCompetition}
          disabled={isLoading || selectedQuestions.length !== 3 || availableQuestions.length === 0}
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Competition'}
        </Button>
      </CardContent>
    </Card>
  );
};
