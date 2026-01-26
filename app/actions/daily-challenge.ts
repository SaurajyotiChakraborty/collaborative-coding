'use server'

import prisma from '@/lib/prisma'

export async function getDailyChallenge() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Try to get today's challenge
        let challenge = await prisma.dailyChallenge.findFirst({
            where: {
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            include: {
                question: true
            }
        });

        // If no challenge for today, create one from random question
        if (!challenge) {
            const questions = await prisma.question.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' }
            });

            if (questions.length > 0) {
                const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
                challenge = await prisma.dailyChallenge.create({
                    data: {
                        date: today,
                        questionId: randomQuestion.id,
                        bonusMultiplier: 1.5
                    },
                    include: {
                        question: true
                    }
                });
            }
        }

        return { success: true, challenge };
    } catch (error) {
        console.error('Failed to get daily challenge:', error);
        return { success: false, error: 'Failed to get daily challenge' };
    }
}

export async function checkDailyChallengeCompletion(userId: string) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challenge = await prisma.dailyChallenge.findFirst({
            where: {
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        if (!challenge) {
            return { success: true, completed: false };
        }

        // Check if user has a successful submission for this question today
        const submission = await prisma.submission.findFirst({
            where: {
                userId,
                questionId: challenge.questionId,
                allTestsPassed: true,
                submittedAt: {
                    gte: today
                }
            }
        });

        return { success: true, completed: !!submission };
    } catch (error) {
        return { success: false, error: 'Failed to check completion' };
    }
}
