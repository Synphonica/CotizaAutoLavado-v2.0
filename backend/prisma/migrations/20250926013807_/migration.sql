/*
  Warnings:

  - You are about to drop the `price_alerts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."price_alerts" DROP CONSTRAINT "price_alerts_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."price_alerts" DROP CONSTRAINT "price_alerts_userId_fkey";

-- DropTable
DROP TABLE "public"."price_alerts";
