/*
  Warnings:

  - You are about to drop the `aggregation_jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `aggregation_sources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."aggregation_jobs" DROP CONSTRAINT "aggregation_jobs_sourceId_fkey";

-- DropTable
DROP TABLE "public"."aggregation_jobs";

-- DropTable
DROP TABLE "public"."aggregation_sources";

-- DropEnum
DROP TYPE "public"."AggregationJobStatus";

-- DropEnum
DROP TYPE "public"."AggregationJobType";

-- DropEnum
DROP TYPE "public"."AggregationSourceType";

-- DropEnum
DROP TYPE "public"."AggregationStatus";

-- CreateTable
CREATE TABLE "public"."price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION,
    "changePercentage" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTriggeredAt" TIMESTAMP(3),

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_alert_user_idx" ON "public"."price_alerts"("userId");

-- CreateIndex
CREATE INDEX "price_alert_service_idx" ON "public"."price_alerts"("serviceId");

-- CreateIndex
CREATE INDEX "price_alert_active_idx" ON "public"."price_alerts"("isActive");

-- CreateIndex
CREATE INDEX "price_alert_type_idx" ON "public"."price_alerts"("type");

-- AddForeignKey
ALTER TABLE "public"."price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_alerts" ADD CONSTRAINT "price_alerts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
