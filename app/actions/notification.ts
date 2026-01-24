'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createNotification(data: {
    userId: string;
    type: 'ChallengeRequest' | 'CompetitionStart' | 'Result';
    message: string;
    competitionId?: number;
}) {
    try {
        await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                message: data.message,
                competitionId: data.competitionId
            }
        })

        revalidatePath('/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to create notification' }
    }
}

export async function getNotifications(userId: string, unreadOnly: boolean = false) {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { isRead: false } : {})
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        return { success: true, notifications }
    } catch (error) {
        return { success: false, error: 'Failed to fetch notifications' }
    }
}

export async function markNotificationRead(notificationId: number) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        })

        revalidatePath('/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark notification as read' }
    }
}

export async function markAllNotificationsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        })

        revalidatePath('/notifications')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to mark all notifications as read' }
    }
}
