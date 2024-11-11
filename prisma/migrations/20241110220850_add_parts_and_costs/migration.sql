-- AlterTable
ALTER TABLE "JobCard" ADD COLUMN     "laborRate" DOUBLE PRECISION,
ADD COLUMN     "markup" DOUBLE PRECISION,
ADD COLUMN     "totalLabor" DOUBLE PRECISION,
ADD COLUMN     "totalOther" DOUBLE PRECISION,
ADD COLUMN     "totalParts" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "jobCardId" TEXT,
    "name" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCost" (
    "id" TEXT NOT NULL,
    "jobCardId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hours" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Part_shopId_idx" ON "Part"("shopId");

-- CreateIndex
CREATE INDEX "Part_jobCardId_idx" ON "Part"("jobCardId");

-- CreateIndex
CREATE INDEX "JobCost_jobCardId_idx" ON "JobCost"("jobCardId");

-- CreateIndex
CREATE INDEX "Shop_clerkUserId_idx" ON "Shop"("clerkUserId");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCost" ADD CONSTRAINT "JobCost_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "JobCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
