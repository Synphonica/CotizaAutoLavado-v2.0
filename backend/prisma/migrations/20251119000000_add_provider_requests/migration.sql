-- CreateEnum
CREATE TYPE "ProviderRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW');

-- CreateTable
CREATE TABLE "provider_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessRut" TEXT,
    "businessEmail" TEXT NOT NULL,
    "businessPhone" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "businessCity" TEXT NOT NULL,
    "businessRegion" TEXT NOT NULL,
    "businessType" TEXT NOT NULL DEFAULT 'CAR_WASH',
    "description" TEXT,
    "status" "ProviderRequestStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_requests_userId_idx" ON "provider_requests"("userId");

-- CreateIndex
CREATE INDEX "provider_requests_status_idx" ON "provider_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "provider_requests_userId_status_key" ON "provider_requests"("userId", "status") WHERE status = 'PENDING';

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_requests" ADD CONSTRAINT "provider_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
