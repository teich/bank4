/*
  Warnings:

  - A unique constraint covering the columns `[email,familyId,createdAt]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Invite_email_familyId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_familyId_createdAt_key" ON "Invite"("email", "familyId", "createdAt");
