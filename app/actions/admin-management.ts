'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Learning Path Actions
export async function getLearningPaths() {
    try {
        const paths = await prisma.learningPath.findMany({
            include: {
                questions: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        })
        return { success: true, paths }
    } catch (error) {
        console.error('Failed to fetch learning paths:', error)
        return { success: false, error: 'Failed to fetch learning paths' }
    }
}

export async function createLearningPath(data: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    order: number;
    questionIds: number[];
}) {
    try {
        const path = await prisma.learningPath.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                difficulty: data.difficulty,
                order: data.order,
                questions: {
                    connect: data.questionIds.map(id => ({ id }))
                }
            }
        })
        revalidatePath('/admin')
        return { success: true, path }
    } catch (error) {
        console.error('Failed to create learning path:', error)
        return { success: false, error: 'Failed to create learning path' }
    }
}

export async function updateLearningPath(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    order?: number;
    questionIds?: number[];
}) {
    try {
        const path = await prisma.learningPath.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                difficulty: data.difficulty,
                order: data.order,
                questions: data.questionIds ? {
                    set: data.questionIds.map(qid => ({ id: qid }))
                } : undefined
            }
        })
        revalidatePath('/admin')
        return { success: true, path }
    } catch (error) {
        console.error('Failed to update learning path:', error)
        return { success: false, error: 'Failed to update learning path' }
    }
}

export async function deleteLearningPath(id: string) {
    try {
        await prisma.learningPath.delete({
            where: { id }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete learning path:', error)
        return { success: false, error: 'Failed to delete learning path' }
    }
}

// Achievement Actions
export async function getAchievements() {
    try {
        const achievements = await prisma.achievement.findMany({
            orderBy: { requirementValue: 'asc' }
        })
        return { success: true, achievements }
    } catch (error) {
        console.error('Failed to fetch achievements:', error)
        return { success: false, error: 'Failed to fetch achievements' }
    }
}

export async function createAchievement(data: {
    name: string;
    description: string;
    icon: string;
    requirementType: string;
    requirementValue: number;
    xpReward: number;
}) {
    try {
        const achievement = await prisma.achievement.create({
            data
        })
        revalidatePath('/admin')
        return { success: true, achievement }
    } catch (error) {
        console.error('Failed to create achievement:', error)
        return { success: false, error: 'Failed to create achievement' }
    }
}

export async function updateAchievement(id: string, data: Partial<{
    name: string;
    description: string;
    icon: string;
    requirementType: string;
    requirementValue: number;
    xpReward: number;
}>) {
    try {
        const achievement = await prisma.achievement.update({
            where: { id },
            data
        })
        revalidatePath('/admin')
        return { success: true, achievement }
    } catch (error) {
        console.error('Failed to update achievement:', error)
        return { success: false, error: 'Failed to update achievement' }
    }
}

export async function deleteAchievement(id: string) {
    try {
        await prisma.achievement.delete({
            where: { id }
        })
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete achievement:', error)
        return { success: false, error: 'Failed to delete achievement' }
    }
}

export async function getPlatformStats() {
    try {
        const [
            userCount,
            questionCount,
            competitionCount,
            submissionCount,
            recentSubmissions
        ] = await Promise.all([
            prisma.user.count(),
            prisma.question.count(),
            prisma.competition.count(),
            prisma.submission.count(),
            prisma.submission.findMany({
                take: 10,
                orderBy: { submittedAt: 'desc' },
                include: {
                    user: { select: { username: true } },
                    question: { select: { title: true } }
                }
            })
        ]);

        const languageStats = await prisma.submission.groupBy({
            by: ['language'],
            _count: true
        });

        const difficultyStats = await prisma.question.groupBy({
            by: ['difficulty'],
            _count: true
        });

        return {
            success: true,
            stats: {
                userCount,
                questionCount,
                competitionCount,
                submissionCount,
                recentSubmissions,
                languageStats,
                difficultyStats
            }
        };
    } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        return { success: false, error: 'Failed to fetch platform stats' };
    }
}
