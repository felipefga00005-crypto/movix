-- Revert to unique index (this may fail if there are duplicate empty strings)
DROP INDEX IF EXISTS idx_nfes_access_key;
DROP INDEX IF EXISTS idx_nfes_access_key_unique;

-- Recreate the original unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_nfes_access_key ON nfes(access_key);

