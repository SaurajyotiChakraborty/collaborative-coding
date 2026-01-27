'use server'

import prisma from '@/lib/prisma'
import { inngest } from '@/lib/inngest'

export async function submitCode(data: {
    userId: string;
    competitionId: number;
    questionId: number;
    code: string;
    language: string;
    timeComplexity: string;
    spaceComplexity: string;
    allTestsPassed: boolean;
    executionTimeMs: number;
}) {
    try {
        console.log('[SubmissionAction] Creating submission:', JSON.stringify(data));

        // Verify user exists to prevent P2003
        const userExists = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { id: true, isCheater: true }
        });

        if (!userExists) {
            console.error(`[SubmissionAction] User ID ${data.userId} not found in database.`);
            return {
                success: false,
                error: 'Your session might be stale. Please log out and log back in to sync your account.'
            };
        }

        if (userExists.isCheater) {
            return {
                success: false,
                error: 'Your account is restricted from submitting code.'
            };
        }

        const submission = await prisma.submission.create({
            data: {
                userId: data.userId,
                competitionId: data.competitionId,
                questionId: data.questionId,
                code: data.code,
                language: data.language,
                timeComplexity: data.timeComplexity,
                spaceComplexity: data.spaceComplexity,
                allTestsPassed: data.allTestsPassed,
                executionTimeMs: data.executionTimeMs,
                complexityScore: 0 // logic to calc score in background
            }
        })

        // Process in background (Inngest)
        await inngest.send({
            name: "submission/created",
            data: {
                submissionId: submission.id,
                userId: data.userId,
                code: data.code,
                language: data.language
            }
        });

        // Track Path Progress and Achievements
        if (data.allTestsPassed) {
            await handlePostSuccessLogic(data.userId, data.questionId);
        }

        return { success: true, submission }
    } catch (error) {
        console.error('Submission failed:', error)
        return { success: false, error: 'Submission failed' }
    }
}

async function handlePostSuccessLogic(userId: string, questionId: number) {
    try {
        // 1. Update Learning Path Progress
        const pathsContainingQuestion = await prisma.learningPath.findMany({
            where: { questions: { some: { id: questionId } } },
            include: { questions: { select: { id: true } } }
        });

        for (const path of pathsContainingQuestion) {
            const solvedInPath = await prisma.submission.groupBy({
                by: ['questionId'],
                where: {
                    userId,
                    allTestsPassed: true,
                    questionId: { in: path.questions.map(q => q.id) }
                },
                _count: true
            });

            const solvedCount = solvedInPath.length;
            const progress = (solvedCount / path.questions.length) * 100;

            await prisma.userLearningPath.upsert({
                where: { userId_pathId: { userId, pathId: path.id } },
                update: {
                    progress,
                    completed: progress === 100
                },
                create: {
                    userId,
                    pathId: path.id,
                    progress,
                    completed: progress === 100
                }
            });
        }

        // 2. Check for Achievements
        const solveCount = await prisma.submission.groupBy({
            by: ['questionId'],
            where: { userId, allTestsPassed: true }
        }).then(res => res.length);

        const possibleAchievements = await prisma.achievement.findMany({
            where: {
                requirementType: 'QuestionsSolved',
                requirementValue: { lte: solveCount }
            }
        });

        for (const achievement of possibleAchievements) {
            await prisma.userAchievement.upsert({
                where: { userId_achievementId: { userId, achievementId: achievement.id } },
                update: {}, // Do nothing if already exists
                create: { userId, achievementId: achievement.id }
            });
        }
    } catch (error) {
        console.error('Failed to process post-success logic:', error);
    }
}
