'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitBanAppeal(userId: string, reason: string) {
    try {
        // Check if user has a pending appeal
        const existingAppeal = await prisma.banAppeal.findFirst({
            where: {
                userId,
                status: 'Pending'
            }
        });

        if (existingAppeal) {
            return { success: false, error: 'You already have a pending appeal.' };
        }

        const appeal = await prisma.banAppeal.create({
            data: {
                userId,
                reason,
                status: 'Pending'
            }
        });

        return { success: true, appeal };
    } catch (error) {
        console.error('Failed to submit appeal:', error);
        return { success: false, error: 'Failed to submit appeal' };
    }
}

export async function getUserAppealStatus(userId: string) {
    try {
        const appeal = await prisma.banAppeal.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, appeal };
    } catch (error) {
        return { success: false, error: 'Failed to fetch appeal status' };
    }
}
