/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_courseId_key" ON "Certificate"("userId", "courseId");
