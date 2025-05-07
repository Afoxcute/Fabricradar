-- CreateTable
CREATE TABLE "TailorToken" (
    "id" SERIAL NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 9,
    "initialSupply" DOUBLE PRECISION NOT NULL,
    "tailorId" INTEGER NOT NULL,
    "txSignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TailorToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TailorToken_mintAddress_key" ON "TailorToken"("mintAddress");

-- CreateIndex
CREATE INDEX "token_tailor_idx" ON "TailorToken"("tailorId");

-- AddForeignKey
ALTER TABLE "TailorToken" ADD CONSTRAINT "TailorToken_tailorId_fkey" FOREIGN KEY ("tailorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
