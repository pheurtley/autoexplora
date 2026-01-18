-- Migration: Remove CONCESIONARIO from DealerType enum
-- This migration consolidates CONCESIONARIO into AUTOMOTORA

-- Step 1: Update any existing CONCESIONARIO dealers to AUTOMOTORA
UPDATE "Dealer" SET "type" = 'AUTOMOTORA' WHERE "type" = 'CONCESIONARIO';

-- Step 2: Alter the enum to remove CONCESIONARIO
-- PostgreSQL requires recreating the enum

-- Create new enum without CONCESIONARIO
CREATE TYPE "DealerType_new" AS ENUM ('AUTOMOTORA', 'RENT_A_CAR');

-- Update the column to use the new enum
ALTER TABLE "Dealer" ALTER COLUMN "type" TYPE "DealerType_new" USING ("type"::text::"DealerType_new");

-- Drop old enum and rename new one
DROP TYPE "DealerType";
ALTER TYPE "DealerType_new" RENAME TO "DealerType";
