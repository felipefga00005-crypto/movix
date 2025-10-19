-- Create CFOPs table
CREATE TABLE IF NOT EXISTS cfops (
    code VARCHAR(4) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL,
    application TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_cfops_type ON cfops(type);
CREATE INDEX idx_cfops_deleted_at ON cfops(deleted_at);

-- Add check constraints
ALTER TABLE cfops ADD CONSTRAINT chk_cfops_type 
    CHECK (type IN ('entrada', 'saida'));

ALTER TABLE cfops ADD CONSTRAINT chk_cfops_code 
    CHECK (code ~ '^\d{4}$');

-- Insert common CFOPs
INSERT INTO cfops (code, description, type, application) VALUES
-- Vendas dentro do estado
('5101', 'Venda de produção do estabelecimento', 'saida', 'Venda de mercadoria produzida pelo próprio estabelecimento'),
('5102', 'Venda de mercadoria adquirida ou recebida de terceiros', 'saida', 'Venda de mercadoria adquirida ou recebida de terceiros para industrialização ou comercialização'),
('5103', 'Venda de produção do estabelecimento, efetuada fora do estabelecimento', 'saida', 'Venda de mercadoria produzida pelo estabelecimento, efetuada fora do estabelecimento'),
('5104', 'Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento', 'saida', 'Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento'),
('5405', 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária', 'saida', 'Venda de mercadoria sujeita ao regime de substituição tributária'),

-- Vendas para outros estados
('6101', 'Venda de produção do estabelecimento', 'saida', 'Venda interestadual de mercadoria produzida pelo próprio estabelecimento'),
('6102', 'Venda de mercadoria adquirida ou recebida de terceiros', 'saida', 'Venda interestadual de mercadoria adquirida ou recebida de terceiros'),
('6103', 'Venda de produção do estabelecimento, efetuada fora do estabelecimento', 'saida', 'Venda interestadual de mercadoria produzida pelo estabelecimento, efetuada fora do estabelecimento'),
('6104', 'Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento', 'saida', 'Venda interestadual de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento'),
('6405', 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária', 'saida', 'Venda interestadual de mercadoria sujeita ao regime de substituição tributária'),

-- Compras dentro do estado
('1102', 'Compra para comercialização', 'entrada', 'Compra de mercadoria para comercialização'),
('1101', 'Compra para industrialização', 'entrada', 'Compra de mercadoria para industrialização'),

-- Compras de outros estados
('2102', 'Compra para comercialização', 'entrada', 'Compra interestadual de mercadoria para comercialização'),
('2101', 'Compra para industrialização', 'entrada', 'Compra interestadual de mercadoria para industrialização'),

-- Devoluções dentro do estado
('5202', 'Devolução de compra para comercialização', 'saida', 'Devolução de mercadoria adquirida para comercialização'),
('5201', 'Devolução de compra para industrialização', 'saida', 'Devolução de mercadoria adquirida para industrialização'),
('1202', 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', 'entrada', 'Devolução de mercadoria vendida'),
('1201', 'Devolução de venda de produção do estabelecimento', 'entrada', 'Devolução de mercadoria produzida pelo estabelecimento'),

-- Devoluções interestaduais
('6202', 'Devolução de compra para comercialização', 'saida', 'Devolução interestadual de mercadoria adquirida para comercialização'),
('6201', 'Devolução de compra para industrialização', 'saida', 'Devolução interestadual de mercadoria adquirida para industrialização'),
('2202', 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', 'entrada', 'Devolução interestadual de mercadoria vendida'),
('2201', 'Devolução de venda de produção do estabelecimento', 'entrada', 'Devolução interestadual de mercadoria produzida pelo estabelecimento'),

-- Transferências
('5151', 'Transferência de produção do estabelecimento', 'saida', 'Transferência de mercadoria produzida pelo estabelecimento'),
('5152', 'Transferência de mercadoria adquirida ou recebida de terceiros', 'saida', 'Transferência de mercadoria adquirida ou recebida de terceiros'),
('6151', 'Transferência de produção do estabelecimento', 'saida', 'Transferência interestadual de mercadoria produzida pelo estabelecimento'),
('6152', 'Transferência de mercadoria adquirida ou recebida de terceiros', 'saida', 'Transferência interestadual de mercadoria adquirida ou recebida de terceiros')
ON CONFLICT (code) DO NOTHING;

-- Add comment
COMMENT ON TABLE cfops IS 'Código Fiscal de Operações e Prestações';
COMMENT ON COLUMN cfops.code IS 'Código CFOP (4 dígitos)';
COMMENT ON COLUMN cfops.type IS 'Tipo de operação (entrada ou saída)';

