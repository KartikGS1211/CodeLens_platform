/*
  Warnings:

  - You are about to drop the column `modelComplexity` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "modelComplexity",
ADD COLUMN     "moduleComplexity" JSONB;
