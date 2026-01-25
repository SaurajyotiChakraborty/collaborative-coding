/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,filePath]` on the table `workspace_files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "CompetitionStatus" ADD VALUE 'Archived';

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "canonicalSolution" TEXT,
ADD COLUMN     "optimalScore" INTEGER DEFAULT 100,
ADD COLUMN     "optimalSpaceComplexity" TEXT,
ADD COLUMN     "optimalTimeComplexity" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workspace_files_workspaceId_filePath_key" ON "workspace_files"("workspaceId", "filePath");
