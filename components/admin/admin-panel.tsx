'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    LayoutDashboard,
    Users,
    Code2,
    Trophy,
    Settings
} from 'lucide-react';
import { AdminOverview } from './admin-overview';
import { UserManagement } from './user-management';
import { QuestionManager } from './question-manager';
import { CompetitionManagement } from './competition-management';

export function AdminPanel() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-500 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage users, questions, and competitions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Settings className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Admin Mode</span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Questions
                    </TabsTrigger>
                    <TabsTrigger value="competitions" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Competitions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <AdminOverview />
                </TabsContent>

                <TabsContent value="users">
                    <UserManagement />
                </TabsContent>

                <TabsContent value="questions">
                    <QuestionManager />
                </TabsContent>

                <TabsContent value="competitions">
                    <CompetitionManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
