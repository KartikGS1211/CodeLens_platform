/*
  Warnings:

  - You are about to drop the column `stackSkills` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "stackSkills",
ADD COLUMN     "skillRadar" JSONB;
