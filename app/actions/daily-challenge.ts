'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDailyChallenges() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: 'Unauthorized' };

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id },
            select: { isCheater: true }
        });

        if (user?.isCheater) {
            return { success: false, error: 'Banned users cannot participate in daily challenges.' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already generated
        const existing = await prisma.dailyChallenge.findFirst({
            where: { date: today }
        });

        if (existing) return { success: true };

        // Generate 3 questions with AI
        const prompt = `Generate 3 diverse coding interview questions (Easy, Medium, Hard).
        Return ONLY valid JSON with the following structure:
        {
          "questions": [
            { "title": "...", "description": "...", "difficulty": "...", "testCases": [{"input": "...", "output": "..."}], "constraints": "...", "tags": ["..."], "canonicalSolution": "...", "optimalTimeComplexity": "...", "optimalSpaceComplexity": "..." }
          ]
        }`;

        const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a senior algorithm engineer. ${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000,
                    responseMimeType: "application/json"
                }
            }),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
        }

        const geminiData = await geminiResponse.json();
        const generatedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedContent) throw new Error("No content generated");

        const data = JSON.parse(generatedContent);
        const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });

        if (!admin) throw new Error("No admin found to assign questions to");

        for (const q of data.questions) {
            const question = await prisma.question.create({
                data: {
                    title: q.title,
                    description: q.description,
                    difficulty: q.difficulty,
                    testCases: q.testCases,
                    constraints: q.constraints,
                    tags: q.tags,
                    isAiGenerated: true,
                    createdById: admin.id,
                    canonicalSolution: q.canonicalSolution,
                    optimalTimeComplexity: q.optimalTimeComplexity,
                    optimalSpaceComplexity: q.optimalSpaceComplexity
                }
            });

            await prisma.dailyChallenge.create({
                data: {
                    date: today,
                    questionId: question.id
                }
            });
        }

        revalidatePath('/practice');
        return { success: true };
    } catch (error) {
        console.error('Daily challenge generation failed:', error);
        return { success: false, error: 'Failed to generate challenges' };
    }
}

export async function getDailyChallenges() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user) {
            const user = await prisma.user.findUnique({
                where: { id: (session.user as any).id },
                select: { isCheater: true }
            });
            if (user?.isCheater) {
                return { success: false, error: 'Banned users cannot participate in daily challenges.' };
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const challenges = await prisma.dailyChallenge.findMany({
            where: { date: today },
            include: { question: true }
        });

        return { success: true, challenges: challenges.map(c => c.question) };
    } catch (error) {
        return { success: false, error: 'Failed to fetch challenges' };
    }
}

export async function getOptimizationComparison(questionId: number, userCode: string) {
    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question || !question.canonicalSolution) {
            return { success: false, error: 'Optimal solution not available' };
        }

        return {
            success: true,
            optimalCode: question.canonicalSolution,
            optimalTime: question.optimalTimeComplexity,
            optimalSpace: question.optimalSpaceComplexity
        };
    } catch (error) {
        return { success: false, error: 'Failed to fetch comparison' };
    }
}
