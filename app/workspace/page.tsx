import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, GitBranch } from 'lucide-react';

export default function WorkspacePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Workspaces</h1>
                    <p className="text-muted-foreground">Collaborate with your team</p>
                </div>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workspace
                </Button>
            </div>

            {/* Join Workspace */}
            <Card>
                <CardHeader>
                    <CardTitle>Join a Workspace</CardTitle>
                    <CardDescription>Enter an invite code to join an existing workspace</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input placeholder="Enter invite code" className="max-w-xs" />
                        <Button>Join</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Your Workspaces */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-5 w-5" />
                                My Project
                            </CardTitle>
                            <CardDescription>github.com/user/my-project</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    3 members online
                                </span>
                                <Button size="sm">Open</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
