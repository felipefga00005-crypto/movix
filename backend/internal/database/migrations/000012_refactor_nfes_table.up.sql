-- Refactor NFes table - Add new fields for complete NFe system
ALTER TABLE nfes 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS purpose SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS consumer_operation SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS presence_indicator SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS operation_nature VARCHAR(60) NOT NULL DEFAULT 'Venda',
ADD COLUMN IF NOT EXISTS entry_exit_date TIMESTAMP WITH TIME ZONE,

-- Transport
ADD COLUMN IF NOT EXISTS freight_mode SMALLINT DEFAULT 9,
ADD COLUMN IF NOT EXISTS carrier_id UUID REFERENCES carriers(id),
ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(10),
ADD COLUMN IF NOT EXISTS vehicle_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS vehicle_rntrc VARCHAR(20),

-- Payment
ADD COLUMN IF NOT EXISTS payment_indicator SMALLINT DEFAULT 0,

-- Totals
ADD COLUMN IF NOT EXISTS total_discount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_freight DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_insurance DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_other_expenses DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_icms DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_icms_st DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_ipi DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pis DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cofins DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fcp DECIMAL(15,2) DEFAULT 0,

-- Additional Info
ADD COLUMN IF NOT EXISTS additional_info TEXT,
ADD COLUMN IF NOT EXISTS fiscal_info TEXT,
ADD COLUMN IF NOT EXISTS referenced_nfes JSONB,

-- Cancellation
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS cancellation_protocol VARCHAR(50);

-- Drop old JSONB columns (customer and items now in separate tables)
ALTER TABLE nfes 
DROP COLUMN IF EXISTS customer,
DROP COLUMN IF EXISTS items;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nfes_customer_id ON nfes(customer_id);
CREATE INDEX IF NOT EXISTS idx_nfes_carrier_id ON nfes(carrier_id);
CREATE INDEX IF NOT EXISTS idx_nfes_type ON nfes(type);
CREATE INDEX IF NOT EXISTS idx_nfes_purpose ON nfes(purpose);

-- Add check constraints
ALTER TABLE nfes ADD CONSTRAINT chk_nfes_type 
    CHECK (type IN ('normal', 'nfce'));

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_purpose 
    CHECK (purpose >= 1 AND purpose <= 4);

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_consumer_operation 
    CHECK (consumer_operation IN (0, 1));

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_presence_indicator 
    CHECK (presence_indicator IN (0, 1, 2, 3, 4, 9));

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_freight_mode 
    CHECK (freight_mode IN (0, 1, 2, 3, 4, 9) OR freight_mode IS NULL);

ALTER TABLE nfes ADD CONSTRAINT chk_nfes_payment_indicator 
    CHECK (payment_indicator IN (0, 1, 2, 3, 4, 5));

-- Add comments
COMMENT ON COLUMN nfes.customer_id IS 'Referência ao cliente (destinatário)';
COMMENT ON COLUMN nfes.type IS 'Tipo de NFe (normal=55, nfce=65)';
COMMENT ON COLUMN nfes.purpose IS 'Finalidade (1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução)';
COMMENT ON COLUMN nfes.operation_nature IS 'Natureza da operação (ex: Venda, Devolução)';
COMMENT ON COLUMN nfes.freight_mode IS 'Modalidade do frete (0-4, 9)';
COMMENT ON COLUMN nfes.payment_indicator IS 'Indicador de pagamento (0=À vista, 1=A prazo)';
COMMENT ON COLUMN nfes.referenced_nfes IS 'Chaves de NFes referenciadas (JSON array)';

