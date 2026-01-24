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
            // Logic to transition competition to 'Completed'
            await prisma.competition.update({
                where: { id: competitionId },
                data: {
                    status: "Completed",
                    endTime: new Date(),
                },
            });
            // We could trigger other events here (e.g. notifications)
        });

        return { status: "Competition ended successfully" };
    }
);
