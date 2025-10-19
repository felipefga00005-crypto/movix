-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(60) NOT NULL,
    description VARCHAR(255) NOT NULL,
    barcode VARCHAR(14),
    barcode_unit VARCHAR(14),
    ncm VARCHAR(8) NOT NULL,
    cest VARCHAR(7),
    cfop VARCHAR(4),
    commercial_unit VARCHAR(6) NOT NULL,
    tax_unit VARCHAR(6),
    cost_price DECIMAL(15,2) DEFAULT 0,
    sale_price DECIMAL(15,2) DEFAULT 0,
    origin SMALLINT NOT NULL DEFAULT 0,
    
    -- Stock
    current_stock DECIMAL(15,3) DEFAULT 0,
    min_stock DECIMAL(15,3) DEFAULT 0,
    max_stock DECIMAL(15,3) DEFAULT 0,
    
    -- Tax
    default_tax_rule_id UUID,
    
    -- Additional
    additional_info TEXT,
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_ncm ON products(ncm);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);
CREATE INDEX idx_products_default_tax_rule_id ON products(default_tax_rule_id);
CREATE UNIQUE INDEX idx_products_company_code ON products(company_id, code) WHERE deleted_at IS NULL;

-- Add check constraints
ALTER TABLE products ADD CONSTRAINT chk_products_origin 
    CHECK (origin >= 0 AND origin <= 8);

ALTER TABLE products ADD CONSTRAINT chk_products_ncm 
    CHECK (ncm ~ '^\d{8}$');

ALTER TABLE products ADD CONSTRAINT chk_products_cest 
    CHECK (cest ~ '^\d{7}$' OR cest IS NULL);

ALTER TABLE products ADD CONSTRAINT chk_products_cfop 
    CHECK (cfop ~ '^\d{4}$' OR cfop IS NULL);

ALTER TABLE products ADD CONSTRAINT chk_products_barcode 
    CHECK (barcode ~ '^\d{8,14}$' OR barcode IS NULL);

ALTER TABLE products ADD CONSTRAINT chk_products_prices 
    CHECK (cost_price >= 0 AND sale_price >= 0);

ALTER TABLE products ADD CONSTRAINT chk_products_stock 
    CHECK (current_stock >= 0 AND min_stock >= 0 AND max_stock >= 0);

-- Add comment
COMMENT ON TABLE products IS 'Products/Items for NFe';
COMMENT ON COLUMN products.code IS 'Código interno do produto';
COMMENT ON COLUMN products.ncm IS 'Código NCM (8 dígitos)';
COMMENT ON COLUMN products.cest IS 'Código CEST (7 dígitos)';
COMMENT ON COLUMN products.origin IS 'Origem da mercadoria (0-8)';
COMMENT ON COLUMN products.barcode IS 'GTIN/EAN do produto';

