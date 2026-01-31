'use server'

import prisma from '@/lib/prisma'
import { submitCode } from './submission'
import { endCompetition } from './competition'
import { revalidatePath } from 'next/cache'

export async function simulateAiSubmission(competitionId: number) {
    try {
        const competition = await prisma.competition.findUnique({
            where: { id: competitionId },
            include: { questions: true, participants: true }
        });

        if (!competition || competition.mode !== 'Ai') {
            return { success: false, error: 'Not an AI competition' };
        }

        // 1. Ensure AI Opponent exists
        let aiUser = await prisma.user.findUnique({
            where: { username: 'AI_Opponent' }
        });

        if (!aiUser) {
            aiUser = await prisma.user.create({
                data: {
                    username: 'AI_Opponent',
                    email: 'ai@lingo.dev',
                    role: 'User',
                    rating: 1500,
                    xp: BigInt(10000)
                }
            });
        }

        // 2. Add AI to participants if not already there
        const isAiParticipant = competition.participants.some(p => p.id === aiUser!.id);
        if (!isAiParticipant) {
            await prisma.competition.update({
                where: { id: competitionId },
                data: {
                    participants: {
                        connect: { id: aiUser.id }
                    }
                }
            });
        }

        // 3. Generate submissions for the AI for all questions
        for (const question of competition.questions) {
            // Check if already submitted
            const existingSub = await prisma.submission.findFirst({
                where: {
                    competitionId,
                    userId: aiUser.id,
                    questionId: question.id
                }
            });

            if (existingSub) continue;

            // Simulate AI performance: 80% chance of passing, random time
            const allTestsPassed = Math.random() > 0.2;
            const executionTimeMs = Math.floor(Math.random() * 500) + 50;

            await submitCode({
                userId: aiUser.id,
                competitionId,
                questionId: question.id,
                code: `// Simulated AI Solution for: ${question.title}\n// This AI is powered by Gemini 2.0 Flash`,
                language: 'javascript',
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(1)',
                allTestsPassed,
                executionTimeMs
            });
        }

        // 4. End the competition if it's currently InProgress
        if (competition.status === 'InProgress') {
            await endCompetition(competitionId);
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('AI Simulation failed:', error);
        return { success: false, error: 'Failed to simulate AI opponent' };
    }
}
