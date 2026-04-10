-- CreateIndex
CREATE INDEX "Projects_status_priority_createdAt_idx" ON "Projects"("status", "priority", "createdAt");
