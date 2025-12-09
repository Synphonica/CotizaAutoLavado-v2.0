-- CreateIndex: Performance optimization indices for faster queries
-- These composite indices significantly improve query performance for common operations

-- Provider table indices
CREATE INDEX IF NOT EXISTS "provider_city_status_idx" ON "public"."providers"("city", "status");
CREATE INDEX IF NOT EXISTS "provider_status_rating_idx" ON "public"."providers"("status", "rating");

-- Service table indices
CREATE INDEX IF NOT EXISTS "service_provider_active_idx" ON "public"."services"("providerId", "status", "isAvailable");
CREATE INDEX IF NOT EXISTS "service_type_status_idx" ON "public"."services"("type", "status");
CREATE INDEX IF NOT EXISTS "service_price_idx" ON "public"."services"("price");
