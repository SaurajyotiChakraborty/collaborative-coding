-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'User');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "CompetitionMode" AS ENUM ('Ai', 'Human');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('Waiting', 'InProgress', 'Completed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ChallengeRequest', 'CompetitionStart', 'Result');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('Active', 'Synced', 'Archived', 'PendingDeletion');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('Leader', 'Maintainer', 'Contributor', 'Viewer');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'User',
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "xp" BIGINT NOT NULL DEFAULT 0,
    "titles" TEXT[],
    "achievements" TEXT[],
    "isCheater" BOOLEAN NOT NULL DEFAULT false,
    "cheaterRedemptionCount" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL,
    "testCases" JSONB NOT NULL,
    "constraints" TEXT NOT NULL,
    "tags" TEXT[],
    "createdById" TEXT NOT NULL,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "mode" "CompetitionMode" NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" "CompetitionStatus" NOT NULL DEFAULT 'Waiting',
    "hasTimeLimit" BOOLEAN NOT NULL DEFAULT false,
    "timeLimitMinutes" INTEGER,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "timeComplexity" TEXT NOT NULL,
    "spaceComplexity" TEXT NOT NULL,
    "complexityScore" INTEGER NOT NULL DEFAULT 0,
    "allTestsPassed" BOOLEAN NOT NULL,
    "executionTimeMs" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard" (
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalPoints" BIGINT NOT NULL,
    "totalWins" INTEGER NOT NULL,
    "currentStreak" INTEGER NOT NULL,
    "bestStreak" INTEGER NOT NULL,
    "competitionsCompleted" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "competitionId" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "gitRepoUrl" TEXT NOT NULL,
    "gitBranch" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "workspace_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gitUsername" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_locks" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "lockedById" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_files" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lastModifiedById" TEXT NOT NULL,
    "lastModifiedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "workspace_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_chats" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetitionParticipants" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CompetitionQuestions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_groups_inviteCode_key" ON "workspace_groups"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "_CompetitionParticipants_AB_unique" ON "_CompetitionParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetitionParticipants_B_index" ON "_CompetitionParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompetitionQuestions_AB_unique" ON "_CompetitionQuestions"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetitionQuestions_B_index" ON "_CompetitionQuestions"("B");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_groups" ADD CONSTRAINT "workspace_groups_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_locks" ADD CONSTRAINT "file_locks_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_locks" ADD CONSTRAINT "file_locks_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_files" ADD CONSTRAINT "workspace_files_lastModifiedById_fkey" FOREIGN KEY ("lastModifiedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_chats" ADD CONSTRAINT "workspace_chats_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_chats" ADD CONSTRAINT "workspace_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionParticipants" ADD CONSTRAINT "_CompetitionParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionParticipants" ADD CONSTRAINT "_CompetitionParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionQuestions" ADD CONSTRAINT "_CompetitionQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetitionQuestions" ADD CONSTRAINT "_CompetitionQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
