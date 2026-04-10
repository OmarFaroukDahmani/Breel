/*
  Warnings:

  - You are about to drop the column `priority` on the `Projects` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Projects` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Projects_status_priority_createdAt_idx";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "priority",
DROP COLUMN "status";
