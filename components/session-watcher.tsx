'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

export function SessionWatcher() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [lastStatus, setLastStatus] = useState(status);

    useEffect(() => {
        // If the session was previously authenticated and is now unauthenticated,
        // it likely expired or was invalidated.
        if (lastStatus === 'authenticated' && status === 'unauthenticated') {
            // Only show message if we're not on a public/auth page
            const publicPages = ['/auth/signin', '/auth/register', '/auth/error', '/'];
            const isPublicPage = publicPages.some(page => pathname === page || pathname?.startsWith('/api/auth'));

            if (!isPublicPage) {
                toast.error('Session Expired', {
                    description: 'Your session has timed out. Please log in again to continue.',
                });
                router.push('/auth/signin');
            }
        }
        setLastStatus(status);
    }, [status, lastStatus, pathname, router]);

    // Optional: Periodic check against server to see if session is still valid
    // This handles cases where the session is revoked on the server but still exists in client storage
    useEffect(() => {
        if (status === 'authenticated') {
            const checkInterval = setInterval(async () => {
                const res = await fetch('/api/auth/session');
                const sessionData = await res.json();

                // If session is empty but we thought we were authenticated
                if (Object.keys(sessionData).length === 0) {
                    toast.error('Session Outdated', {
                        description: 'Your session is no longer valid. Please log in again.',
                    });
                    signOut({ redirect: true, callbackUrl: '/auth/signin' });
                }
            }, 5 * 60 * 1000); // Check every 5 minutes

            return () => clearInterval(checkInterval);
        }
    }, [status]);

    return null;
}
