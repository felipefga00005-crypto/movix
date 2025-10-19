-- Create carriers table
CREATE TABLE IF NOT EXISTS carriers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(18) NOT NULL,
    state_registration VARCHAR(20),
    
    -- Address
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    
    -- Vehicle
    vehicle_plate VARCHAR(10),
    vehicle_state VARCHAR(2),
    rntrc VARCHAR(20),
    
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_carriers_company_id ON carriers(company_id);
CREATE INDEX idx_carriers_document ON carriers(document);
CREATE INDEX idx_carriers_active ON carriers(active);
CREATE INDEX idx_carriers_deleted_at ON carriers(deleted_at);

-- Add check constraints
ALTER TABLE carriers ADD CONSTRAINT chk_carriers_state 
    CHECK (state ~ '^[A-Z]{2}$' OR state IS NULL);

ALTER TABLE carriers ADD CONSTRAINT chk_carriers_vehicle_state 
    CHECK (vehicle_state ~ '^[A-Z]{2}$' OR vehicle_state IS NULL);

ALTER TABLE carriers ADD CONSTRAINT chk_carriers_vehicle_plate 
    CHECK (vehicle_plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$' OR vehicle_plate IS NULL);

-- Add comment
COMMENT ON TABLE carriers IS 'Carriers/Transporters (transportadoras)';
COMMENT ON COLUMN carriers.rntrc IS 'Registro Nacional de Transportadores Rodoviários de Carga';
COMMENT ON COLUMN carriers.vehicle_plate IS 'Placa do veículo (formato AAA-9999 ou AAA9A99)';

