-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED', 'FAILED', 'DELAYED');

-- CreateTable
CREATE TABLE "JobHistory" (
    "id" SERIAL NOT NULL,
    "jobId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "plan" "Plan" NOT NULL,
    "priority" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "processingMs" INTEGER,
    "error" TEXT,
    "videoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobHistory_jobId_key" ON "JobHistory"("jobId");

-- AddForeignKey
ALTER TABLE "JobHistory" ADD CONSTRAINT "JobHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
