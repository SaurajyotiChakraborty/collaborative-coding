'use server'

import prisma from '@/lib/prisma'

export async function getCompetitionReplays(limit: number = 20) {
    try {
        // Fetch completed competitions with their submissions
        const competitions = await prisma.competition.findMany({
            where: { status: 'Completed' },
            include: {
                questions: { select: { id: true, title: true } },
                submissions: {
                    include: {
                        user: { select: { username: true } },
                        question: { select: { title: true } }
                    },
                    orderBy: { submittedAt: 'asc' }
                }
            },
            orderBy: { endTime: 'desc' },
            take: limit
        });

        // Transform to replay format
        const replays = competitions.flatMap(comp =>
            comp.submissions.filter(sub => sub.allTestsPassed).map(sub => ({
                competitionId: comp.id,
                username: sub.user.username,
                questionTitle: sub.question.title,
                finalScore: sub.complexityScore,
                duration: sub.executionTimeMs / 1000,
                language: sub.language,
                code: sub.code,
                submittedAt: sub.submittedAt
            }))
        );

        return { success: true, replays };
    } catch (error) {
        console.error('Failed to fetch replays:', error);
        return { success: false, error: 'Failed to fetch replays' };
    }
}

export async function getReplayDetails(submissionId: number) {
    try {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                user: { select: { username: true } },
                question: { select: { title: true } },
                competition: { select: { startTime: true, endTime: true } }
            }
        });

        if (!submission) {
            return { success: false, error: 'Replay not found' };
        }

        return { success: true, submission };
    } catch (error) {
        return { success: false, error: 'Failed to fetch replay' };
    }
}
