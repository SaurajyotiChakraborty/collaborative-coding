'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
}

export async function getGitHubRepositories() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'github'
            }
        });

        if (!account || !account.access_token) {
            return { success: false, error: 'GitHub account not linked' };
        }

        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        if (!res.ok) {
            console.error('GitHub API error:', await res.text());
            return { success: false, error: 'Failed to fetch repositories' };
        }

        const repos: GitHubRepo[] = await res.json();
        return { success: true, available: true, repositories: repos };
    } catch (error) {
        console.error('getGitHubRepositories error:', error);
        return { success: false, available: false, error: 'Internal server error' };
    }
}

export async function checkGitHubConnection() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { connected: false };

        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'github'
            }
        });

        return { connected: !!account };
    } catch (error) {
        return { connected: false };
    }
}
