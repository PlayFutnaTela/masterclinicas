-- CreateEnum for UserRole
CREATE TYPE "UserRole" AS ENUM ('admin', 'gerente', 'operador');

-- CreateTable organizations
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "whatsappLink" TEXT,
    "webhookUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable user_organizations
CREATE TABLE "user_organizations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'operador',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("id")
);

-- Modify users table: remove clinicName, role, webhookUrl, apiKey, whatsappLink
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinicName";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "webhookUrl";
ALTER TABLE "users" DROP COLUMN IF EXISTS "apiKey";
ALTER TABLE "users" DROP COLUMN IF EXISTS "whatsappLink";

-- Add organizationId to leads
ALTER TABLE "leads" ADD COLUMN "organizationId" TEXT;

-- Add organizationId to appointments
ALTER TABLE "appointments" ADD COLUMN "organizationId" TEXT;

-- Add organizationId to metric_events
ALTER TABLE "metric_events" ADD COLUMN "organizationId" TEXT;

-- Add unique constraint on organizations.slug
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- Add indexes
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");
CREATE INDEX "user_organizations_userId_idx" ON "user_organizations"("userId");
CREATE INDEX "user_organizations_organizationId_idx" ON "user_organizations"("organizationId");
CREATE INDEX "leads_organizationId_idx" ON "leads"("organizationId");
CREATE INDEX "leads_userId_idx" ON "leads"("userId");
CREATE INDEX "appointments_organizationId_idx" ON "appointments"("organizationId");
CREATE INDEX "appointments_userId_idx" ON "appointments"("userId");
CREATE INDEX "metric_events_organizationId_idx" ON "metric_events"("organizationId");
CREATE INDEX "metric_events_userId_idx" ON "metric_events"("userId");

-- Add unique constraint on user_organizations (userId, organizationId)
CREATE UNIQUE INDEX "user_organizations_userId_organizationId_key" ON "user_organizations"("userId", "organizationId");

-- Add foreign keys
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "leads" ADD CONSTRAINT "leads_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "metric_events" ADD CONSTRAINT "metric_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
