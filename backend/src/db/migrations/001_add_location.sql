-- Migration: Add location fields to claims
-- Run this after initial schema creation to add location support

-- Add location columns to claims table
ALTER TABLE claims ADD COLUMN location_lat REAL;
ALTER TABLE claims ADD COLUMN location_lng REAL;
ALTER TABLE claims ADD COLUMN location_address TEXT;
ALTER TABLE claims ADD COLUMN location_captured_at TEXT;
