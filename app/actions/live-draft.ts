'use server'

// In-memory store for live code drafts
// Note: This is a simple solution that works for single-server deployments.
// For production with multiple servers, use Redis or a real-time database.
const liveDrafts = new Map<string, { code: string; language: string; updatedAt: Date }>();

function getDraftKey(competitionId: number, userId: string) {
    return `${competitionId}-${userId}`;
}

/**
 * Saves a participant's current code draft for live spectating.
 * Called on debounced editor changes.
 */
export async function saveLiveDraft(data: {
    competitionId: number;
    userId: string;
    code: string;
    language: string;
}) {
    try {
        const key = getDraftKey(data.competitionId, data.userId);
        liveDrafts.set(key, {
            code: data.code,
            language: data.language,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to save live draft:', error);
        return { success: false, error: 'Failed to save draft' };
    }
}

/**
 * Retrieves a participant's current code draft for spectators.
 */
export async function getLiveDraft(competitionId: number, userId: string) {
    try {
        const key = getDraftKey(competitionId, userId);
        const draft = liveDrafts.get(key);

        if (!draft) {
            return { success: true, draft: null };
        }

        return {
            success: true,
            draft: {
                code: draft.code,
                language: draft.language,
                updatedAt: draft.updatedAt.toISOString()
            }
        };
    } catch (error) {
        console.error('Failed to get live draft:', error);
        return { success: false, error: 'Failed to get draft' };
    }
}

/**
 * Clears a draft when competition ends or user leaves.
 */
export async function clearLiveDraft(competitionId: number, userId: string) {
    const key = getDraftKey(competitionId, userId);
    liveDrafts.delete(key);
    return { success: true };
}
