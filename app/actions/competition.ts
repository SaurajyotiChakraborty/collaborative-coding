'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/lib/inngest'

export async function createCompetition(data: {
    mode: 'Ai' | 'Human';
    maxParticipants: number;
    questionIds: number[];
    hasTimeLimit: boolean;
    timeLimitMinutes?: number;
    createdById: string;
}) {
    try {
        const competition = await prisma.competition.create({
            data: {
                mode: data.mode,
                maxParticipants: data.maxParticipants,
                hasTimeLimit: data.hasTimeLimit,
                timeLimitMinutes: data.timeLimitMinutes,
                createdById: data.createdById,
                status: 'Waiting',
                questions: {
                    connect: data.questionIds.map(id => ({ id }))
                },
                participants: {
                    connect: [{ id: data.createdById }]
                }
            },
            include: {
                questions: true,
                participants: true
            }
        })

        // Check if competition should start immediately (e.g. AI mode with 1 participant)
        if (data.maxParticipants === 1) {
            await startCompetition(competition.id);
        }

        // Trigger Inngest if it's an AI competition or has a time limit
        if (data.hasTimeLimit && data.timeLimitMinutes) {
            await inngest.send({
                name: "competition/started",
                data: {
                    competitionId: competition.id,
                    durationMinutes: data.timeLimitMinutes,
                }
            });
        }

        revalidatePath('/')
        return { success: true, competition }
    } catch (error) {
        console.error('Failed to create competition:', error)
        return { success: false, error: 'Failed to create competition' }
    }
}

export async function getCompetitions(status?: 'Waiting' | 'InProgress' | 'Completed') {
    try {
        const competitions = await prisma.competition.findMany({
            where: status ? { status } : undefined,
            include: {
                questions: true,
                participants: true,
                createdBy: true,
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return { success: true, competitions };
    } catch (error) {
        return { success: false, error: 'Failed to fetch competitions' };
    }
}

export async function getCompetitionById(id: number) {
    try {
        const competition = await prisma.competition.findUnique({
            where: { id },
            include: {
                questions: true,
                participants: true,
                createdBy: true,
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!competition) {
            return { success: false, error: 'Competition not found' };
        }

        return { success: true, competition };
    } catch (error) {
        console.error('Failed to fetch competition:', error);
        return { success: false, error: 'Failed to fetch competition' };
    }
}

export async function joinCompetition(competitionId: number, userId: string) {
    try {
        const competition = await prisma.competition.findUnique({
            where: { id: competitionId },
            include: { participants: true }
        })

        if (!competition) return { success: false, error: 'Competition not found' }
        if (competition.status !== 'Waiting') return { success: false, error: 'Competition not accepting players' }
        if (competition.participants.length >= competition.maxParticipants) return { success: false, error: 'Competition full' }

        await prisma.competition.update({
            where: { id: competitionId },
            data: {
                participants: {
                    connect: { id: userId }
                }
            }
        })

        // Check if competition should start
        const updatedCompetition = await prisma.competition.findUnique({
            where: { id: competitionId },
            include: { participants: true }
        })

        if (updatedCompetition && updatedCompetition.participants.length === updatedCompetition.maxParticipants) {
            await startCompetition(competitionId)
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to join' }
    }
}

export async function startCompetition(competitionId: number) {
    try {
        const competition = await prisma.competition.update({
            where: { id: competitionId },
            data: {
                status: 'InProgress',
                startTime: new Date(),
                endTime: undefined
            }
        })

        // Schedule auto-end if time limit
        if (competition.hasTimeLimit && competition.timeLimitMinutes) {
            const endTime = new Date(Date.now() + competition.timeLimitMinutes * 60 * 1000)

            // In production, use a job queue like Bull or Agenda
            setTimeout(async () => {
                await endCompetition(competitionId)
            }, competition.timeLimitMinutes * 60 * 1000)
        }

        revalidatePath('/')
        return { success: true, competition }
    } catch (error) {
        return { success: false, error: 'Failed to start competition' }
    }
}

export async function endCompetition(competitionId: number) {
    try {
        // Calculate rankings
        const submissions = await prisma.submission.findMany({
            where: { competitionId },
            include: { user: true, question: true },
            orderBy: { submittedAt: 'asc' }
        })

        // Group by user
        const userScores = new Map<string, {
            userId: string;
            username: string;
            correctCount: number;
            totalTime: number;
            avgComplexityScore: number;
            submissions: number;
        }>()

        submissions.forEach(sub => {
            const existing = userScores.get(sub.userId) || {
                userId: sub.userId,
                username: sub.user.username,
                correctCount: 0,
                totalTime: 0,
                avgComplexityScore: 0,
                submissions: 0
            }

            if (sub.allTestsPassed) {
                existing.correctCount++
            }
            existing.totalTime += sub.executionTimeMs
            existing.avgComplexityScore += sub.complexityScore
            existing.submissions++

            userScores.set(sub.userId, existing)
        })

        // Calculate final scores and rank
        const rankings = Array.from(userScores.values())
            .map(user => ({
                ...user,
                avgComplexityScore: user.avgComplexityScore / user.submissions,
                finalScore: (user.correctCount * 1000) + (user.avgComplexityScore * 100) - (user.totalTime / 100)
            }))
            .sort((a, b) => b.finalScore - a.finalScore)

        // Update competition
        await prisma.competition.update({
            where: { id: competitionId },
            data: {
                status: 'Completed',
                endTime: new Date()
            }
        })

        // Update user stats and leaderboard
        for (let i = 0; i < rankings.length; i++) {
            const ranking = rankings[i]
            const isWinner = i === 0

            // Update user XP and rating
            const xpGain = BigInt(isWinner ? 100 : 50 - (i * 10))
            const ratingChange = isWinner ? 25 : (rankings.length - i) * 5

            await prisma.user.update({
                where: { id: ranking.userId },
                data: {
                    xp: { increment: xpGain },
                    rating: { increment: ratingChange }
                }
            })

            // Update leaderboard
            await prisma.leaderboardEntry.upsert({
                where: { userId: ranking.userId },
                create: {
                    userId: ranking.userId,
                    rank: 0, // Will be recalculated
                    totalPoints: xpGain,
                    totalWins: isWinner ? 1 : 0,
                    currentStreak: isWinner ? 1 : 0,
                    bestStreak: isWinner ? 1 : 0,
                    competitionsCompleted: 1
                },
                update: {
                    totalPoints: { increment: xpGain },
                    totalWins: isWinner ? { increment: 1 } : undefined,
                    currentStreak: isWinner ? { increment: 1 } : { set: 0 },
                    bestStreak: isWinner ? { increment: 1 } : undefined,
                    competitionsCompleted: { increment: 1 }
                }
            })
        }

        // Recalculate all ranks
        await recalculateLeaderboardRanks()

        revalidatePath('/')
        return { success: true, rankings }
    } catch (error) {
        console.error('Failed to end competition:', error)
        return { success: false, error: 'Failed to end competition' }
    }
}

async function recalculateLeaderboardRanks() {
    const entries = await prisma.leaderboardEntry.findMany({
        orderBy: [
            { totalPoints: 'desc' },
            { totalWins: 'desc' },
            { currentStreak: 'desc' }
        ]
    })

    for (let i = 0; i < entries.length; i++) {
        await prisma.leaderboardEntry.update({
            where: { userId: entries[i].userId },
            data: { rank: i + 1 }
        })
    }
}

export async function getCompetitionRankings(competitionId: number) {
    try {
        const submissions = await prisma.submission.findMany({
            where: { competitionId },
            include: { user: true, question: true },
            orderBy: { submittedAt: 'asc' }
        })

        const userScores = new Map<string, {
            userId: string;
            username: string;
            correctCount: number;
            totalTime: number;
            avgComplexityScore: number;
            submissions: number;
        }>()

        submissions.forEach(sub => {
            const existing = userScores.get(sub.userId) || {
                userId: sub.userId,
                username: sub.user.username,
                correctCount: 0,
                totalTime: 0,
                avgComplexityScore: 0,
                submissions: 0
            }

            if (sub.allTestsPassed) {
                existing.correctCount++
            }
            existing.totalTime += sub.executionTimeMs
            existing.avgComplexityScore += sub.complexityScore
            existing.submissions++

            userScores.set(sub.userId, existing)
        })

        const rankings = Array.from(userScores.values())
            .map(user => ({
                ...user,
                avgComplexityScore: user.avgComplexityScore / user.submissions,
                finalScore: (user.correctCount * 1000) + (user.avgComplexityScore * 100) - (user.totalTime / 100)
            }))
            .sort((a, b) => b.finalScore - a.finalScore)

        return { success: true, rankings }
    } catch (error) {
        return { success: false, error: 'Failed to get rankings' }
    }
}
