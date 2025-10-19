-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content BYTEA NOT NULL,
    password VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_certificates_company_id ON certificates(company_id);
CREATE INDEX idx_certificates_expires_at ON certificates(expires_at);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_deleted_at ON certificates(deleted_at);

-- Add check constraints
ALTER TABLE certificates ADD CONSTRAINT chk_certificates_status 
    CHECK (status IN ('active', 'expired'));

-- Add foreign key to companies table
ALTER TABLE companies ADD CONSTRAINT fk_companies_certificate 
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE SET NULL;

-- Add comment
COMMENT ON TABLE certificates IS 'Digital certificates (A1) for NFe signing';

