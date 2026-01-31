import { Inngest } from "inngest";

// Inngest client with event types for robustness
export const inngest = new Inngest({
    id: "optimize-code",
    eventKey: process.env.INNGEST_EVENT_KEY || "local",
    baseUrl: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8288' : undefined
});
