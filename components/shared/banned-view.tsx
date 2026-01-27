'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export function BannedView() {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <Card className="max-w-md w-full border-red-200 dark:border-red-900 shadow-2xl shadow-red-500/10">
                <CardHeader className="text-center space-y-4">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-10 w-10 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-extrabold text-red-600">Access Restrained</CardTitle>
                        <CardDescription className="text-lg">
                            Your account has been flagged for violation of platform terms.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                        <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                            Participation in challenges, competitions, and collaborative workspaces is currently restricted for your account.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild className="gap-2">
                            <Link href="/">
                                <Home className="h-4 w-4" />
                                Home
                            </Link>
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                            <Mail className="h-4 w-4" />
                            Appeal Ban
                        </Button>
                    </div>

                    <p className="text-[10px] text-center text-muted-foreground">
                        If you believe this is a mistake, please contact our moderation team with your User ID.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
