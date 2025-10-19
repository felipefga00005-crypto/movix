-- Remove foreign key from companies table
ALTER TABLE companies DROP CONSTRAINT IF EXISTS fk_companies_certificate;

-- Drop certificates table
DROP TABLE IF EXISTS certificates CASCADE;

