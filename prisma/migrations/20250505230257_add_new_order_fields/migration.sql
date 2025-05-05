-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "acceptanceDeadline" TIMESTAMP(3),
ADD COLUMN     "delivery" JSONB,
ADD COLUMN     "paymentMethod" TEXT;
