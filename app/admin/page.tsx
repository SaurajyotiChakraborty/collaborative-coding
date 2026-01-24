import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, TrendingUp } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="glass-strong border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        <CardTitle className="gradient-text text-2xl">Admin Dashboard</CardTitle>
                    </div>
                    <CardDescription>Manage users, content, and platform settings</CardDescription>
                </CardHeader>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Configure OAuth to see data</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No active competitions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">All clear</p>
                    </CardContent>
                </Card>
            </div>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Setup Required</CardTitle>
                    <CardDescription>Complete these steps to enable full admin features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold text-purple-600">
                            1
                        </div>
                        <div>
                            <p className="font-medium">Configure OAuth</p>
                            <p className="text-sm text-muted-foreground">
                                Set up GitHub and Google OAuth in .env file
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold text-purple-600">
                            2
                        </div>
                        <div>
                            <p className="font-medium">Test Authentication</p>
                            <p className="text-sm text-muted-foreground">
                                Log in with OAuth to verify setup
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-semibold text-purple-600">
                            3
                        </div>
                        <div>
                            <p className="font-medium">Admin Features Available</p>
                            <p className="text-sm text-muted-foreground">
                                User management, content moderation, and analytics
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
