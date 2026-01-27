'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Award, Plus, Trash2, Edit2, Loader2, Star } from 'lucide-react';
import {
    getAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement
} from '@/app/actions/admin-management';
import { Badge } from '@/components/ui/badge';

export const AchievementManager = () => {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [requirementType, setRequirementType] = useState('QuestionsSolved');
    const [requirementValue, setRequirementValue] = useState(1);
    const [xpReward, setXpReward] = useState(50);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await getAchievements();
            if (res.success) setAchievements(res.achievements || []);
        } catch (error) {
            toast.error('Failed to load achievements');
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
                icon,
                requirementType,
                requirementValue: Number(requirementValue),
                xpReward: Number(xpReward)
            };

            const res = editingId
                ? await updateAchievement(editingId, data)
                : await createAchievement(data);

            if (res.success) {
                toast.success(`Achievement ${editingId ? 'updated' : 'created'} successfully`);
                resetForm();
                loadData();
            } else {
                toast.error(res.error || 'Failed to save achievement');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this achievement?')) return;

        try {
            const res = await deleteAchievement(id);
            if (res.success) {
                toast.success('Achievement deleted');
                loadData();
            } else {
                toast.error(res.error || 'Failed to delete achievement');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const startEdit = (a: any) => {
        setEditingId(a.id);
        setName(a.name);
        setDescription(a.description);
        setIcon(a.icon);
        setRequirementType(a.requirementType);
        setRequirementValue(a.requirementValue);
        setXpReward(a.xpReward);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setDescription('');
        setIcon('🏆');
        setRequirementType('QuestionsSolved');
        setRequirementValue(1);
        setXpReward(50);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Form */}
                <Card className="glass-strong border-purple-200 dark:border-purple-800">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Achievement' : 'Create Achievement'}</CardTitle>
                        <CardDescription>Reward users for reaching milestones</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[80px_1fr] gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input id="icon" value={icon} onChange={e => setIcon(e.target.value)} className="text-center text-2xl" placeholder="🏆" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Achievement Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Code Warrior" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="How do users earn this?" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Requirement Type</Label>
                                <Select value={requirementType} onValueChange={setRequirementType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="QuestionsSolved">Questions Solved</SelectItem>
                                        <SelectItem value="CompetitionsWon">Competitions Won</SelectItem>
                                        <SelectItem value="XPEarned">XP Earned</SelectItem>
                                        <SelectItem value="DailyStreak">Daily Streak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Threshold Value</Label>
                                <Input id="value" type="number" value={requirementValue} onChange={e => setRequirementValue(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="xp">XP Reward</Label>
                            <Input id="xp" type="number" value={xpReward} onChange={e => setXpReward(Number(e.target.value))} />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingId ? 'Update Achievement' : 'Create Achievement'}
                            </Button>
                            {editingId && (
                                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Platform Achievements
                    </h3>
                    <div className="space-y-3">
                        {achievements.map(a => (
                            <Card key={a.id} className="border-purple-200/50 dark:border-purple-800/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="text-4xl bg-gray-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center rounded-lg">
                                                {a.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{a.name}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{a.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="secondary">{a.xpReward} XP</Badge>
                                                    <Badge variant="outline">
                                                        {a.requirementValue} {a.requirementType}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => startEdit(a)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(a.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {achievements.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                No achievements defined.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
