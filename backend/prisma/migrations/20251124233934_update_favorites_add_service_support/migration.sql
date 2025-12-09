/*
  Warnings:

  - The values [UNDER_REVIEW] on the enum `ProviderRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `businessAddress` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `businessCity` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `businessEmail` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `businessPhone` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `businessRegion` on the `provider_requests` table. All the data in the column will be lost.
  - You are about to drop the column `businessRut` on the `provider_requests` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,serviceId]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `favorites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `provider_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `provider_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `provider_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `provider_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProviderRequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."provider_requests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."provider_requests" ALTER COLUMN "status" TYPE "public"."ProviderRequestStatus_new" USING ("status"::text::"public"."ProviderRequestStatus_new");
ALTER TYPE "public"."ProviderRequestStatus" RENAME TO "ProviderRequestStatus_old";
ALTER TYPE "public"."ProviderRequestStatus_new" RENAME TO "ProviderRequestStatus";
DROP TYPE "public"."ProviderRequestStatus_old";
ALTER TABLE "public"."provider_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."favorites" ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "providerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."provider_requests" DROP COLUMN "businessAddress",
DROP COLUMN "businessCity",
DROP COLUMN "businessEmail",
DROP COLUMN "businessPhone",
DROP COLUMN "businessRegion",
DROP COLUMN "businessRut",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "documents" JSONB,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "businessType" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "favorite_provider_idx" ON "public"."favorites"("providerId");

-- CreateIndex
CREATE INDEX "favorite_service_idx" ON "public"."favorites"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_serviceId_key" ON "public"."favorites"("userId", "serviceId");

-- CreateIndex
CREATE INDEX "provider_request_date_idx" ON "public"."provider_requests"("requestedAt");

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."provider_requests_status_idx" RENAME TO "provider_request_status_idx";

-- RenameIndex
ALTER INDEX "public"."provider_requests_userId_idx" RENAME TO "provider_request_user_idx";
