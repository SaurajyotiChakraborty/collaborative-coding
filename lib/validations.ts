import { z } from 'zod';

// User validation schemas
export const registerUserSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
});

export const updateUserSchema = z.object({
    username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
    titles: z.array(z.string()).optional(),
    achievements: z.array(z.string()).optional(),
});

// Question validation schemas
export const testCaseSchema = z.object({
    input: z.string(),
    output: z.string(),
});

export const createQuestionSchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    testCases: z.array(testCaseSchema).min(1).max(20),
    constraints: z.string(),
    tags: z.array(z.string()).min(1).max(10),
    createdById: z.string().uuid(),
    isAiGenerated: z.boolean().default(false),
});

export const updateQuestionSchema = createQuestionSchema.partial();

// Competition validation schemas
export const createCompetitionSchema = z.object({
    mode: z.enum(['Ai', 'Human']),
    maxParticipants: z.number().int().min(2).max(8),
    questionIds: z.array(z.number().int()).min(1).max(5),
    hasTimeLimit: z.boolean(),
    timeLimitMinutes: z.number().int().min(5).max(180).optional(),
    createdById: z.string().uuid(),
}).refine(
    (data) => !data.hasTimeLimit || (data.hasTimeLimit && data.timeLimitMinutes),
    {
        message: 'Time limit must be specified when hasTimeLimit is true',
        path: ['timeLimitMinutes'],
    }
);

// Submission validation schemas
export const createSubmissionSchema = z.object({
    userId: z.string().uuid(),
    competitionId: z.number().int(),
    questionId: z.number().int(),
    code: z.string().min(1).max(50000),
    language: z.enum(['javascript', 'python', 'java', 'cpp']),
    timeComplexity: z.string(),
    spaceComplexity: z.string(),
});

// Code execution validation schemas
export const executeCodeSchema = z.object({
    language: z.enum(['javascript', 'python', 'java', 'cpp']),
    code: z.string().min(1).max(50000),
    testCases: z.array(testCaseSchema).min(1).max(100),
    timeLimit: z.number().int().min(100).max(30000).optional(),
    memoryLimit: z.number().int().min(64).max(1024).optional(),
});

// Workspace validation schemas
export const createWorkspaceSchema = z.object({
    name: z.string().min(3).max(100),
    leaderId: z.string().uuid(),
    gitRepoUrl: z.string().url(),
    gitBranch: z.string().min(1).max(100).default('main'),
});

export const joinWorkspaceSchema = z.object({
    inviteCode: z.string().length(8),
    userId: z.string().uuid(),
    gitUsername: z.string().min(1).max(50),
});

export const createFileSchema = z.object({
    workspaceId: z.number().int(),
    filePath: z.string().min(1).max(500),
    userId: z.string().uuid(),
});

export const updateFileSchema = z.object({
    workspaceId: z.number().int(),
    filePath: z.string().min(1).max(500),
    content: z.string().max(1000000), // 1MB max
    userId: z.string().uuid(),
});

// Notification validation schemas
export const createNotificationSchema = z.object({
    userId: z.string().uuid(),
    type: z.enum(['ChallengeRequest', 'CompetitionStart', 'Result']),
    message: z.string().min(1).max(500),
    competitionId: z.number().int().optional(),
});

// Admin validation schemas
export const banUserSchema = z.object({
    userId: z.string().uuid(),
    reason: z.string().min(10).max(500),
});

export const promoteUserSchema = z.object({
    userId: z.string().uuid(),
});

// Type exports
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type CreateQuestion = z.infer<typeof createQuestionSchema>;
export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;
export type CreateCompetition = z.infer<typeof createCompetitionSchema>;
export type CreateSubmission = z.infer<typeof createSubmissionSchema>;
export type ExecuteCode = z.infer<typeof executeCodeSchema>;
export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type JoinWorkspace = z.infer<typeof joinWorkspaceSchema>;
export type CreateFile = z.infer<typeof createFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;
export type BanUser = z.infer<typeof banUserSchema>;
export type PromoteUser = z.infer<typeof promoteUserSchema>;
