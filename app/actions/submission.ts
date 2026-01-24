'use server'

import prisma from '@/lib/prisma'

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
                complexityScore: 0 // logic to calc score
            }
        })
        return { success: true, submission }
    } catch (error) {
        console.error('Submission failed:', error)
        return { success: false, error: 'Submission failed' }
    }
}
