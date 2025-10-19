-- Create user_companies table (pivot table)
CREATE TABLE IF NOT EXISTS user_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, company_id)
);

-- Create indexes
CREATE INDEX idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON user_companies(company_id);
CREATE INDEX idx_user_companies_role ON user_companies(role);

-- Add check constraints
ALTER TABLE user_companies ADD CONSTRAINT chk_user_companies_role 
    CHECK (role IN ('owner', 'manager', 'operator'));

-- Add comment
COMMENT ON TABLE user_companies IS 'Relationship between users and companies';

