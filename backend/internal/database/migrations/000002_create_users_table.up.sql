-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Add check constraints
ALTER TABLE users ADD CONSTRAINT chk_users_role 
    CHECK (role IN ('superadmin', 'admin', 'user'));

ALTER TABLE users ADD CONSTRAINT chk_users_status 
    CHECK (status IN ('active', 'inactive', 'suspended'));

-- Add check constraint: superadmin must have NULL account_id
ALTER TABLE users ADD CONSTRAINT chk_users_superadmin_account 
    CHECK (
        (role = 'superadmin' AND account_id IS NULL) OR 
        (role != 'superadmin' AND account_id IS NOT NULL)
    );

-- Add comment
COMMENT ON TABLE users IS 'System users (superadmin, admin, user)';

