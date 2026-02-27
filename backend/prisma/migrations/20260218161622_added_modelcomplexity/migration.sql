/*
  Warnings:

  - You are about to drop the column `moduleComplexity` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "moduleComplexity",
ADD COLUMN     "modelComplexity" JSONB;
