'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// User Learning Path Actions
export async function getAvailableLearningPaths(userId: string) {
    try {
        const paths = await prisma.learningPath.findMany({
            include: {
                questions: {
                    select: { id: true, difficulty: true }
                },
                userProgress: {
                    where: { userId },
                    select: { progress: true, completed: true }
                }
            },
            orderBy: { order: 'asc' }
        })
        return { success: true, paths }
    } catch (error) {
        console.error('Failed to fetch available learning paths:', error)
        return { success: false, error: 'Failed to fetch paths' }
    }
}

export async function getLearningPathDetails(id: string, userId: string) {
    try {
        const path = await prisma.learningPath.findUnique({
            where: { id },
            include: {
                questions: {
                    include: {
                        submissions: {
                            where: { userId, allTestsPassed: true },
                            take: 1,
                            orderBy: { submittedAt: 'desc' }
                        }
                    }
                },
                userProgress: {
                    where: { userId }
                }
            }
        })
        return { success: true, path }
    } catch (error) {
        console.error('Failed to fetch path details:', error)
        return { success: false, error: 'Failed to fetch details' }
    }
}

export async function enrollInPath(pathId: string, userId: string) {
    try {
        const existing = await prisma.userLearningPath.findUnique({
            where: { userId_pathId: { userId, pathId } }
        })

        if (existing) return { success: true }

        await prisma.userLearningPath.create({
            data: { userId, pathId, progress: 0 }
        })
        revalidatePath('/learning-paths')
        return { success: true }
    } catch (error) {
        console.error('Failed to enroll in path:', error)
        return { success: false, error: 'Failed to enroll' }
    }
}

// User Achievement Actions
export async function getUserAchievements(userId: string) {
    try {
        const allAchievements = await prisma.achievement.findMany({
            orderBy: { requirementValue: 'asc' }
        })

        const earned = await prisma.userAchievement.findMany({
            where: { userId },
            select: { achievementId: true, unlockedAt: true }
        })

        const earnedIds = new Set(earned.map(e => e.achievementId))

        const achievements = allAchievements.map(a => ({
            ...a,
            isEarned: earnedIds.has(a.id),
            earnedAt: earned.find(e => e.achievementId === a.id)?.unlockedAt
        }))

        return { success: true, achievements }
    } catch (error) {
        console.error('Failed to fetch user achievements:', error)
        return { success: false, error: 'Failed to fetch' }
    }
}
