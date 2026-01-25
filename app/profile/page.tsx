'use client';

import { UserProfile } from '@/components/profile/user-profile';
import { SideNav } from '@/components/layout/side-nav';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
            </div>
        );
    }

    if (!session?.user) return null;

    const handleTabChange = (tab: string) => {
        if (tab === 'profile') return;
        router.push(`/dashboard?tab=${tab}`);
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            <SideNav
                username={session.user.username}
                role={session.user.role}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <main className="flex-1 transition-all duration-300 md:ml-64 p-8">
                <UserProfile />
            </main>
        </div>
    );
}
