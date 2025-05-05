/*
  Warnings:

  - You are about to drop the column `delivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "delivery",
DROP COLUMN "paymentMethod",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "designId" INTEGER,
ADD COLUMN     "isAccepted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "accepted_idx" ON "Order"("isAccepted");

-- CreateIndex
CREATE INDEX "deadline_idx" ON "Order"("acceptanceDeadline");
