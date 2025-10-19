-- Revert NFes table refactoring
ALTER TABLE nfes 
DROP CONSTRAINT IF EXISTS chk_nfes_type,
DROP CONSTRAINT IF EXISTS chk_nfes_purpose,
DROP CONSTRAINT IF EXISTS chk_nfes_consumer_operation,
DROP CONSTRAINT IF EXISTS chk_nfes_presence_indicator,
DROP CONSTRAINT IF EXISTS chk_nfes_freight_mode,
DROP CONSTRAINT IF EXISTS chk_nfes_payment_indicator,
DROP COLUMN IF EXISTS customer_id,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS purpose,
DROP COLUMN IF EXISTS consumer_operation,
DROP COLUMN IF EXISTS presence_indicator,
DROP COLUMN IF EXISTS operation_nature,
DROP COLUMN IF EXISTS entry_exit_date,
DROP COLUMN IF EXISTS freight_mode,
DROP COLUMN IF EXISTS carrier_id,
DROP COLUMN IF EXISTS vehicle_plate,
DROP COLUMN IF EXISTS vehicle_state,
DROP COLUMN IF EXISTS vehicle_rntrc,
DROP COLUMN IF EXISTS payment_indicator,
DROP COLUMN IF EXISTS total_discount,
DROP COLUMN IF EXISTS total_freight,
DROP COLUMN IF EXISTS total_insurance,
DROP COLUMN IF EXISTS total_other_expenses,
DROP COLUMN IF EXISTS total_icms,
DROP COLUMN IF EXISTS total_icms_st,
DROP COLUMN IF EXISTS total_ipi,
DROP COLUMN IF EXISTS total_pis,
DROP COLUMN IF EXISTS total_cofins,
DROP COLUMN IF EXISTS total_fcp,
DROP COLUMN IF EXISTS additional_info,
DROP COLUMN IF EXISTS fiscal_info,
DROP COLUMN IF EXISTS referenced_nfes,
DROP COLUMN IF EXISTS cancellation_reason,
DROP COLUMN IF EXISTS cancellation_protocol;

-- Restore old columns
ALTER TABLE nfes 
ADD COLUMN IF NOT EXISTS customer JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]';

