/*
  Warnings:

  - You are about to drop the column `read` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('PRICE_DROP', 'NEW_OFFER', 'NEW_PROVIDER', 'SYSTEM_UPDATE', 'REVIEW_REQUEST', 'PROMOTION');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ');

-- DropIndex
DROP INDEX "public"."notification_read_idx";

-- AlterTable
ALTER TABLE "public"."notifications" DROP COLUMN "read",
ADD COLUMN     "actionUrl" TEXT,
ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "notification_status_idx" ON "public"."notifications"("status");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "notification_created_idx" ON "public"."notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
