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
    canonicalSolution?: string;
    optimalTimeComplexity?: string;
    optimalSpaceComplexity?: string;
}) {
    try {
        console.log('[QuestionAction] Creating question:', data.title);

        const question = await prisma.question.create({
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty as any,
                testCases: data.testCases,
                constraints: data.constraints,
                tags: data.tags,
                createdById: data.createdById,
                isAiGenerated: (data as any).isAiGenerated || false,
                isApproved: (data as any).isAiGenerated ? false : true,
                canonicalSolution: data.canonicalSolution,
                optimalTimeComplexity: data.optimalTimeComplexity,
                optimalSpaceComplexity: data.optimalSpaceComplexity
            }
        })
        return { success: true, question }
    } catch (error) {
        console.error('Failed to create question:', error)
        return { success: false, error: 'Failed to create question' }
    }
}

export async function updateQuestion(id: number, data: {
    title?: string;
    description?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    testCases?: any[];
    constraints?: string;
    tags?: string[];
    isApproved?: boolean;
    canonicalSolution?: string;
    optimalTimeComplexity?: string;
    optimalSpaceComplexity?: string;
}) {
    try {
        const question = await prisma.question.update({
            where: { id },
            data: {
                ...data,
                difficulty: data.difficulty ? (data.difficulty as any) : undefined
            }
        });
        return { success: true, question };
    } catch (error) {
        console.error('Failed to update question:', error);
        return { success: false, error: 'Failed to update question' };
    }
}

export async function deleteQuestion(id: number) {
    try {
        await prisma.question.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to delete question:', error);
        return { success: false, error: 'Failed to delete question' };
    }
}

export async function approveQuestion(id: number) {
    try {
        const question = await prisma.question.update({
            where: { id },
            data: { isApproved: true }
        });
        return { success: true, question };
    } catch (error) {
        console.error('Failed to approve question:', error);
        return { success: false, error: 'Failed to approve question' };
    }
}

export async function getUnapprovedQuestions() {
    try {
        const questions = await prisma.question.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, questions };
    } catch (error) {
        console.error('Failed to fetch unapproved questions:', error);
        return { success: false, error: 'Failed to fetch unapproved questions' };
    }
}
