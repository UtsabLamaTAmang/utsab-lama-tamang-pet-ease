/*
  Warnings:

  - You are about to drop the column `notes` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `RescueReport` table. All the data in the column will be lost.
  - You are about to drop the column `locationText` on the `RescueReport` table. All the data in the column will be lost.
  - The `status` column on the `RescueReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `medications` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `RescueReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('VACCINATION', 'PET_DONATION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdoptionStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "AdoptionStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConsultationStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "ConsultationStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'CAMPAIGN_DONATION';

-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "appointmentDate" TIMESTAMP(3),
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leaveDays" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "campaignId" INTEGER;

-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "notes",
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "medications" JSONB NOT NULL,
ADD COLUMN     "petId" INTEGER;

-- AlterTable
ALTER TABLE "RescueReport" DROP COLUMN "imageUrl",
DROP COLUMN "locationText",
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "petType" TEXT,
ADD COLUMN     "urgency" TEXT NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "RescueReportStatus";

-- CreateTable
CREATE TABLE "Badge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "targetAmount" INTEGER NOT NULL DEFAULT 0,
    "raisedAmount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
