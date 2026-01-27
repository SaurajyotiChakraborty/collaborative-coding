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

export async function getPracticeQuestion(questionId: number) {
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
                }
            }
        });

        if (!question) {
            return { success: false, error: 'Question not found' };
        }

        return { success: true, question };
    } catch (error) {
        console.error('Failed to fetch practice question:', error);
        return { success: false, error: 'Internal server error' };
    }
}
