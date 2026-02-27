/*
  Warnings:

  - You are about to drop the column `developerprofile` on the `Analysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "developerprofile",
ADD COLUMN     "developerProfile" JSONB;
