'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, approveQuestion, getUnapprovedQuestions } from '@/app/actions/question';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus, Trash2, Edit2, CheckCircle, XCircle, Search, Filter, LayoutGrid, List, Wand2, PlayCircle, Save } from 'lucide-react';

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  constraints: string;
  tags: string[];
  isApproved: boolean;
  isAiGenerated: boolean;
  createdAt: string;
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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Form states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [constraints, setConstraints] = useState<string>('');
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', expectedOutput: '' }]);
  const [tags, setTags] = useState<string>('');
  // New Practice Mode Fields
  const [canonicalSolution, setCanonicalSolution] = useState<string>('');
  const [optimalTimeComplexity, setOptimalTimeComplexity] = useState<string>('');
  const [optimalSpaceComplexity, setOptimalSpaceComplexity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // AI Generation states
  const [useAI, setUseAI] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const fetchQuestionsData = async () => {
    setIsFetching(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        getQuestions(),
        getUnapprovedQuestions()
      ]);
      if (allRes.success) setQuestions(allRes.questions as any);
      if (pendingRes.success) setPendingQuestions(pendingRes.questions as any);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, []);

  const handleVerify = async () => {
    if (!canonicalSolution) {
      toast.error('Please provide a canonical solution to verify test cases');
      return;
    }
    setIsLoading(true);
    try {
      // Here we could call an API to run the canonical solution against test cases
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Test cases verified against canonical solution! (Simulated)');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

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
      const question = data.question;

      setTitle(question.title);
      setDescription(question.description);
      setDifficulty(question.difficulty);
      setConstraints(question.constraints || '');
      setTags(question.tags.join(', '));
      if (question.testCases) setTestCases(question.testCases);

      // Populate new canonical fields if AI provided them
      if (question.canonicalSolution) setCanonicalSolution(question.canonicalSolution);
      if (question.optimalTimeComplexity) setOptimalTimeComplexity(question.optimalTimeComplexity);
      if (question.optimalSpaceComplexity) setOptimalSpaceComplexity(question.optimalSpaceComplexity);

      toast.success('Question generated successfully! Switch to Create tab to finalize.');
      setActiveTab('create');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpsertQuestion = async (): Promise<void> => {
    if (!title.trim() || !description.trim() || testCases.some(tc => !tc.input.trim() || !tc.expectedOutput.trim())) {
      toast.error('Please fill in all required fields and test cases');
      return;
    }

    setIsLoading(true);
    try {
      const tagsList = tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      const userId = (session?.user as any)?.id;

      if (isEditing && editId) {
        const res = await updateQuestion(editId, {
          title,
          description,
          difficulty,
          testCases,
          constraints,
          tags: tagsList,
          canonicalSolution,
          optimalTimeComplexity,
          optimalSpaceComplexity
        } as any);
        if (res.success) toast.success('Question updated!');
      } else {
        const res = await createQuestion({
          title: title.trim(),
          description: description.trim(),
          difficulty: difficulty,
          testCases,
          constraints: constraints.trim(),
          tags: tagsList,
          createdById: userId,
          isAiGenerated: useAI,
          canonicalSolution,
          optimalTimeComplexity,
          optimalSpaceComplexity
        } as any);
        if (res.success) toast.success('Question created!');
      }

      resetForm();
      fetchQuestionsData();
      setActiveTab('all');
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const res = await approveQuestion(id);
    if (res.success) {
      toast.success('Question approved!');
      fetchQuestionsData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    const res = await deleteQuestion(id);
    if (res.success) {
      toast.success('Question deleted');
      fetchQuestionsData();
    }
  };

  const handleEdit = (q: Question) => {
    setEditId(q.id);
    setTitle(q.title);
    setDescription(q.description);
    setDifficulty(q.difficulty);
    setConstraints(q.constraints);
    setTestCases(q.testCases);
    setTags(q.tags.join(', '));
    setCanonicalSolution((q as any).canonicalSolution || '');
    setOptimalTimeComplexity((q as any).optimalTimeComplexity || '');
    setOptimalSpaceComplexity((q as any).optimalSpaceComplexity || '');
    setIsEditing(true);
    setUseAI(false);
    setActiveTab('create');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setTitle('');
    setDescription('');
    setConstraints('');
    setTestCases([{ input: '', expectedOutput: '' }]);
    setTags('');
    setAiPrompt('');
    setCanonicalSolution('');
    setOptimalTimeComplexity('');
    setOptimalSpaceComplexity('');
  };

  const addTestCase = () => setTestCases([...testCases, { input: '', expectedOutput: '' }]);
  const removeTestCase = (index: number) => setTestCases(testCases.filter((_, i) => i !== index));
  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setTestCases(newTestCases);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Questions
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approval Queue
            {pendingQuestions.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                {pendingQuestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold">
            <Sparkles className="h-4 w-4" />
            AI Studio
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isEditing ? 'Edit Question' : 'Create New'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card className="glass-strong border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Master Question List</CardTitle>
                  <CardDescription>View, edit or delete all platform challenges</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search questions..." className="pl-8 w-[250px]" />
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchQuestionsData} disabled={isFetching}>
                    <Loader2 className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFetching ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                        <p className="mt-2 text-muted-foreground">Fetching questions...</p>
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No questions found.
                      </TableCell>
                    </TableRow>
                  ) : questions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{q.title}</span>
                          <div className="flex gap-1 mt-1">
                            {q.isAiGenerated && (
                              <Badge variant="outline" className="text-[10px] py-0 border-purple-200 text-purple-600">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty === 'Easy' ? 'secondary' : q.difficulty === 'Medium' ? 'default' : 'destructive'} className="text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {q.isApproved ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px]">Approved</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200 text-[10px]">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(q)}>
                            <Edit2 className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(q.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card className="glass-strong border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-orange-600">Approval Queue</CardTitle>
              <CardDescription>Review AI-generated questions before they go live</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuestions.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed rounded-lg bg-muted/20">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                  <p className="font-bold">Queue Empty</p>
                  <p className="text-sm text-muted-foreground">All AI questions have been processed.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingQuestions.map((q) => (
                    <Card key={q.id} className="border-orange-100 dark:border-orange-900 shadow-sm">
                      <div className="p-4 flex flex-col md:flex-row gap-4 items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{q.title}</h4>
                            <Badge variant="outline" className="text-purple-600 border-purple-200 italic">AI Draft</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{q.description}</p>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{q.difficulty}</span>
                            <span className="text-[10px] text-muted-foreground">• {q.testCases.length} Test Cases</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 md:flex-none" onClick={() => handleEdit(q)}>
                            Review & Edit
                          </Button>
                          <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700" size="sm" onClick={() => handleApprove(q.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(q.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card className="glass-strong border-purple-500/30">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Wand2 className="h-6 w-6" />
                AI Content Studio
              </CardTitle>
              <CardDescription>Describe a concept and AI will draft a complete challenge including test cases and optimal solution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt-studio" className="text-lg font-semibold">What's the challenge about?</Label>
                  <Textarea
                    id="ai-prompt-studio"
                    placeholder="E.g., Create a hard dynamic programming problem about finding the longest path in a grid with specific obstacles and collectable items..."
                    rows={5}
                    className="text-lg bg-background/50 border-purple-500/20 focus:border-purple-500"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>Difficulty Bias</Label>
                    <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 h-16 text-xl font-bold shadow-lg shadow-purple-500/20"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Manifesting Challenge...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 mr-3" />
                      Draft Challenge with Magic
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card className="glass-strong border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div>
                <CardTitle className="gradient-text flex items-center gap-2 text-2xl">
                  {isEditing ? <Edit2 className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
                  {isEditing ? `Editing: ${title}` : 'Create New Challenge'}
                </CardTitle>
                <CardDescription>
                  {isEditing ? 'Update the details of this existing challenge' : 'Define a new challenge manually below'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={resetForm}>
                  Clear Form
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Basic Meta */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="font-bold">Challenge Title</Label>
                  <Input id="title" placeholder="Two Sum" className="bg-muted/50" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="difficulty" className="font-bold">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                    <SelectTrigger id="difficulty" className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="font-bold text-lg">Detailed Description (Markdown)</Label>
                <Textarea id="description" rows={8} className="font-sans text-base bg-muted/30" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Advanced Logic */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-bold text-purple-600 dark:text-purple-400 uppercase text-xs tracking-wider">Test Optimization</Label>
                    <div className="space-y-4 p-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-500/5">
                      <div className="space-y-2">
                        <Label htmlFor="canonical" className="text-xs font-bold">Canonical Solution (Python/JS)</Label>
                        <Textarea
                          id="canonical"
                          placeholder="Reference code to compare against..."
                          className="font-mono text-xs h-32 bg-background/50"
                          value={canonicalSolution}
                          onChange={(e) => setCanonicalSolution(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="time-comp" className="text-xs font-bold">Optimal Time</Label>
                          <Input id="time-comp" placeholder="O(n log n)" className="h-8 text-xs" value={optimalTimeComplexity} onChange={(e) => setOptimalTimeComplexity(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="space-comp" className="text-xs font-bold">Optimal Space</Label>
                          <Input id="space-comp" placeholder="O(n)" className="h-8 text-xs" value={optimalSpaceComplexity} onChange={(e) => setOptimalSpaceComplexity(e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="constraints" className="font-bold">Constraints</Label>
                    <Input id="constraints" placeholder="e.g., 1 <= n <= 10^5" className="bg-muted/50" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tags" className="font-bold">Tags</Label>
                    <Input id="tags" placeholder="arrays, math, greedy" className="bg-muted/50" value={tags} onChange={(e) => setTags(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-bold">Validation Test Cases</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTestCase} className="h-8 border-purple-500 text-purple-600 hover:bg-purple-50">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Case
                    </Button>
                  </div>

                  <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                    {testCases.map((tc, index) => (
                      <div key={index} className="space-y-3 p-4 rounded-xl border bg-muted/20 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 h-7 w-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeTestCase(index)}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                        <div className="grid gap-3">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Input Case #{index + 1}</Label>
                            <Textarea
                              className="font-mono text-xs h-16 resize-none bg-background/50"
                              value={tc.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Expected Output</Label>
                            <Textarea
                              className="font-mono text-xs h-16 resize-none bg-background/50"
                              value={tc.expectedOutput}
                              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-16 gap-2 border-2 border-purple-500/50 text-purple-600"
                  onClick={handleVerify}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><PlayCircle className="h-5 w-5" /> Verify with AI</>}
                </Button>
                <Button
                  onClick={handleUpsertQuestion}
                  disabled={isLoading}
                  size="lg"
                  className="flex-[2] h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-lg font-bold shadow-xl shadow-purple-500/20"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : isEditing ? (
                    <><Save className="h-6 w-6 mr-2" /> Save Changes</>
                  ) : (
                    <><CheckCircle className="h-6 w-6 mr-2" /> Publish Challenge</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
