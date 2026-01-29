'use server'

import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

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

export async function upsertQuestionTranslation(data: {
    questionId: number;
    locale: string;
    title: string;
    description: string;
    constraints: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'Admin') return { success: false, error: 'Unauthorized' };

        const translation = await prisma.questionTranslation.upsert({
            where: {
                questionId_locale: {
                    questionId: data.questionId,
                    locale: data.locale
                }
            },
            update: {
                title: data.title,
                description: data.description,
                constraints: data.constraints
            },
            create: {
                questionId: data.questionId,
                locale: data.locale,
                title: data.title,
                description: data.description,
                constraints: data.constraints
            }
        });

        return { success: true, translation };
    } catch (error) {
        console.error('Failed to upsert translation:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function getQuestion(id: number, locale: string = 'en') {
    try {
        const question = await prisma.question.findUnique({
            where: { id },
            include: {
                translations: {
                    where: { locale }
                }
            }
        });

        if (!question) return { success: false, error: 'Not found' };

        // If translation exists for the requested locale, merge it
        if (question.translations && question.translations.length > 0) {
            const trans = question.translations[0];
            return {
                success: true,
                question: {
                    ...question,
                    title: trans.title,
                    description: trans.description,
                    constraints: trans.constraints
                }
            };
        }

        return { success: true, question };
    } catch (error) {
        console.error('Failed to get question:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function schedulePracticeQuestion(id: number, publishedAt: Date) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'Admin') return { success: false, error: 'Unauthorized' };

        const question = await prisma.question.update({
            where: { id },
            data: {
                publishedAt,
                isPractice: true
            }
        });

        revalidatePath('/dashboard/practice');
        return { success: true, question };
    } catch (error) {
        console.error('Failed to schedule practice question:', error);
        return { success: false, error: 'Failed' };
    }
}
