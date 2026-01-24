'use server'

import prisma from '@/lib/prisma'

export async function getLeaderboard(type: 'global' | 'weekly' = 'global', limit: number = 50) {
    try {
        const where = type === 'weekly' ? {
            updatedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        } : undefined

        const entries = await prisma.leaderboardEntry.findMany({
            where,
            include: {
                user: {
                    select: {
                        username: true,
                        role: true,
                        achievements: true,
                        titles: true
                    }
                }
            },
            orderBy: { rank: 'asc' },
            take: limit
        })

        return { success: true, entries }
    } catch (error) {
        return { success: false, error: 'Failed to fetch leaderboard' }
    }
}

export async function getUserRank(userId: string) {
    try {
        const entry = await prisma.leaderboardEntry.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        username: true,
                        rating: true,
                        xp: true
                    }
                }
            }
        })

        if (!entry) {
            return { success: false, error: 'User not on leaderboard' }
        }

        return { success: true, entry }
    } catch (error) {
        return { success: false, error: 'Failed to fetch user rank' }
    }
}
