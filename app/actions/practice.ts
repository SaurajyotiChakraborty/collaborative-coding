'use server'

import prisma from '@/lib/prisma'
import { LearningPath } from '@/types/extended-types';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export async function getLearningPaths(userId?: string) {
    try {
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { isCheater: true }
            });
            if (user?.isCheater) {
                return { success: false, error: 'Banned users cannot access learning paths.' };
            }
        }
        // In a real app, these would be in the database
        // For now, let's provide curated paths and calculate progress from user submissions
        // Fetch dynamic learning paths from DB
        const paths = await prisma.learningPath.findMany({
            include: {
                questions: { select: { id: true } },
                userProgress: userId ? { where: { userId } } : false
            },
            orderBy: { order: 'asc' }
        });

        const formattedPaths = paths.map(path => {
            const progressRecord = path.userProgress?.[0];
            return {
                ...path,
                questions: path.questions.map(q => q.id),
                progress: progressRecord?.progress || 0,
                completed: progressRecord?.completed || false
            };
        });

        return { success: true, learningPaths: formattedPaths as any[] };
    } catch (error) {
        console.error('Failed to fetch learning paths:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getPracticeQuestion(questionId: number, locale: string = 'en') {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user) {
            const user = await prisma.user.findUnique({
                where: { id: (session.user as any).id },
                select: { isCheater: true }
            });
            if (user?.isCheater) {
                return { success: false, error: 'Banned users cannot practice questions.' };
            }
        }
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                createdBy: {
                    select: { username: true }
                },
                // @ts-ignore
                translations: {
                    where: { locale }
                }
            }
        });

        if (!question) {
            return { success: false, error: 'Question not found' };
        }

        // Merge translation if exists
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
        console.error('Failed to fetch practice question:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getPracticeQuestions() {
    try {
        const questions = await prisma.question.findMany({
            where: {
                isPractice: true,
                OR: [
                    { publishedAt: null },
                    { publishedAt: { lte: new Date() } }
                ]
            },
            take: 20,
            // @ts-ignore
            orderBy: { publishedAt: 'desc' }
        });
        return { success: true, questions };
    } catch (error) {
        console.error('Failed to fetch practice questions:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getRandomQuestion(difficulty: string) {
    try {
        const count = await prisma.question.count({
            where: {
                difficulty: difficulty as any,
                isPractice: true,
                OR: [
                    { publishedAt: null },
                    { publishedAt: { lte: new Date() } }
                ]
            }
        });

        if (count === 0) {
            return { success: false, error: 'No questions found for this difficulty.' };
        }

        const skip = Math.floor(Math.random() * count);
        const questions = await prisma.question.findMany({
            where: {
                difficulty: difficulty as any,
                isPractice: true,
                OR: [
                    // @ts-ignore
                    { publishedAt: null },
                    // @ts-ignore
                    { publishedAt: { lte: new Date() } }
                ]
            },
            take: 1,
            skip: skip
        });

        return { success: true, question: questions[0] };
    } catch (error) {
        console.error('Failed to fetch random question:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getPathDetails(pathId: string, userId: string) {
    try {
        const path = await prisma.learningPath.findUnique({
            where: { id: pathId },
            include: {
                questions: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        description: true
                    },
                    orderBy: { id: 'asc' } // Simple default ordering for now
                },
                userProgress: {
                    where: { userId }
                }
            }
        });

        if (!path) {
            return { success: false, error: 'Path not found' };
        }

        const progress = path.userProgress[0] || { progress: 0, completed: false };

        // Determine which questions are completed based on user submissions
        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                questionId: { in: path.questions.map(q => q.id) },
                allTestsPassed: true
            },
            select: { questionId: true }
        });

        const completedQuestionIds = new Set(submissions.map(s => s.questionId));

        const questionsWithStatus = path.questions.map((q, index) => {
            const isCompleted = completedQuestionIds.has(q.id);
            // First question is always unlocked, otherwise unlocked if previous is completed
            const isLocked = index > 0 && !completedQuestionIds.has(path.questions[index - 1].id);
            return { ...q, isCompleted, isLocked };
        });

        return {
            success: true,
            path: {
                ...path,
                questions: questionsWithStatus,
                progress: progress.progress,
                completed: progress.completed
            }
        };
    } catch (error) {
        console.error('Failed to fetch path details:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function updatePathProgress(userId: string, pathId: string) {
    try {
        const path = await prisma.learningPath.findUnique({
            where: { id: pathId },
            include: { questions: { select: { id: true } } }
        });

        if (!path) return { success: false };

        const solvedQuestions = await prisma.submission.findMany({
            where: {
                userId,
                questionId: { in: path.questions.map(q => q.id) },
                allTestsPassed: true
            },
            select: { questionId: true },
            distinct: ['questionId']
        });

        const progress = (solvedQuestions.length / path.questions.length) * 100;
        const completed = solvedQuestions.length === path.questions.length;

        await prisma.userLearningPath.upsert({
            where: { userId_pathId: { userId, pathId } },
            update: { progress, completed },
            create: { userId, pathId, progress, completed }
        });

        return { success: true, progress, completed };
    } catch (error) {
        console.error('Failed to update path progress:', error);
        return { success: false };
    }
}
