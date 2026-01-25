'use server'

import prisma from '@/lib/prisma'
import { LearningPath } from '@/types/extended-types';

export async function getLearningPaths(userId?: string) {
    try {
        // In a real app, these would be in the database
        // For now, let's provide curated paths and calculate progress from user submissions
        const mockPaths = [
            {
                id: 'path-1',
                name: 'Mastering Arrays',
                description: 'Core techniques for array manipulation and two-pointer solutions.',
                category: 'arrays',
                questions: [1, 2, 3], // Mocked question IDs
                progress: 0,
                completed: false,
            },
            {
                id: 'path-2',
                name: 'Dynamic Programming Foundations',
                description: 'Learn the principles of memoization and tabulation.',
                category: 'dp',
                questions: [10, 11, 12],
                progress: 0,
                completed: false,
            },
            {
                id: 'path-3',
                name: 'Graph Algorithms',
                description: 'DFS, BFS and shortest path algorithms.',
                category: 'graphs',
                questions: [20, 21, 22],
                progress: 0,
                completed: false,
            }
        ];

        if (!userId) {
            return { success: true, learningPaths: mockPaths as any[] };
        }

        // Calculate real progress
        const userSubmissions = await prisma.submission.findMany({
            where: { userId, allTestsPassed: true },
            select: { questionId: true }
        });

        const completedQuestionIds = new Set(userSubmissions.map(s => s.questionId));

        const pathsWithProgress = mockPaths.map(path => {
            const completedCount = path.questions.filter(id => completedQuestionIds.has(id)).length;
            const progress = (completedCount / path.questions.length) * 100;
            return {
                ...path,
                progress,
                completed: progress === 100
            };
        });

        return { success: true, learningPaths: pathsWithProgress as any[] };
    } catch (error) {
        console.error('Failed to fetch learning paths:', error);
        return { success: false, error: 'Internal server error' };
    }
}

export async function getPracticeQuestion(questionId: number) {
    try {
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
