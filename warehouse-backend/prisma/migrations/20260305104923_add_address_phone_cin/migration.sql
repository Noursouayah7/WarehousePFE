/*
  Warnings:

  - A unique constraint covering the columns `[cin]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "cin" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_cin_key" ON "User"("cin");
