'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Trophy, Code2, BookOpen, Star, BarChart3, Settings } from 'lucide-react';
import { QuestionManager } from '@/components/admin/question-manager';
import { LearningPathManager } from '@/components/admin/learning-path-manager';
import { AchievementManager } from '@/components/admin/achievement-manager';
import { PlatformAnalytics } from '@/components/admin/platform-analytics';
import { UserManagement } from '@/components/admin/user-management';

export default function AdminPage() {
    return (
        <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
                            Admin Control Center
                        </h1>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                        Manage users, curate learning content, orchestrate competitions, and monitor platform performance.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white/50 dark:bg-black/20 border border-purple-100 dark:border-purple-900 p-1 h-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
                    <TabsTrigger value="overview" className="gap-2 py-2.5">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2 py-2.5">
                        <Users className="h-4 w-4" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="gap-2 py-2.5">
                        <Code2 className="h-4 w-4" />
                        Questions
                    </TabsTrigger>
                    <TabsTrigger value="paths" className="gap-2 py-2.5">
                        <BookOpen className="h-4 w-4" />
                        Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="gap-2 py-2.5">
                        <Star className="h-4 w-4" />
                        Awards
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 py-2.5">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <PlatformAnalytics />
                </TabsContent>

                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="questions">
                    <QuestionManager />
                </TabsContent>

                <TabsContent value="paths">
                    <LearningPathManager />
                </TabsContent>

                <TabsContent value="achievements">
                    <AchievementManager />
                </TabsContent>

                <TabsContent value="settings">
                    <Card className="glass-strong border-purple-200 dark:border-purple-800">
                        <CardHeader>
                            <CardTitle>Platform Settings</CardTitle>
                            <CardDescription>Global configuration for the coding platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                Global settings coming soon. Manage individual components using the tabs above.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
