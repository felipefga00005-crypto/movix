-- Remove unique constraint from access_key
ALTER TABLE nfes DROP CONSTRAINT IF EXISTS nfes_access_key_key;
DROP INDEX IF EXISTS idx_nfes_access_key;
DROP INDEX IF EXISTS nfes_access_key_key;

-- Create a regular index instead (allows duplicate empty strings)
CREATE INDEX IF NOT EXISTS idx_nfes_access_key ON nfes(access_key) WHERE access_key != '';

-- Add a unique partial index for non-empty access keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_nfes_access_key_unique ON nfes(access_key) WHERE access_key != '';

