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
