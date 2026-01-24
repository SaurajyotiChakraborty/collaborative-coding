'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    Default: 'An error occurred during authentication.',
};

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error') || 'Default';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
            <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 shadow-2xl">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                        <CardTitle className="text-2xl text-red-600">Authentication Error</CardTitle>
                    </div>
                    <CardDescription>
                        {errorMessages[error] || errorMessages.Default}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/auth/signin">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            Back to Sign In
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
