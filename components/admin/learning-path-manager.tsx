'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2, Edit2, Loader2, Search } from 'lucide-react';
import {
    getLearningPaths,
    createLearningPath,
    updateLearningPath,
    deleteLearningPath
} from '@/app/actions/admin-management';
import { getQuestions } from '@/app/actions/question';
import { Badge } from '@/components/ui/badge';

export const LearningPathManager = () => {
    const [paths, setPaths] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [editingPath, setEditingPath] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Data Structures');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [order, setOrder] = useState(0);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [pathsRes, questionsRes] = await Promise.all([
                getLearningPaths(),
                getQuestions()
            ]);

            if (pathsRes.success) setPaths(pathsRes.paths || []);
            if (questionsRes.success) setQuestions(questionsRes.questions || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !description.trim()) {
            toast.error('Name and description are required');
            return;
        }

        setIsSaving(true);
        try {
            const data = {
                name,
                description,
                category,
                difficulty,
                order: Number(order),
                questionIds: selectedQuestionIds
            };

            const res = editingPath
                ? await updateLearningPath(editingPath.id, data)
                : await createLearningPath(data);

            if (res.success) {
                toast.success(`Path ${editingPath ? 'updated' : 'created'} successfully`);
                resetForm();
                loadData();
            } else {
                toast.error(res.error || 'Failed to save path');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this path?')) return;

        try {
            const res = await deleteLearningPath(id);
            if (res.success) {
                toast.success('Path deleted');
                loadData();
            } else {
                toast.error(res.error || 'Failed to delete path');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const startEdit = (path: any) => {
        setEditingPath(path);
        setName(path.name);
        setDescription(path.description);
        setCategory(path.category);
        setDifficulty(path.difficulty);
        setOrder(path.order);
        setSelectedQuestionIds(path.questions.map((q: any) => q.id));
    };

    const resetForm = () => {
        setEditingPath(null);
        setName('');
        setDescription('');
        setCategory('Data Structures');
        setDifficulty('Beginner');
        setOrder(0);
        setSelectedQuestionIds([]);
    };

    const toggleQuestion = (id: number) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
        );
    };

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Form */}
                <Card className="glass-strong border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle>{editingPath ? 'Edit Learning Path' : 'Create Learning Path'}</CardTitle>
                        <CardDescription>Define a structured learning track for users</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Path Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Master Dynamic Programming" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will users learn?" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Data Structures">Data Structures</SelectItem>
                                        <SelectItem value="Algorithms">Algorithms</SelectItem>
                                        <SelectItem value="Web Development">Web Development</SelectItem>
                                        <SelectItem value="System Design">System Design</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input id="order" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <Label>Linked Questions ({selectedQuestionIds.length})</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search questions..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                                {filteredQuestions.map(q => (
                                    <div
                                        key={q.id}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${selectedQuestionIds.includes(q.id)
                                                ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-200'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        onClick={() => toggleQuestion(q.id)}
                                    >
                                        <span>{q.title}</span>
                                        <Badge variant="outline">{q.difficulty}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingPath ? 'Update Path' : 'Create Path'}
                            </Button>
                            {editingPath && (
                                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Existing Paths
                    </h3>
                    <div className="space-y-3">
                        {paths.map(path => (
                            <Card key={path.id} className="border-purple-200/50 dark:border-purple-800/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold">{path.name}</h4>
                                                <Badge variant="secondary">{path.difficulty}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline">{path.category}</Badge>
                                                <Badge variant="outline">{path.questions.length} Questions</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(path)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(path.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {paths.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No learning paths found. Create one to get started.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
