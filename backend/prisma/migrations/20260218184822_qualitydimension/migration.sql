/*
  Warnings:

  - You are about to drop the column `codeQuality` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `modelComplexity` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "codeQuality",
DROP COLUMN "modelComplexity",
ADD COLUMN     "moduleComplexity" JSONB,
ADD COLUMN     "qualityDimensions" JSONB,
ADD COLUMN     "qualityTrend" JSONB;
