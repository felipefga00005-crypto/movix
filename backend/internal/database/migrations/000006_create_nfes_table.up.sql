-- Create nfes table
CREATE TABLE IF NOT EXISTS nfes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    number INTEGER NOT NULL,
    series INTEGER NOT NULL DEFAULT 1,
    model VARCHAR(10) NOT NULL DEFAULT '55',
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    total_products DECIMAL(15,2) NOT NULL,
    total_nfe DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    access_key VARCHAR(44) UNIQUE,
    protocol VARCHAR(50),
    xml TEXT,
    issued_at TIMESTAMP WITH TIME ZONE,
    authorized_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, number, series)
);

-- Create indexes
CREATE INDEX idx_nfes_company_id ON nfes(company_id);
CREATE INDEX idx_nfes_user_id ON nfes(user_id);
CREATE INDEX idx_nfes_number ON nfes(number);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_nfes_access_key ON nfes(access_key);
CREATE INDEX idx_nfes_issued_at ON nfes(issued_at);
CREATE INDEX idx_nfes_deleted_at ON nfes(deleted_at);

-- Add check constraints
ALTER TABLE nfes ADD CONSTRAINT chk_nfes_status 
    CHECK (status IN ('draft', 'pending', 'authorized', 'rejected', 'cancelled'));

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_number 
    CHECK (number > 0);

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_series 
    CHECK (series > 0);

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_total_products 
    CHECK (total_products >= 0);

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_total_nfe 
    CHECK (total_nfe >= 0);

-- Add comment
COMMENT ON TABLE nfes IS 'Notas Fiscais Eletrônicas (NFe)';

