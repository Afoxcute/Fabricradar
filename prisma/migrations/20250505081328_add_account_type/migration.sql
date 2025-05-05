/*
  Warnings:

  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'TAILOR');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'USER';
