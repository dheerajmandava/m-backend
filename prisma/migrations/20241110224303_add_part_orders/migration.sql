/*
  Warnings:

  - You are about to drop the column `orderDate` on the `PartOrder` table. All the data in the column will be lost.
  - You are about to drop the column `receivedQty` on the `PartOrderItem` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PartOrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PartOrder" DROP COLUMN "orderDate",
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PartOrderItem" DROP COLUMN "receivedQty",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
