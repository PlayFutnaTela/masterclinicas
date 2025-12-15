-- Migration: Add organizationId to users table
-- Created: $(date)
-- Description: Add organizationId column to users table for admin/operador users

-- Add organizationId column to users table
ALTER TABLE users ADD COLUMN "organizationId" TEXT;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX "users_organizationId_idx" ON users("organizationId");