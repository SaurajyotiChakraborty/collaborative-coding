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
            select: { id: true }
        });

        if (!userExists) {
            console.error(`[SubmissionAction] User ID ${data.userId} not found in database.`);
            return {
                success: false,
                error: 'Your session might be stale. Please log out and log back in to sync your account.'
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

        // Process in background
        await inngest.send({
            name: "submission/created",
            data: {
                submissionId: submission.id,
                userId: data.userId,
                code: data.code,
                language: data.language
            }
        });

        return { success: true, submission }
    } catch (error) {
        console.error('Submission failed:', error)
        return { success: false, error: 'Submission failed' }
    }
}
