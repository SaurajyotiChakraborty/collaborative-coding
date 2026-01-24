'use server'

import prisma from '@/lib/prisma'

export async function getAllUsers(page: number = 1, limit: number = 50) {
    try {
        const users = await prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                rating: true,
                xp: true,
                isCheater: true,
                createdAt: true
            }
        })

        const total = await prisma.user.count()

        return { success: true, users, total, pages: Math.ceil(total / limit) }
    } catch (error) {
        return { success: false, error: 'Failed to fetch users' }
    }
}

export async function banUser(userId: string, reason: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isCheater: true,
                cheaterRedemptionCount: 0
            }
        })

        // Create notification
        await prisma.notification.create({
            data: {
                userId,
                type: 'Result',
                message: `Your account has been banned. Reason: ${reason}`
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to ban user' }
    }
}

export async function unbanUser(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                isCheater: false,
                cheaterRedemptionCount: 3
            }
        })

        await prisma.notification.create({
            data: {
                userId,
                type: 'Result',
                message: 'Your account has been unbanned. Please follow the rules.'
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to unban user' }
    }
}

export async function promoteToAdmin(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: 'Admin' }
        })

        await prisma.notification.create({
            data: {
                userId,
                type: 'Result',
                message: 'You have been promoted to Admin!'
            }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to promote user' }
    }
}

export async function getCompetitionStats() {
    try {
        const total = await prisma.competition.count()
        const active = await prisma.competition.count({
            where: { status: 'InProgress' }
        })
        const completed = await prisma.competition.count({
            where: { status: 'Completed' }
        })

        return { success: true, stats: { total, active, completed } }
    } catch (error) {
        return { success: false, error: 'Failed to fetch stats' }
    }
}

export async function getQuestionStats() {
    try {
        const total = await prisma.question.count()
        const byDifficulty = await prisma.question.groupBy({
            by: ['difficulty'],
            _count: true
        })

        return { success: true, stats: { total, byDifficulty } }
    } catch (error) {
        return { success: false, error: 'Failed to fetch question stats' }
    }
}
