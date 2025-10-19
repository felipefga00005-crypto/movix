-- Create nfe_items table
CREATE TABLE IF NOT EXISTS nfe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nfe_id UUID NOT NULL REFERENCES nfes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    number INTEGER NOT NULL,
    
    -- Product Info
    code VARCHAR(60) NOT NULL,
    barcode VARCHAR(14),
    description VARCHAR(255) NOT NULL,
    ncm VARCHAR(8) NOT NULL,
    cest VARCHAR(7),
    cfop VARCHAR(4) NOT NULL,
    
    -- Units and Quantities
    commercial_unit VARCHAR(6) NOT NULL,
    commercial_quantity DECIMAL(15,4) NOT NULL,
    commercial_unit_price DECIMAL(15,10) NOT NULL,
    tax_unit VARCHAR(6),
    tax_quantity DECIMAL(15,4),
    tax_unit_price DECIMAL(15,10),
    
    -- Values
    total_gross DECIMAL(15,2) NOT NULL,
    discount DECIMAL(15,2) DEFAULT 0,
    freight DECIMAL(15,2) DEFAULT 0,
    insurance DECIMAL(15,2) DEFAULT 0,
    other_expenses DECIMAL(15,2) DEFAULT 0,
    total_net DECIMAL(15,2) NOT NULL,
    
    -- ICMS
    icms_origin SMALLINT NOT NULL,
    icms_cst VARCHAR(3),
    icms_csosn VARCHAR(4),
    icms_mod_bc SMALLINT,
    icms_base_calc DECIMAL(15,2) DEFAULT 0,
    icms_rate DECIMAL(5,2) DEFAULT 0,
    icms_value DECIMAL(15,2) DEFAULT 0,
    icms_reduced_base_perc DECIMAL(5,2) DEFAULT 0,
    
    -- ICMS ST
    icms_st_mod_bc SMALLINT,
    icms_st_mva DECIMAL(5,2) DEFAULT 0,
    icms_st_base_calc DECIMAL(15,2) DEFAULT 0,
    icms_st_rate DECIMAL(5,2) DEFAULT 0,
    icms_st_value DECIMAL(15,2) DEFAULT 0,
    
    -- FCP
    fcp_base_calc DECIMAL(15,2) DEFAULT 0,
    fcp_rate DECIMAL(5,2) DEFAULT 0,
    fcp_value DECIMAL(15,2) DEFAULT 0,
    fcp_st_base_calc DECIMAL(15,2) DEFAULT 0,
    fcp_st_rate DECIMAL(5,2) DEFAULT 0,
    fcp_st_value DECIMAL(15,2) DEFAULT 0,
    
    -- IPI
    ipi_cst VARCHAR(3),
    ipi_base_calc DECIMAL(15,2) DEFAULT 0,
    ipi_rate DECIMAL(5,2) DEFAULT 0,
    ipi_value DECIMAL(15,2) DEFAULT 0,
    
    -- PIS
    pis_cst VARCHAR(2),
    pis_base_calc DECIMAL(15,2) DEFAULT 0,
    pis_rate DECIMAL(5,4) DEFAULT 0,
    pis_value DECIMAL(15,2) DEFAULT 0,
    
    -- COFINS
    cofins_cst VARCHAR(2),
    cofins_base_calc DECIMAL(15,2) DEFAULT 0,
    cofins_rate DECIMAL(5,4) DEFAULT 0,
    cofins_value DECIMAL(15,2) DEFAULT 0,
    
    -- Additional
    additional_info TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_nfe_items_nfe_id ON nfe_items(nfe_id);
CREATE INDEX idx_nfe_items_product_id ON nfe_items(product_id);
CREATE INDEX idx_nfe_items_nfe_number ON nfe_items(nfe_id, number);

-- Add check constraints
ALTER TABLE nfe_items ADD CONSTRAINT chk_nfe_items_icms_origin 
    CHECK (icms_origin >= 0 AND icms_origin <= 8);

ALTER TABLE nfe_items ADD CONSTRAINT chk_nfe_items_number 
    CHECK (number > 0);

ALTER TABLE nfe_items ADD CONSTRAINT chk_nfe_items_quantities 
    CHECK (commercial_quantity > 0 AND commercial_unit_price >= 0);

-- Add comments
COMMENT ON TABLE nfe_items IS 'Items of NFe';
COMMENT ON COLUMN nfe_items.number IS 'Item number in the NFe (sequential)';
COMMENT ON COLUMN nfe_items.icms_origin IS 'Product origin (0-8)';
COMMENT ON COLUMN nfe_items.icms_cst IS 'CST ICMS for normal regime';
COMMENT ON COLUMN nfe_items.icms_csosn IS 'CSOSN for Simples Nacional';

