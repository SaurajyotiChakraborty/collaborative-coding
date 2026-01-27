'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Code2,
    Plus,
    Edit,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import prisma from '@/lib/prisma';

interface Question {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    createdAt: Date;
}

export function QuestionManagement() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        tags: '',
        constraints: '',
        testCases: '[]'
    });

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/questions');
            const result = await response.json();
            if (result.success) {
                setQuestions(result.questions);
            }
        } catch (error) {
            // Fallback: no API yet, show empty
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleCreateQuestion = async () => {
        try {
            const response = await fetch('/api/admin/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map(t => t.trim()),
                    testCases: JSON.parse(formData.testCases || '[]')
                })
            });

            if (response.ok) {
                toast.success('Question created successfully');
                setIsDialogOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    difficulty: 'Medium',
                    tags: '',
                    constraints: '',
                    testCases: '[]'
                });
                fetchQuestions();
            } else {
                toast.error('Failed to create question');
            }
        } catch (error) {
            toast.error('Failed to create question');
        }
    };

    const handleDeleteQuestion = async (id: number) => {
        if (!confirm('Are you sure you want to delete this question?')) return;

        try {
            const response = await fetch(`/api/admin/questions/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('Question deleted');
                fetchQuestions();
            }
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
            default: return '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Code2 className="h-5 w-5" />
                            Question Management
                        </CardTitle>
                        <CardDescription>Create and manage coding challenges</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchQuestions}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Question
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Question</DialogTitle>
                                    <DialogDescription>
                                        Add a new coding challenge to the question bank
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g., Two Sum"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Problem description..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Difficulty</label>
                                            <Select
                                                value={formData.difficulty}
                                                onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                                            >
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
                                        <div>
                                            <label className="text-sm font-medium">Tags (comma-separated)</label>
                                            <Input
                                                value={formData.tags}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                                placeholder="array, hash-table"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Constraints</label>
                                        <Input
                                            value={formData.constraints}
                                            onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                            placeholder="1 <= nums.length <= 10^4"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateQuestion}>Create Question</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full" />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                        <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No questions yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-medium">{question.title}</h3>
                                        <Badge className={getDifficultyColor(question.difficulty)}>
                                            {question.difficulty}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {question.description}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {question.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
