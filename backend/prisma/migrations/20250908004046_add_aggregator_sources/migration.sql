-- CreateEnum
CREATE TYPE "public"."AggregationSourceType" AS ENUM ('WEB_SCRAPING', 'API_INTEGRATION', 'MANUAL_ENTRY', 'PARTNER_FEED', 'SOCIAL_MEDIA');

-- CreateEnum
CREATE TYPE "public"."AggregationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."AggregationJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."AggregationJobType" AS ENUM ('FULL_SYNC', 'INCREMENTAL', 'MANUAL', 'SCHEDULED');

-- CreateTable
CREATE TABLE "public"."aggregation_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."AggregationSourceType" NOT NULL,
    "baseUrl" TEXT,
    "config" JSONB,
    "updateInterval" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."AggregationStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "lastSuccessfulUpdate" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aggregation_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."aggregation_jobs" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "public"."AggregationJobType" NOT NULL,
    "status" "public"."AggregationJobStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB,
    "result" JSONB,
    "error" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "aggregation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aggregation_source_type_idx" ON "public"."aggregation_sources"("type");

-- CreateIndex
CREATE INDEX "aggregation_source_status_idx" ON "public"."aggregation_sources"("status");

-- CreateIndex
CREATE INDEX "aggregation_source_active_idx" ON "public"."aggregation_sources"("isActive");

-- CreateIndex
CREATE INDEX "aggregation_job_source_idx" ON "public"."aggregation_jobs"("sourceId");

-- CreateIndex
CREATE INDEX "aggregation_job_status_idx" ON "public"."aggregation_jobs"("status");

-- CreateIndex
CREATE INDEX "aggregation_job_type_idx" ON "public"."aggregation_jobs"("type");

-- CreateIndex
CREATE INDEX "aggregation_job_priority_idx" ON "public"."aggregation_jobs"("priority");

-- CreateIndex
CREATE INDEX "aggregation_job_created_idx" ON "public"."aggregation_jobs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."aggregation_jobs" ADD CONSTRAINT "aggregation_jobs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."aggregation_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
