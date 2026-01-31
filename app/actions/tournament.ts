'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { inngest } from '@/lib/inngest'

export async function createTournament(data: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    questionIds: number[];
    maxParticipants?: number;
    badgeTitle?: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== 'Admin') return { success: false, error: 'Unauthorized' };

        console.log('[Tournament] Creating with session user:', JSON.stringify(session.user));

        // Verify user exists in DB
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!dbUser) {
            console.error('[Tournament] Error: User ID from session does not exist in database:', session.user.id);
            return { success: false, error: 'Session user not found in database. Please re-login.' };
        }

        // Create a competition of type Tournament
        const tournament = await prisma.competition.create({
            data: {
                title: data.title,
                description: data.description,
                type: 'Tournament',
                status: 'Scheduled' as any,
                startTime: data.startTime,
                endTime: data.endTime,
                mode: 'Human',
                maxParticipants: data.maxParticipants || 100,
                badgeTitle: data.badgeTitle,
                questions: {
                    connect: data.questionIds.map(id => ({ id }))
                },
                createdBy: {
                    connect: { id: session.user.id }
                }
            } as any
        });

        // Schedule the start event via Inngest
        console.log(`[Tournament] Sending start event for ${tournament.id} at ${data.startTime.toISOString()}`);
        await inngest.send({
            name: 'tournament/scheduled',
            data: {
                tournamentId: tournament.id,
                startTime: data.startTime.toISOString(),
                endTime: data.endTime.toISOString()
            }
        });
        console.log(`[Tournament] Event sent successfully for ${tournament.id}`);

        revalidatePath('/dashboard/tournaments');
        revalidatePath('/admin');
        return { success: true, tournament };
    } catch (error: any) {
        console.error('Failed to create tournament:', error);
        if (error.code === 'P2003') {
            console.error('[Tournament] Foreign key violation details:', JSON.stringify(error.meta));
        }
        return { success: false, error: 'Database constraint error. Please try logging out and in again.' };
    }
}

export async function getScheduledTournaments() {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        const now = new Date();
        const tournaments = await prisma.competition.findMany({
            where: {
                type: 'Tournament',
                status: 'Scheduled' as any
            } as any,
            include: {
                _count: { select: { participants: true } },
                questions: { select: { title: true } },
                participants: userId ? {
                    where: { id: userId },
                    select: { id: true }
                } : false
            },
            orderBy: { startTime: 'asc' }
        });

        // Lazy-start tournaments that passed their start time
        const updatedTournaments = [];
        for (const t of tournaments) {
            if (t.startTime && new Date(t.startTime) <= now) {
                console.log(`[Tournament] Lazy-starting tournament ${t.id} (Scheduled for ${t.startTime})`);
                await prisma.competition.update({
                    where: { id: t.id },
                    data: { status: 'InProgress', startTime: new Date() }
                });
                // Don't include it in scheduled list anymore
                revalidatePath('/dashboard/tournaments');
            } else {
                updatedTournaments.push({
                    ...t,
                    isJoined: userId ? (t as any).participants.length > 0 : false
                });
            }
        }

        return { success: true, tournaments: updatedTournaments };
    } catch (error) {
        console.error('[Tournament] Failed to fetch scheduled:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function joinTournament(tournamentId: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: 'Unauthorized' };

        const userId = (session.user as any).id;

        // Check user ban status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isCheater: true }
        });

        if (user?.isCheater) {
            return { success: false, error: 'Banned users cannot join tournaments.' };
        }

        const tournament = await prisma.competition.findUnique({
            where: { id: tournamentId },
            select: { status: true, startTime: true }
        });

        if (!tournament) return { success: false, error: 'Tournament not found' };

        const now = new Date();
        const startTime = tournament.startTime ? new Date(tournament.startTime) : null;
        const graceEndTime = startTime ? new Date(startTime.getTime() + 60 * 1000) : null; // 1 minute grace

        // Check if tournament already started beyond grace period
        if ((tournament.status as any) === 'InProgress' || ((tournament.status as any) === 'Scheduled' && startTime && startTime < now)) {
            // If within grace period, check if user was already registered
            if (graceEndTime && now <= graceEndTime) {
                // Allow registered users to "claim" their spot
                const existingRegistration = await prisma.competition.findFirst({
                    where: {
                        id: tournamentId,
                        participants: { some: { id: userId } }
                    }
                });
                if (!existingRegistration) {
                    return { success: false, error: 'Only pre-registered participants can join within the grace period.' };
                }
                return { success: true }; // Already registered, allow entry
            } else {
                return { success: false, error: 'Tournament has already started. You can only spectate now.' };
            }
        }

        if ((tournament.status as any) !== 'Scheduled') {
            return { success: false, error: 'Tournament is not accepting registrations.' };
        }

        await prisma.competition.update({
            where: { id: tournamentId },
            data: {
                participants: {
                    connect: { id: userId }
                }
            }
        });

        revalidatePath('/dashboard/tournaments');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to join' };
    }
}

export async function getCompletedTournaments() {
    try {
        const tournaments = await prisma.competition.findMany({
            where: {
                type: 'Tournament',
                status: 'Completed' as any
            } as any,
            include: {
                _count: { select: { participants: true } },
                questions: { select: { title: true } },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        achievements: true, // Assuming this is the string[] of achievement names
                        leaderboardEntry: {
                            select: { totalWins: true }
                        }
                        // We need submission stats to calculate "time taken" and "correctly".
                        // But fetching all submissions for all participants might be heavy.
                        // Ideally, we should have a 'Leaderboard' model linked to competition or store results in JSON.
                        // However, `endCompetition` calculates rankings but doesn't persist them in a dedicated 'CompetitionResult' table, 
                        // it just updates User stats.
                        // Wait, `endCompetition` returns `rankings`.
                        // If we want to show it later, we need to re-calculate or store it.
                        // Re-calculating on the fly for "Completed" view is okay for now if not too many.
                    }
                },
                submissions: {
                    select: {
                        userId: true,
                        executionTimeMs: true,
                        allTestsPassed: true,
                        submittedAt: true, // It was submittedAt, not createdAt
                        questionId: true,
                        complexityScore: true
                    }
                }
            },
            orderBy: { endTime: 'desc' },
            take: 10
        });

        // Process rankings for each tournament
        const tournamentsWithRankings = tournaments.map((t: any) => {
            const userScores = new Map<string, {
                userId: string;
                username: string;
                achievements: string[];
                correctCount: number;
                totalTime: number;
            }>();

            t.submissions.forEach((sub: any) => {
                const participant = t.participants.find((p: any) => p.id === sub.userId);
                if (!participant) return;

                const existing = userScores.get(sub.userId) || {
                    userId: sub.userId,
                    username: participant.username,
                    achievements: participant.achievements,
                    correctCount: 0,
                    totalTime: 0
                };

                if (sub.allTestsPassed) {
                    existing.correctCount++;
                }
                existing.totalTime += sub.executionTimeMs;

                userScores.set(sub.userId, existing);
            });

            const rankings = Array.from(userScores.values())
                .sort((a, b) => {
                    // Sort by correct count desc, then time asc
                    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
                    return a.totalTime - b.totalTime;
                })
                .slice(0, 3); // Top 3

            return { ...t, rankings };
        });

        return { success: true, tournaments: tournamentsWithRankings };
    } catch (error) {
        console.error('Failed to fetch completed tournaments:', error);
        return { success: false, error: 'Failed' };
    }
}
