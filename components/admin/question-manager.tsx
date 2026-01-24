'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { createQuestion } from '@/app/actions/question';
import { getSession } from '@/lib/auth';
// import { QuestionDifficulty } from '@/spacetime_module_bindings'; // Removed
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface GeneratedQuestion {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  tags: string[];
  constraints: string;
}

export const QuestionManager: React.FC = () => {
  // const { db } = useSpacetime();
  const [db] = useState<any>(null); // Mock db to avoid refactor errors if any left
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [constraints, setConstraints] = useState<string>('');
  const [testInput, setTestInput] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // AI Generation states
  const [useAI, setUseAI] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateWithAI = async (): Promise<void> => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for AI generation');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          difficulty: difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate question');
      }

      const data = await response.json();
      const question: GeneratedQuestion = data.question;

      // Populate form fields with AI-generated content
      setTitle(question.title);
      setDescription(question.description);
      setDifficulty(question.difficulty);
      setConstraints(question.constraints || '');
      setTags(question.tags.join(', '));

      // Set first test case
      if (question.testCases && question.testCases.length > 0) {
        setTestInput(question.testCases[0].input);
        setTestOutput(question.testCases[0].expectedOutput);
      }

      toast.success('Question generated successfully! Review and create.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate question';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateQuestion = async (): Promise<void> => {


    if (!title.trim() || !description.trim() || !testInput.trim() || !testOutput.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const testCases: TestCase[] = [
        { input: testInput.trim(), expectedOutput: testOutput.trim() }
      ];

      const tagsList = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);

      const session = getSession();
      if (!session) {
        toast.error('Not logged in');
        return;
      }

      // Get user ID - assuming we can fetch it or just use username for now if action supports it.
      // My createQuestion action takes `createdById`. I need the ID.
      // Let's import getUser.
      const { getUser } = await import('@/app/actions/user');
      const { user } = await getUser(session.username);

      if (!user) {
        toast.error('User not found');
        return;
      }

      await createQuestion({
        title: title.trim(),
        description: description.trim(),
        difficulty: difficulty,
        testCases,
        constraints: constraints.trim(),
        tags: tagsList,
        createdById: user.id
      });

      toast.success('Question created successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setConstraints('');
      setTestInput('');
      setTestOutput('');
      setTags('');
      setAiPrompt('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create question';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Create Question
        </CardTitle>
        <CardDescription>Add a new coding challenge manually or with AI assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <Label htmlFor="ai-mode" className="text-base font-semibold cursor-pointer">
                AI Generation
              </Label>
              <p className="text-sm text-muted-foreground">Use AI to generate question from prompt</p>
            </div>
          </div>
          <Switch
            id="ai-mode"
            checked={useAI}
            onCheckedChange={setUseAI}
          />
        </div>

        {/* AI Prompt Section */}
        {useAI && (
          <div className="space-y-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 border border-pink-200 dark:border-pink-800">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">AI Prompt</Label>
              <Textarea
                id="ai-prompt"
                placeholder="E.g., Create a question about finding the maximum sum subarray using dynamic programming"
                rows={3}
                value={aiPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAiPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: string) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard')}>
                <SelectTrigger id="ai-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateWithAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        )}

        {/* Manual Question Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Two Sum"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Given an array of integers..."
              rows={4}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
          </div>

          {!useAI && (
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: string) => setDifficulty(value as 'Easy' | 'Medium' | 'Hard')}>
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints</Label>
            <Input
              id="constraints"
              placeholder="1 <= nums.length <= 10^4"
              value={constraints}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConstraints(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-input">Test Input</Label>
              <Textarea
                id="test-input"
                placeholder="[2, 7, 11, 15], 9"
                rows={3}
                value={testInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-output">Expected Output</Label>
              <Textarea
                id="test-output"
                placeholder="[0, 1]"
                rows={3}
                value={testOutput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestOutput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="arrays, hash-table, two-pointers"
              value={tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreateQuestion}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90"
          >
            {isLoading ? 'Creating Question...' : 'Create Question'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
