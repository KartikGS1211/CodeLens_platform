-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "repositoryUrl" TEXT NOT NULL,
    "repositoryName" TEXT NOT NULL,
    "owner" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "analysisId" TEXT,
    "lastSyncDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_repositoryUrl_key" ON "Repository"("repositoryUrl");
