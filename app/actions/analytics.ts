'use server'

import prisma from '@/lib/prisma'
import { UserAnalytics, PerformanceDataPoint, HeatmapData } from '@/types/extended-types';

export async function getUserAnalytics(userId: string) {
    try {
        // Query user with relevant relations
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                participatedCompetitions: {
                    where: { status: 'Completed' },
                    include: {
                        questions: {
                            include: {
                                submissions: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                },
                submissions: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Aggregate data
        const totalCompetitions = user.participatedCompetitions.length;

        // Fetch leaderboard info for wins
        const leaderboardEntry = await prisma.leaderboardEntry.findUnique({ where: { userId } });
        const totalWins = leaderboardEntry ? leaderboardEntry.totalWins : 0;
        const winRate = totalCompetitions > 0 ? totalWins / totalCompetitions : 0;

        // Language breakdown
        const languageBreakdown: Record<string, number> = {};
        user.submissions.forEach(sub => {
            languageBreakdown[sub.language] = (languageBreakdown[sub.language] || 0) + 1;
        });

        // Favorite language
        let favoriteLanguage = 'Mixed';
        let maxCount = 0;
        Object.entries(languageBreakdown).forEach(([lang, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteLanguage = lang;
            }
        });

        // Average time per question
        const successSubmissions = user.submissions.filter(s => s.allTestsPassed);
        const totalTime = successSubmissions.reduce((acc, s) => acc + s.executionTimeMs, 0);
        const averageTimePerQuestion = successSubmissions.length > 0 ? (totalTime / successSubmissions.length) / 1000 : 0;

        // Performance Trend (last 10 competitions)
        const performanceTrend: PerformanceDataPoint[] = user.participatedCompetitions
            .sort((a, b) => (a.endTime?.getTime() || 0) - (b.endTime?.getTime() || 0))
            .slice(-10)
            .map(comp => {
                // Calculate accuracy for this competition
                const compSubmissions = comp.questions.flatMap(q => q.submissions);
                const passed = compSubmissions.filter(s => s.allTestsPassed).length;
                const accuracy = compSubmissions.length > 0 ? passed / compSubmissions.length : 1;

                return {
                    date: comp.endTime || new Date(),
                    rating: user.rating, // Current rating as proxy for historical
                    wins: totalWins,
                    accuracy: accuracy
                };
            });

        // Heatmap (by tag)
        const heatmap: HeatmapData = {};
        user.submissions.forEach(sub => {
            sub.question.tags.forEach(tag => {
                if (!heatmap[tag]) {
                    heatmap[tag] = { attempts: 0, successRate: 0 };
                }
                heatmap[tag].attempts++;
            });
        });

        Object.keys(heatmap).forEach(tag => {
            const tagSubmissions = user.submissions.filter(s => s.question.tags.includes(tag));
            const success = tagSubmissions.filter(s => s.allTestsPassed).length;
            heatmap[tag].successRate = tagSubmissions.length > 0 ? success / tagSubmissions.length : 0;
        });

        // Strengths & Weaknesses
        const strengths: string[] = [];
        const weaknesses: string[] = [];
        Object.entries(heatmap).forEach(([tag, data]) => {
            if (data.successRate >= 0.7 && data.attempts >= 2) {
                strengths.push(tag);
            } else if (data.successRate < 0.4 && data.attempts >= 2) {
                weaknesses.push(tag);
            }
        });

        const analytics: UserAnalytics = {
            userId,
            totalCompetitions,
            winRate,
            averageTimePerQuestion,
            favoriteLanguage,
            languageBreakdown,
            strengthsWeaknesses: {
                strengths: strengths.length > 0 ? strengths : ['General Logic'],
                weaknesses: weaknesses.length > 0 ? weaknesses : ['Optimization']
            },
            performanceTrend,
            heatmap
        };

        return { success: true, analytics };
    } catch (error) {
        console.error('Failed to aggregate user analytics:', error);
        return { success: false, error: 'Internal server error' };
    }
}
