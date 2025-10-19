-- Remove new fields from companies table
ALTER TABLE companies 
DROP CONSTRAINT IF EXISTS chk_companies_next_nfce_number,
DROP CONSTRAINT IF EXISTS chk_companies_nfce_series,
DROP COLUMN IF EXISTS cnae,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS next_nfce_number,
DROP COLUMN IF EXISTS nfce_series,
DROP COLUMN IF EXISTS default_additional_info;

