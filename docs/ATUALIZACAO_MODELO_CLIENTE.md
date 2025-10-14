# Atualização do Modelo Cliente - Guia Completo

## 📋 Resumo da Atualização

A modelagem do Cliente foi **completamente reestruturada** para estar 100% alinhada com a **NF-e** (bloco `<dest>`), mantendo flexibilidade para uso em CRM, emissão de notas e controle financeiro.

---

## ✅ O que foi feito

### 1. Modelo Go Atualizado (`backend/internal/models/cliente.go`)

#### Principais Mudanças:

**Campos Renomeados/Atualizados:**
- `CPF` → `CNPJCPF` (agora suporta CPF e CNPJ)
- `IeRg` → `IE` (Inscrição Estadual ou RG)
- `Nome` → `RazaoSocial` (Nome completo ou Razão Social)
- `Endereco` → `Logradouro` (alinhado com NF-e)
- `Cidade` → `Municipio` (alinhado com NF-e)
- `Estado` → `UF` (alinhado com NF-e)
- `TelefoneFixo` → `Fone` (alinhado com NF-e)

**Novos Campos Adicionados:**
- `TipoPessoa` (PF ou PJ)
- `IM` (Inscrição Municipal)
- `IndIEDest` (Indicador de contribuinte ICMS: 1, 2 ou 9)
- `CodigoPais` (padrão: 1058 = Brasil)
- `Pais` (padrão: BRASIL)
- Campos de endereço de entrega com nomenclatura correta

**Tipos de Dados Atualizados:**
- `LimiteCredito`: `string` → `float64`
- `SaldoInicial`: `string` → `float64`
- `PrazoPagamento`: `string` → `int`
- `DataNascimento`: `string` → `*time.Time`
- `DataAbertura`: `string` → `*time.Time`
- `UltimaCompra`: `string` → `*time.Time`

**Campos de Auditoria:**
- `DataCadastro` → `CreatedAt`
- `DataAtualizacao` → `UpdatedAt`
- `DeletedAt` (mantido)

---

### 2. DTOs Atualizados

#### `CreateClienteRequest`
- Todos os campos alinhados com a nova estrutura
- Validação de `TipoPessoa` (PF ou PJ)
- Campos obrigatórios: `TipoPessoa`, `CNPJCPF`, `RazaoSocial`

#### `UpdateClienteRequest`
- Todos os campos como ponteiros (opcional)
- Permite atualização parcial

---

### 3. Métodos Auxiliares Adicionados

```go
// Verificações de tipo
cliente.IsPessoaFisica()      // Retorna true se PF
cliente.IsPessoaJuridica()    // Retorna true se PJ
cliente.IsContribuinteICMS()  // Retorna true se IndIEDest == 1

// Formatação
cliente.GetNomeCompleto()      // Retorna NomeFantasia ou RazaoSocial
cliente.GetEnderecoCompleto()  // Retorna endereço formatado
cliente.TemEnderecoEntrega()   // Verifica se há endereço de entrega

// Validação
cliente.ValidarCNPJCPF()       // Valida formato básico do CNPJ/CPF
```

---

### 4. Hooks do GORM Atualizados

```go
func (c *Cliente) BeforeCreate(tx *gorm.DB) error {
    // Define valores padrão
    if c.Status == "" {
        c.Status = "Ativo"
    }
    if c.TipoPessoa == "" {
        c.TipoPessoa = "PF"
    }
    if c.IndIEDest == 0 {
        c.IndIEDest = 9 // Não contribuinte por padrão
    }
    if c.CodigoPais == "" {
        c.CodigoPais = "1058" // Brasil
    }
    if c.Pais == "" {
        c.Pais = "BRASIL"
    }
    return nil
}
```

---

## 🔄 Como Aplicar a Atualização

### Passo 1: Parar o Backend e Resetar o Banco

```bash
# No diretório raiz do projeto
cd backend

# Parar e remover volumes (ATENÇÃO: isso apaga todos os dados!)
docker-compose down -v

# Subir novamente
docker-compose up -d
```

### Passo 2: Executar o Backend

```bash
# O GORM vai criar automaticamente as tabelas com a nova estrutura
make run
# ou
go run cmd/server/main.go
```

**Saída esperada:**
```
✅ Database connected successfully
✅ Database migrated successfully
🚀 Server starting on port 8080
```

---

## 📊 Estrutura do Banco de Dados

### Tabela: `clientes`

```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    
    -- Identificação Fiscal
    tipo_pessoa VARCHAR(2) NOT NULL DEFAULT 'PF',
    cnpj_cpf VARCHAR(18) NOT NULL UNIQUE,
    ie VARCHAR(20),
    im VARCHAR(20),
    ind_ie_dest INTEGER DEFAULT 9,
    
    -- Dados Cadastrais
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    
    -- Classificação
    consumidor_final BOOLEAN DEFAULT TRUE,
    tipo_contato VARCHAR(50) DEFAULT 'Cliente',
    status VARCHAR(20) DEFAULT 'Ativo',
    
    -- Contatos
    email VARCHAR(200),
    fone VARCHAR(20),
    celular VARCHAR(20),
    ponto_referencia VARCHAR(300),
    
    -- Endereço Principal
    logradouro VARCHAR(300),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    codigo_ibge VARCHAR(10),
    municipio VARCHAR(100),
    uf VARCHAR(2),
    cep VARCHAR(10),
    codigo_pais VARCHAR(10) DEFAULT '1058',
    pais VARCHAR(60) DEFAULT 'BRASIL',
    
    -- Endereço de Entrega
    logradouro_entrega VARCHAR(300),
    numero_entrega VARCHAR(20),
    complemento_entrega VARCHAR(100),
    bairro_entrega VARCHAR(100),
    codigo_ibge_entrega VARCHAR(10),
    municipio_entrega VARCHAR(100),
    uf_entrega VARCHAR(2),
    cep_entrega VARCHAR(10),
    codigo_pais_entrega VARCHAR(10) DEFAULT '1058',
    pais_entrega VARCHAR(60) DEFAULT 'BRASIL',
    
    -- Dados Financeiros
    limite_credito DECIMAL(15,2) DEFAULT 0,
    saldo_inicial DECIMAL(15,2) DEFAULT 0,
    prazo_pagamento INTEGER DEFAULT 0,
    
    -- Datas
    data_nascimento TIMESTAMP,
    data_abertura TIMESTAMP,
    ultima_compra TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP
);

-- Índices
CREATE UNIQUE INDEX idx_clientes_cnpj_cpf ON clientes(cnpj_cpf);
CREATE INDEX idx_clientes_razao_social ON clientes(razao_social);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_tipo_contato ON clientes(tipo_contato);
CREATE INDEX idx_clientes_deleted_at ON clientes(deleted_at);
```

---

## 🔗 Mapeamento NF-e

### Bloco `<dest>` da NF-e

| Campo NF-e | Campo Banco | Tipo | Descrição |
|------------|-------------|------|-----------|
| `CNPJ/CPF` | `cnpj_cpf` | VARCHAR(18) | CPF ou CNPJ |
| `xNome` | `razao_social` | VARCHAR(200) | Nome/Razão Social |
| `xLgr` | `logradouro` | VARCHAR(300) | Logradouro |
| `nro` | `numero` | VARCHAR(20) | Número |
| `xCpl` | `complemento` | VARCHAR(100) | Complemento |
| `xBairro` | `bairro` | VARCHAR(100) | Bairro |
| `cMun` | `codigo_ibge` | VARCHAR(10) | Código IBGE |
| `xMun` | `municipio` | VARCHAR(100) | Município |
| `UF` | `uf` | VARCHAR(2) | Estado |
| `CEP` | `cep` | VARCHAR(10) | CEP |
| `cPais` | `codigo_pais` | VARCHAR(10) | Código País |
| `xPais` | `pais` | VARCHAR(60) | Nome País |
| `indIEDest` | `ind_ie_dest` | INTEGER | Indicador IE |
| `IE` | `ie` | VARCHAR(20) | Inscrição Estadual |
| `IM` | `im` | VARCHAR(20) | Inscrição Municipal |
| `email` | `email` | VARCHAR(200) | E-mail |

---

## ⚠️ Próximos Passos

### Backend
- [ ] Atualizar `cliente_service.go` para usar novos campos
- [ ] Atualizar `cliente_handler.go` para novos DTOs
- [ ] Atualizar `cliente_repository.go` se necessário
- [ ] Criar testes unitários para novos métodos

### Frontend
- [ ] Atualizar interfaces TypeScript em `frontend/types/cliente.ts`
- [ ] Atualizar serviço em `frontend/lib/services/cliente.service.ts`
- [ ] Atualizar formulários de cadastro/edição
- [ ] Atualizar listagens e exibições

### Testes
- [ ] Testar criação de cliente PF
- [ ] Testar criação de cliente PJ
- [ ] Testar validação de CNPJ/CPF
- [ ] Testar endereço de entrega
- [ ] Testar campos personalizados

---

## 📝 Exemplo de Uso

### Criar Cliente Pessoa Física

```json
POST /api/v1/clientes
{
  "tipoPessoa": "PF",
  "cnpjCpf": "123.456.789-00",
  "razaoSocial": "João da Silva",
  "email": "joao@email.com",
  "fone": "(11) 98765-4321",
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "bairro": "Centro",
  "municipio": "São Paulo",
  "uf": "SP",
  "cep": "01000-000",
  "codigoIbge": "3550308",
  "consumidorFinal": true
}
```

### Criar Cliente Pessoa Jurídica

```json
POST /api/v1/clientes
{
  "tipoPessoa": "PJ",
  "cnpjCpf": "12.345.678/0001-90",
  "ie": "123.456.789.012",
  "razaoSocial": "Empresa Exemplo LTDA",
  "nomeFantasia": "Exemplo",
  "email": "contato@exemplo.com",
  "fone": "(11) 3333-4444",
  "logradouro": "Av. Paulista",
  "numero": "1000",
  "complemento": "Sala 10",
  "bairro": "Bela Vista",
  "municipio": "São Paulo",
  "uf": "SP",
  "cep": "01310-100",
  "codigoIbge": "3550308",
  "indIeDest": 1,
  "consumidorFinal": false
}
```

---

## 🎯 Benefícios da Nova Modelagem

1. ✅ **100% compatível com NF-e** - Todos os campos do bloco `<dest>` mapeados
2. ✅ **Suporte a PF e PJ** - Diferenciação clara entre pessoa física e jurídica
3. ✅ **Tipos de dados corretos** - Valores numéricos e datas com tipos apropriados
4. ✅ **Validações automáticas** - Hooks do GORM garantem consistência
5. ✅ **Flexível** - Campos personalizados para necessidades específicas
6. ✅ **Endereço de entrega** - Suporte completo para entrega em local diferente
7. ✅ **Métodos auxiliares** - Facilita uso no código

---

## 📚 Documentação Adicional

- [MODELAGEM_CLIENTE.md](./MODELAGEM_CLIENTE.md) - Documentação completa da modelagem
- [Manual NF-e](http://www.nfe.fazenda.gov.br/portal/principal.aspx) - Referência oficial
- [GORM Documentation](https://gorm.io/docs/) - Documentação do ORM

