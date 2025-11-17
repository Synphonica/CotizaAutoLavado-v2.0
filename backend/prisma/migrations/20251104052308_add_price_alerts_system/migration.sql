-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'PRICE_ALERT';

-- CreateTable
CREATE TABLE "public"."price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "targetPrice" DECIMAL(10,2),
    "percentageOff" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifyInApp" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "triggeredCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_history" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "oldPrice" DECIMAL(10,2),
    "changeType" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_alert_user_idx" ON "public"."price_alerts"("userId");

-- CreateIndex
CREATE INDEX "price_alert_service_idx" ON "public"."price_alerts"("serviceId");

-- CreateIndex
CREATE INDEX "price_alert_active_idx" ON "public"."price_alerts"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "price_alerts_userId_serviceId_key" ON "public"."price_alerts"("userId", "serviceId");

-- CreateIndex
CREATE INDEX "price_history_service_idx" ON "public"."price_history"("serviceId");

-- CreateIndex
CREATE INDEX "price_history_date_idx" ON "public"."price_history"("recordedAt");

-- AddForeignKey
ALTER TABLE "public"."price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_alerts" ADD CONSTRAINT "price_alerts_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."price_history" ADD CONSTRAINT "price_history_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
