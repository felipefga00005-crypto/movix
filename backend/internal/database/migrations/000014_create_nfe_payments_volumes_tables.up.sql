-- Create nfe_payments table
CREATE TABLE IF NOT EXISTS nfe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfe_id UUID NOT NULL REFERENCES nfes(id) ON DELETE CASCADE,
    method VARCHAR(2) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    
    -- Card info
    card_cnpj VARCHAR(18),
    card_flag VARCHAR(2),
    card_authorization_code VARCHAR(20),
    
    -- PIX info
    pix_key VARCHAR(255),
    
    -- Installment info
    due_date TIMESTAMP WITH TIME ZONE,
    installment_number INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create nfe_volumes table
CREATE TABLE IF NOT EXISTS nfe_volumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfe_id UUID NOT NULL REFERENCES nfes(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    species VARCHAR(60),
    brand VARCHAR(60),
    numbering VARCHAR(60),
    gross_weight DECIMAL(15,3) DEFAULT 0,
    net_weight DECIMAL(15,3) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_nfe_payments_nfe_id ON nfe_payments(nfe_id);
CREATE INDEX idx_nfe_volumes_nfe_id ON nfe_volumes(nfe_id);

-- Add check constraints
ALTER TABLE nfe_payments ADD CONSTRAINT chk_nfe_payments_value 
    CHECK (value > 0);

ALTER TABLE nfe_payments ADD CONSTRAINT chk_nfe_payments_installment 
    CHECK (installment_number > 0);

ALTER TABLE nfe_volumes ADD CONSTRAINT chk_nfe_volumes_quantity 
    CHECK (quantity > 0);

ALTER TABLE nfe_volumes ADD CONSTRAINT chk_nfe_volumes_weights 
    CHECK (gross_weight >= 0 AND net_weight >= 0);

-- Add comments
COMMENT ON TABLE nfe_payments IS 'Payment methods for NFe';
COMMENT ON TABLE nfe_volumes IS 'Transport volumes for NFe';
COMMENT ON COLUMN nfe_payments.method IS 'Payment method code (01-99)';
COMMENT ON COLUMN nfe_payments.card_flag IS 'Card flag (01=Visa, 02=Mastercard, etc)';
COMMENT ON COLUMN nfe_volumes.species IS 'Package type (Caixa, Fardo, etc)';

