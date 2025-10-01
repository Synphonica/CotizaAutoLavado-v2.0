/*
  Warnings:

  - You are about to drop the column `basePrice` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDuration` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `maxConcurrent` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `seasonalEnd` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `seasonalStart` on the `services` table. All the data in the column will be lost.
  - Added the required column `duration` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."ServiceStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "public"."providers" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."services" DROP COLUMN "basePrice",
DROP COLUMN "estimatedDuration",
DROP COLUMN "maxConcurrent",
DROP COLUMN "seasonalEnd",
DROP COLUMN "seasonalStart",
ADD COLUMN     "additionalImages" TEXT[],
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "discountedPrice" DECIMAL(10,2),
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "includedServices" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAdvanceBooking" INTEGER,
ADD COLUMN     "maxCapacity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minAdvanceBooking" INTEGER,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "requiresAppointment" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "clerkId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "service_provider_idx" ON "public"."services"("providerId");

-- CreateIndex
CREATE INDEX "service_status_idx" ON "public"."services"("status");

-- CreateIndex
CREATE INDEX "service_category_idx" ON "public"."services"("category");

-- CreateIndex
CREATE INDEX "service_available_idx" ON "public"."services"("isAvailable");

-- CreateIndex
CREATE INDEX "service_featured_idx" ON "public"."services"("isFeatured");

-- CreateIndex
CREATE INDEX "service_deleted_idx" ON "public"."services"("deletedAt");
