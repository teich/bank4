-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_familyId_fkey";

-- CreateTable
CREATE TABLE "_FamilyToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FamilyToUser_AB_unique" ON "_FamilyToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_FamilyToUser_B_index" ON "_FamilyToUser"("B");

-- AddForeignKey
ALTER TABLE "_FamilyToUser" ADD CONSTRAINT "_FamilyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FamilyToUser" ADD CONSTRAINT "_FamilyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
