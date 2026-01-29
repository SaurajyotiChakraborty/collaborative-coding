'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { submitCode } from '@/app/actions/submission';
import { saveLiveDraft } from '@/app/actions/live-draft';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface CodeArenaProps {
  competitionId: bigint;
  questions: Array<{ questionId: bigint; title: string; description: string; difficulty: string }>;
}

export const CodeArena: React.FC<CodeArenaProps> = ({ competitionId, questions }) => {
  const { data: session } = useSession();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [code, setCode] = useState<string>('// Write your solution here\n');
  const [language, setLanguage] = useState<string>('javascript');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [pasteDetected, setPasteDetected] = useState<boolean>(false);
  const visibilityRef = useRef<boolean>(true);
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Debounced function to save draft for spectators
  const saveDraft = useCallback((newCode: string, lang: string) => {
    if (!session?.user?.id) return;

    // Clear any existing timeout
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }

    // Debounce: save after 300ms of no typing
    draftTimeoutRef.current = setTimeout(async () => {
      try {
        await saveLiveDraft({
          competitionId: Number(competitionId),
          userId: session.user.id,
          code: newCode,
          language: lang
        });
      } catch (error) {
        console.error('Failed to sync draft:', error);
      }
    }, 300);
  }, [session?.user?.id, competitionId]);

  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (document.hidden && visibilityRef.current) {
        setTabSwitchCount((prev) => prev + 1);
        toast.warning(`Tab switching detected! Count: ${tabSwitchCount + 1}`);

        if (tabSwitchCount + 1 >= 3) {
          toast.error('Too many tab switches! You may be flagged as a cheater.');
        }
      }
      visibilityRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabSwitchCount]);

  const handleEditorChange = (value: string | undefined): void => {
    const newCode = value || '';
    setCode(newCode);
    saveDraft(newCode, language);
  };

  const handlePaste = (): void => {
    setPasteDetected(true);
    toast.error('Paste detected! This will be flagged.');
  };

  const handleRunCode = async (): Promise<void> => {
    toast.info('Running test cases...');
    setIsSubmitting(true);

    try {
      const { getQuestions } = await import('@/app/actions/question');
      const { questions: allQuestions } = await getQuestions();
      const question = allQuestions?.find(q => BigInt(q.id) === currentQuestion.questionId);

      if (!question) {
        toast.error('Question not found');
        return;
      }

      const testCases = (question.testCases as any[]).map((tc) => ({
        input: tc.input,
        expectedOutput: tc.output || tc.expectedOutput,
      }));

      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases,
        }),
      });

      if (!response.ok) {
        throw new Error('Code execution failed');
      }

      const result = await response.json() as {
        success: boolean;
        allPassed: boolean;
        results: Array<{ passed: boolean; input: string; expected: string; actual: string | null; error: string | null }>;
        totalTime: number;
        avgMemory: number;
        timeComplexity: string;
        spaceComplexity: string;
      };

      if (result.allPassed) {
        setTestResults(`All test cases passed! Time: ${result.timeComplexity}, Space: ${result.spaceComplexity}`);
        toast.success('All tests passed!');
      } else {
        const failedCount = result.results.filter((r) => !r.passed).length;
        setTestResults(`${failedCount} test case(s) failed. Check the output.`);
        toast.error(`${failedCount} tests failed`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Code execution failed';
      toast.error(errorMessage);
      setTestResults('Execution error. Please check your code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!session?.user) {
      toast.error('Not logged in');
      return;
    }

    if (pasteDetected || tabSwitchCount >= 3) {
      toast.error('Cheating detected! Submission blocked.');
      return;
    }

    setIsSubmitting(true);

    try {
      const allTestsPassed = testResults === 'All test cases passed!';
      const executionTime = Math.floor(Math.random() * 1000) + 100;

      await submitCode({
        userId: session.user.id,
        competitionId: Number(competitionId),
        questionId: Number(currentQuestion.questionId),
        code,
        language,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        allTestsPassed,
        executionTimeMs: executionTime,
      });

      toast.success('Code submitted successfully!');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCode('// Write your solution here\n');
        setTestResults(null);
      } else {
        toast.success('All questions completed! Waiting for results...');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentQuestion?.title || 'Loading...'}</CardTitle>
            <Badge>{currentQuestion?.difficulty || 'Unknown'}</Badge>
          </div>
          <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{currentQuestion?.description || 'Loading question...'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Code Editor</CardTitle>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64 border rounded-md overflow-hidden" onPaste={handlePaste}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>

          {testResults && (
            <div className={`p-3 rounded-md text-sm ${testResults.includes('passed') ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {testResults}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleRunCode} variant="outline" className="flex-1">
              Run Tests
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !testResults?.includes('passed')} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>

          {(tabSwitchCount > 0 || pasteDetected) && (
            <div className="p-3 bg-yellow-100 text-yellow-900 rounded-md text-sm">
              ⚠️ Anti-cheat alerts: {tabSwitchCount > 0 && `${tabSwitchCount} tab switches`} {pasteDetected && 'Paste detected'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
