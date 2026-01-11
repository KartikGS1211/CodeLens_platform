-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "repoName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "languages" TEXT[],
    "commits" INTEGER,
    "files" INTEGER,
    "codeQuality" JSONB,
    "codeQualitySource" TEXT,
    "aiReview" JSONB,
    "skillsProfile" JSONB,
    "bestPractices" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);
