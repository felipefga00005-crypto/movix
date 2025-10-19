-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    document VARCHAR(18) NOT NULL UNIQUE,
    max_companies INTEGER NOT NULL DEFAULT 10,
    max_users INTEGER NOT NULL DEFAULT 50,
    max_nfes_per_month INTEGER NOT NULL DEFAULT 1000,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_accounts_document ON accounts(document);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);

-- Add check constraints
ALTER TABLE accounts ADD CONSTRAINT chk_accounts_status 
    CHECK (status IN ('active', 'suspended', 'cancelled'));

ALTER TABLE accounts ADD CONSTRAINT chk_accounts_max_companies 
    CHECK (max_companies > 0);

ALTER TABLE accounts ADD CONSTRAINT chk_accounts_max_users 
    CHECK (max_users > 0);

ALTER TABLE accounts ADD CONSTRAINT chk_accounts_max_nfes_per_month 
    CHECK (max_nfes_per_month > 0);

-- Add comment
COMMENT ON TABLE accounts IS 'Accounting offices (escritórios de contabilidade)';

