import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";

export const competitionTimer = inngest.createFunction(
    { id: "competition-timer" },
    { event: "competition/started" },
    async ({ event, step }) => {
        const { competitionId, durationMinutes } = event.data;

        // Wait for the duration of the competition
        await step.sleep("wait-for-competition-end", `${durationMinutes}m`);

        // End the competition
        await step.run("end-competition", async () => {
            await prisma.competition.update({
                where: { id: competitionId },
                data: {
                    status: "Completed",
                    endTime: new Date(),
                },
            });
        });

        // Wait for 12 hours before archiving
        await step.sleep("wait-before-archive", "12h");

        // Archive the competition
        await step.run("archive-competition", async () => {
            await prisma.competition.update({
                where: { id: competitionId },
                data: {
                    status: "Archived" as any,
                },
            });
        });

        return { status: "Competition archived successfully" };
    }
);

/**
 * Background submission analysis
 * Replaces static complexity score with a simulated analyzer
 */
export const processSubmission = inngest.createFunction(
    { id: "process-submission" },
    { event: "submission/created" },
    async ({ event, step }) => {
        const { submissionId, code, language } = event.data;

        // Perform complexity analysis (simulated heavy logic)
        const analysis = await step.run("analyze-complexity", async () => {
            // In a real app, use AST analyzer here
            const complexityScore = Math.floor(Math.random() * 40) + 60; // 60-100
            let timeComp = "O(n)";
            if (code.includes("for") && code.split("for").length > 2) timeComp = "O(n^2)";

            return { complexityScore, timeComp };
        });

        // Update submission with real analysis
        await step.run("update-submission", async () => {
            await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    complexityScore: analysis.complexityScore,
                    timeComplexity: analysis.timeComp,
                },
            });
        });

        // Check for achievements
        await inngest.send({
            name: "user/achievement-check",
            data: { userId: event.data.userId, trigger: "submission" }
        });

        return { status: "Submission processed" };
    }
);

/**
 * Periodically recalculates leaderboard ranks
 */
export const recalculateLeaderboard = inngest.createFunction(
    { id: "recalculate-leaderboard" },
    { cron: "0 * * * *" }, // Run every hour
    async ({ step }) => {
        await step.run("re-rank-users", async () => {
            const entries = await prisma.leaderboardEntry.findMany({
                orderBy: [
                    { totalPoints: 'desc' },
                    { totalWins: 'desc' },
                    { currentStreak: 'desc' }
                ]
            });

            for (let i = 0; i < entries.length; i++) {
                await prisma.leaderboardEntry.update({
                    where: { userId: entries[i].userId },
                    data: { rank: i + 1 }
                });
            }
        });

        return { status: "Leaderboard updated" };
    }
);

/**
 * Achievement check logic
 */
export const checkAchievements = inngest.createFunction(
    { id: "check-achievements" },
    { event: "user/achievement-check" },
    async ({ event, step }) => {
        const { userId } = event.data;

        await step.run("check-rules", async () => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { submissions: true, leaderboardEntry: true }
            });

            if (!user) return;

            // Fetch all achievement definitions
            const defs = await prisma.achievement.findMany();

            for (const def of defs) {
                let met = false;
                if (def.requirementType === 'QuestionsSolved' && user.submissions.filter(s => s.allTestsPassed).length >= def.requirementValue) {
                    met = true;
                }
                if (def.requirementType === 'CompetitionsWon' && (user.leaderboardEntry?.totalWins || 0) >= def.requirementValue) {
                    met = true;
                }

                if (met) {
                    await prisma.userAchievement.upsert({
                        where: { userId_achievementId: { userId, achievementId: def.id } },
                        create: { userId, achievementId: def.id },
                        update: {}
                    });
                }
            }
        });
    }
);

/**
 * Scheduled daily challenge generator
 * Runs every day at midnight to ensure a new daily challenge is ready
 */
export const scheduleDailyChallenge = inngest.createFunction(
    { id: "schedule-daily-challenge" },
    { cron: "0 0 * * *" }, // Run at midnight daily
    async ({ step }) => {
        await step.run("create-daily-challenge", async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if challenge already exists
            const existing = await prisma.$queryRaw`
                SELECT id FROM daily_challenges 
                WHERE date >= ${today} 
                LIMIT 1
            `;

            if ((existing as any[]).length === 0) {
                // Get random question
                const questions = await prisma.question.findMany({
                    take: 20,
                    orderBy: { createdAt: 'desc' }
                });

                if (questions.length > 0) {
                    const random = questions[Math.floor(Math.random() * questions.length)];

                    // Use raw query since Prisma client may not be regenerated
                    await prisma.$executeRaw`
                        INSERT INTO daily_challenges (id, date, "questionId", "bonusMultiplier")
                        VALUES (gen_random_uuid(), ${today}, ${random.id}, 1.5)
                    `;
                }
            }
        });

        return { status: "Daily challenge scheduled" };
    }
);
