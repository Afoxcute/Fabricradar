/*
  Warnings:

  - You are about to drop the column `businessDescription` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `businessName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `specialization` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "businessDescription",
DROP COLUMN "businessName",
DROP COLUMN "specialization";
