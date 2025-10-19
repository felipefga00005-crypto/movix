-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'normal',
    person_type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(18) NOT NULL,
    state_registration VARCHAR(20),
    state_registration_type VARCHAR(20),
    municipal_registration VARCHAR(20),
    suframa VARCHAR(20),
    
    -- Address
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    city_code VARCHAR(10),
    country_code VARCHAR(10) DEFAULT '1058',
    country VARCHAR(100) DEFAULT 'Brasil',
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    
    -- Tax
    tax_regime VARCHAR(30),
    icms_contributor BOOLEAN DEFAULT FALSE,
    
    -- Additional
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_document ON customers(document);
CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);
CREATE INDEX idx_customers_company_document ON customers(company_id, document);

-- Add check constraints
ALTER TABLE customers ADD CONSTRAINT chk_customers_type 
    CHECK (type IN ('normal', 'foreign', 'consumer'));

ALTER TABLE customers ADD CONSTRAINT chk_customers_person_type 
    CHECK (person_type IN ('individual', 'legal'));

ALTER TABLE customers ADD CONSTRAINT chk_customers_state_registration_type 
    CHECK (state_registration_type IN ('contributor', 'exempt', 'non_contributor') OR state_registration_type IS NULL);

ALTER TABLE customers ADD CONSTRAINT chk_customers_state 
    CHECK (state ~ '^[A-Z]{2}$' OR state IS NULL);

-- Add comment
COMMENT ON TABLE customers IS 'Customers/Clients (destinatários da NFe)';
COMMENT ON COLUMN customers.document IS 'CPF ou CNPJ do cliente';
COMMENT ON COLUMN customers.city_code IS 'Código IBGE do município';
COMMENT ON COLUMN customers.country_code IS 'Código do país (1058 = Brasil)';

