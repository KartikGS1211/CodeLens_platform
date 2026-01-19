/*
  Warnings:

  - You are about to drop the column `aiReview` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `codeQualitySource` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `skillsProfile` on the `Analysis` table. All the data in the column will be lost.
  - The `status` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `analysisId` on the `Repository` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[repositoryId]` on the table `Analysis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `source` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Repository` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "RepositoryStatus" AS ENUM ('analyzing', 'connected', 'error');

-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "aiReview",
DROP COLUMN "codeQualitySource",
DROP COLUMN "skillsProfile",
ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "architecture" JSONB,
ADD COLUMN     "overallVerdict" TEXT,
ADD COLUMN     "redFlags" JSONB,
ADD COLUMN     "repositoryId" TEXT,
ADD COLUMN     "review" JSONB,
ADD COLUMN     "skillSummary" TEXT,
ADD COLUMN     "source" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AnalysisStatus" NOT NULL DEFAULT 'processing';

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "analysisId",
DROP COLUMN "status",
ADD COLUMN     "status" "RepositoryStatus" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_repositoryId_key" ON "Analysis"("repositoryId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
