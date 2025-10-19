-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    trade_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    document VARCHAR(18) NOT NULL UNIQUE,
    state_registration VARCHAR(20),
    municipal_registration VARCHAR(20),
    address JSONB,
    tax_regime VARCHAR(30) NOT NULL,
    environment VARCHAR(20) NOT NULL DEFAULT 'homologacao',
    certificate_id UUID,
    next_nfe_number INTEGER NOT NULL DEFAULT 1,
    nfe_series INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_companies_account_id ON companies(account_id);
CREATE INDEX idx_companies_document ON companies(document);
CREATE INDEX idx_companies_certificate_id ON companies(certificate_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at);

-- Add check constraints
ALTER TABLE companies ADD CONSTRAINT chk_companies_tax_regime 
    CHECK (tax_regime IN ('simples_nacional', 'lucro_presumido', 'lucro_real', 'mei'));

ALTER TABLE companies ADD CONSTRAINT chk_companies_environment 
    CHECK (environment IN ('producao', 'homologacao'));

ALTER TABLE companies ADD CONSTRAINT chk_companies_status 
    CHECK (status IN ('active', 'inactive'));

ALTER TABLE companies ADD CONSTRAINT chk_companies_next_nfe_number 
    CHECK (next_nfe_number > 0);

ALTER TABLE companies ADD CONSTRAINT chk_companies_nfe_series 
    CHECK (nfe_series > 0);

-- Add comment
COMMENT ON TABLE companies IS 'Client companies (CNPJs)';

