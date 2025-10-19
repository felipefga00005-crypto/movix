-- Add new fields to companies table for NFe system
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS cnae VARCHAR(10),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS next_nfce_number INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS nfce_series INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS default_additional_info TEXT;

-- Add check constraints for new fields
ALTER TABLE companies ADD CONSTRAINT chk_companies_next_nfce_number 
    CHECK (next_nfce_number > 0);

ALTER TABLE companies ADD CONSTRAINT chk_companies_nfce_series 
    CHECK (nfce_series > 0);

-- Add comment
COMMENT ON COLUMN companies.cnae IS 'Código CNAE da empresa';
COMMENT ON COLUMN companies.phone IS 'Telefone da empresa';
COMMENT ON COLUMN companies.email IS 'Email da empresa';
COMMENT ON COLUMN companies.next_nfce_number IS 'Próximo número de NFC-e';
COMMENT ON COLUMN companies.nfce_series IS 'Série da NFC-e';
COMMENT ON COLUMN companies.default_additional_info IS 'Informações adicionais padrão para NFe';

