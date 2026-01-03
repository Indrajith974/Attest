-- Migration: Add witness_response_id to evidence table
-- Allows witnesses to upload supporting evidence with their responses

ALTER TABLE evidence ADD COLUMN witness_response_id TEXT REFERENCES witness_responses(id);
