'use server'

import prisma from '@/lib/prisma'

export async function getQuestions() {
    try {
        const questions = await prisma.question.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, questions }
    } catch (error) {
        console.error('Failed to fetch questions:', error)
        return { success: false, error: 'Failed to fetch questions' }
    }
}

export async function createQuestion(data: {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard'; // matching Prisma enum roughly
    testCases: any[];
    constraints: string;
    tags: string[];
    createdById: string;
}) {
    try {
        console.log('[QuestionAction] Creating question:', JSON.stringify(data));

        // Verify user exists to prevent P2003
        const userExists = await prisma.user.findUnique({
            where: { id: data.createdById },
            select: { id: true }
        });

        if (!userExists) {
            console.error(`[QuestionAction] Creator ID ${data.createdById} not found in database.`);
            return {
                success: false,
                error: 'Your session might be stale. Please log out and log back in to sync your account.'
            };
        }

        const question = await prisma.question.create({
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty,
                testCases: data.testCases,
                constraints: data.constraints,
                tags: data.tags,
                createdById: data.createdById
            }
        })
        return { success: true, question }
    } catch (error) {
        console.error('Failed to create question:', error)
        return { success: false, error: 'Failed to create question' }
    }
}
