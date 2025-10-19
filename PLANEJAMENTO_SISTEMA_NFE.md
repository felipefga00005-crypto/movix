# Planejamento Completo - Sistema de Emissão de NFe

> **Atualizado em:** Outubro/2025
> **Versão NFe:** 4.0
> **Base Legal:** Manual de Integração NFe 4.0

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configurações do Estabelecimento](#configurações-do-estabelecimento)
3. [Configurações Tributárias](#configurações-tributárias)
4. [Cadastros Base](#cadastros-base)
5. [Produtos e Serviços](#produtos-e-serviços)
6. [Emissão de NFe](#emissão-de-nfe)
7. [Modelos de Dados](#modelos-de-dados)
8. [APIs e Endpoints](#apis-e-endpoints)
9. [Fluxo de Emissão](#fluxo-de-emissão)
10. [Validações Necessárias](#validações-necessárias)

---

## 1. Visão Geral

### Objetivo
Criar um sistema completo de emissão de NFe 4.0 com todas as configurações tributárias necessárias para atender a legislação brasileira.

### Componentes Principais
- ✅ **Já Implementado**: Autenticação, Companies, Certificados, ACBr, NFe básica
- 🔄 **Em Desenvolvimento**: Configurações tributárias completas
- ⏳ **Pendente**: Cadastros completos (Clientes, Produtos, Transportadoras)

---

## 2. Configurações do Estabelecimento

### 2.1. Dados Fiscais da Company (Emitente)
```go
type Company struct {
    ID                    uuid.UUID
    AccountID             uuid.UUID

    // Identificação
    Name                  string    // Razão Social
    TradeName             string    // Nome Fantasia
    Document              string    // CNPJ (obrigatório)
    StateRegistration     string    // IE (obrigatório)
    MunicipalRegistration string    // IM (opcional)

    // Regime Tributário
    TaxRegime             string    // "simples_nacional", "presumido", "real", "mei"

    // Endereço Completo (OBRIGATÓRIO para NFe)
    Street                string
    Number                string
    Complement            string
    District              string    // Bairro
    City                  string
    State                 string    // UF (2 letras)
    ZipCode               string    // CEP
    CityCode              string    // Código IBGE do município (7 dígitos) - OBRIGATÓRIO
    CountryCode           string    // 1058 = Brasil

    // Contato
    Email                 string
    Phone                 string

    // Configurações NFe
    NFeSeries             int       // Série padrão (1-999)
    NextNFeNumber         int       // Próximo número
    NFCeSeries            int       // Série NFCe
    NextNFCeNumber        int

    // Ambiente
    Environment           string    // "producao" ou "homologacao"

    // Informações Adicionais Padrão
    DefaultAdditionalInfo string

    // CNAE
    CNAE                  string    // Código CNAE principal

    Status                string
    CreatedAt             time.Time
    UpdatedAt             time.Time
}
```

**Campos Obrigatórios para Emissão de NFe:**
- ✅ CNPJ (14 dígitos)
- ✅ Inscrição Estadual
- ✅ Razão Social
- ✅ Endereço completo (Rua, Número, Bairro, Cidade, UF, CEP)
- ✅ Código IBGE do município (7 dígitos)
- ✅ Regime tributário
- ✅ Série e numeração

### 2.2. Configurações de Contingência
- **FS-IA**: Formulário de Segurança - Impressor Autônomo
- **EPEC**: Evento Prévio de Emissão em Contingência
- **Offline**: Emissão offline (NFCe)

---

## 3. Configurações Tributárias

### 3.1. Natureza de Operação
```go
type OperationNature struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID
    
    Code                  string    // Ex: "5102"
    Description           string    // Ex: "Venda de mercadoria adquirida"
    Type                  string    // "entrada" ou "saida"
    
    // Configurações Padrão
    DefaultCFOP           string
    CalculateICMS         bool
    CalculateIPI          bool
    CalculatePIS          bool
    CalculateCOFINS       bool
    
    // Finalidade
    Purpose               int // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    
    Active                bool
    CreatedAt             time.Time
    UpdatedAt             time.Time
}
```

### 3.2. CFOP (Código Fiscal de Operações e Prestações)

**Estrutura do CFOP:**
- **1º dígito**: Tipo de operação
  - 1 = Entrada estadual
  - 2 = Entrada interestadual
  - 3 = Entrada do exterior
  - 5 = Saída estadual
  - 6 = Saída interestadual
  - 7 = Saída para o exterior

**CFOPs Mais Utilizados:**

**Vendas (Saídas):**
- **5101/6101**: Venda de produção do estabelecimento
- **5102/6102**: Venda de mercadoria adquirida ou recebida de terceiros
- **5103/6103**: Venda de produção do estabelecimento, efetuada fora do estabelecimento
- **5104/6104**: Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento
- **5405/6405**: Venda de bem do ativo imobilizado
- **5949/6949**: Outra saída de mercadoria ou prestação de serviço não especificado

**Compras (Entradas):**
- **1101/2101**: Compra para industrialização ou produção rural
- **1102/2102**: Compra para comercialização
- **1113/2113**: Compra para comercialização, em operação com mercadoria sujeita ao regime de substituição tributária
- **1201/2201**: Devolução de venda de produção do estabelecimento
- **1202/2202**: Devolução de venda de mercadoria adquirida ou recebida de terceiros
- **1556/2556**: Compra de material para uso ou consumo

**Devoluções:**
- **5201/6201**: Devolução de compra para industrialização ou produção rural
- **5202/6202**: Devolução de compra para comercialização
- **5411/6411**: Devolução de venda de produção do estabelecimento em operação com produto sujeito ao regime de substituição tributária
- **5412/6412**: Devolução de venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária

**Transferências:**
- **5151/6151**: Transferência de produção do estabelecimento
- **5152/6152**: Transferência de mercadoria adquirida ou recebida de terceiros

**Remessas:**
- **5901/6901**: Remessa para industrialização por encomenda
- **5902/6902**: Retorno de mercadoria utilizada na industrialização por encomenda
- **5915/6915**: Remessa de mercadoria ou bem para conserto ou reparo
- **5916/6916**: Retorno de mercadoria ou bem recebido para conserto ou reparo

### 3.3. NCM (Nomenclatura Comum do Mercosul)
```go
type NCM struct {
    Code                  string    // 8 dígitos: "12345678"
    Description           string
    Unit                  string    // Unidade padrão
    
    // Alíquotas Federais
    IPI                   float64
    PIS                   float64
    COFINS                float64
    
    // CEST (Código Especificador da Substituição Tributária)
    CEST                  string
    
    Active                bool
    UpdatedAt             time.Time
}
```

### 3.4. CST/CSOSN (Código de Situação Tributária)

#### ICMS - CST (Regime Normal)
```go
type ICMSCST struct {
    Code                  string    // "00", "10", "20", etc
    Description           string
    TaxationType          string    // "tributado", "isento", "nao_tributado", etc
}
```

**Códigos Principais:**
- **00**: Tributada integralmente
- **10**: Tributada com cobrança de ICMS por ST
- **20**: Com redução de base de cálculo
- **30**: Isenta ou não tributada com cobrança de ICMS por ST
- **40**: Isenta
- **41**: Não tributada
- **50**: Suspensão
- **51**: Diferimento
- **60**: ICMS cobrado anteriormente por ST
- **70**: Com redução de BC e cobrança de ICMS por ST
- **90**: Outras

#### ICMS - CSOSN (Simples Nacional)
```go
type ICMSCSOSN struct {
    Code                  string    // "101", "102", etc
    Description           string
}
```

**Códigos Principais:**
- **101**: Tributada com permissão de crédito
- **102**: Tributada sem permissão de crédito
- **103**: Isenção do ICMS para faixa de receita bruta
- **201**: Tributada com permissão de crédito e com cobrança do ICMS por ST
- **202**: Tributada sem permissão de crédito e com cobrança do ICMS por ST
- **500**: ICMS cobrado anteriormente por ST ou por antecipação
- **900**: Outros

#### PIS/COFINS - CST
```go
type PISCOFINSCST struct {
    Code                  string    // "01", "02", etc
    Description           string
}
```

**Códigos Principais:**
- **01**: Operação tributável com alíquota básica
- **02**: Operação tributável com alíquota diferenciada
- **03**: Operação tributável com alíquota por unidade de medida
- **04**: Operação tributável monofásica
- **05**: Operação tributável por substituição tributária
- **06**: Operação tributável a alíquota zero
- **07**: Operação isenta da contribuição
- **08**: Operação sem incidência da contribuição
- **09**: Operação com suspensão da contribuição

### 3.5. CEST (Código Especificador da Substituição Tributária)
```go
type CEST struct {
    Code                  string    // 7 dígitos: "0100100"
    NCM                   string
    Description           string
    Segment               string    // Segmento (combustíveis, bebidas, etc)
}
```

### 3.6. Regras Tributárias por Produto
```go
type ProductTaxRule struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID
    ProductID             uuid.UUID
    
    // ICMS
    ICMSOrigin            int       // 0=Nacional, 1=Estrangeira, etc
    ICMSCST               string    // Para regime normal
    ICMSCSOSN             string    // Para Simples Nacional
    ICMSRate              float64
    ICMSBaseReduction     float64
    ICMSSTRate            float64   // Substituição Tributária
    ICMSSTMargin          float64   // MVA
    
    // IPI
    IPICST                string
    IPIRate               float64
    
    // PIS
    PISCST                string
    PISRate               float64
    
    // COFINS
    COFINSCST             string
    COFINSRate            float64
    
    // Outros
    FederalTax            float64   // Tributos federais aproximados
    StateTax              float64   // Tributos estaduais aproximados
    MunicipalTax          float64   // Tributos municipais aproximados
    
    CreatedAt             time.Time
    UpdatedAt             time.Time
}
```

---

## 4. Cadastros Base

### 4.1. Clientes/Destinatários (OBRIGATÓRIO)

**Dados Obrigatórios para NFe:**

```go
type Customer struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID

    // Tipo
    Type                  string    // "customer", "supplier", "both"
    PersonType            string    // "fisica" (CPF), "juridica" (CNPJ)

    // Identificação (OBRIGATÓRIO)
    Name                  string    // Nome/Razão Social
    TradeName             string    // Nome Fantasia (opcional)
    Document              string    // CPF (11 dígitos) ou CNPJ (14 dígitos) - OBRIGATÓRIO

    // Inscrições Fiscais
    StateRegistration     string    // IE - Inscrição Estadual
    StateRegistrationType string    // "contribuinte", "isento", "nao_contribuinte"
    MunicipalRegistration string    // IM - Inscrição Municipal (opcional)
    SUFRAMA               string    // Inscrição SUFRAMA (opcional, para Zona Franca)

    // Endereço (OBRIGATÓRIO)
    Street                string    // Logradouro
    Number                string    // Número
    Complement            string    // Complemento (opcional)
    District              string    // Bairro
    City                  string    // Município
    State                 string    // UF (2 letras)
    ZipCode               string    // CEP (8 dígitos)
    CityCode              string    // Código IBGE do município (7 dígitos) - OBRIGATÓRIO
    Country               string    // País (padrão: "Brasil")
    CountryCode           string    // Código do país (1058 = Brasil)

    // Contato
    Email                 string    // Email (recomendado para envio de DANFE)
    Phone                 string    // Telefone
    Mobile                string    // Celular

    // Fiscal
    TaxRegime             string    // Regime tributário do cliente
    ICMSContributor       bool      // Contribuinte de ICMS

    // Observações
    Notes                 string

    Active                bool
    CreatedAt             time.Time
    UpdatedAt             time.Time
    DeletedAt             *time.Time
}
```

**Validações Importantes:**
- ✅ CPF/CNPJ válido (validar dígitos verificadores)
- ✅ CEP válido (8 dígitos)
- ✅ Código IBGE do município (7 dígitos)
- ✅ UF válida (2 letras maiúsculas)
- ✅ Email válido (formato)
- ✅ Telefone com DDD

**Tipos de Inscrição Estadual:**
- **Contribuinte**: Cliente possui IE e é contribuinte do ICMS
- **Isento**: Cliente é isento de IE (informar "ISENTO")
- **Não Contribuinte**: Cliente não possui IE (consumidor final)

**Observação:** Para operações com consumidor final (B2C), é obrigatório informar CPF ou CNPJ. Para NFCe, o CPF/CNPJ é opcional.

### 4.2. Produtos (OBRIGATÓRIO)

**Dados Obrigatórios para NFe:**

```go
type Product struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID

    // Identificação (OBRIGATÓRIO)
    Code                  string    // Código interno do produto
    Description           string    // Descrição do produto (até 120 caracteres)

    // Códigos de Barras (GTIN)
    Barcode               string    // EAN/GTIN comercial (8, 12, 13 ou 14 dígitos)
    BarcodeUnit           string    // GTIN da unidade tributável (se diferente)

    // Classificação Fiscal (OBRIGATÓRIO)
    NCM                   string    // NCM - 8 dígitos - OBRIGATÓRIO
    CEST                  string    // CEST - 7 dígitos (obrigatório para produtos com ST)
    CFOP                  string    // CFOP padrão para vendas

    // Unidades (OBRIGATÓRIO)
    CommercialUnit        string    // Unidade comercial (UN, CX, PC, KG, etc)
    TaxUnit               string    // Unidade tributável (geralmente igual à comercial)

    // Valores
    CostPrice             float64   // Preço de custo
    SalePrice             float64   // Preço de venda

    // Origem da Mercadoria (OBRIGATÓRIO para NFe)
    Origin                int       // 0=Nacional, 1=Estrangeira-Importação direta, etc

    // Estoque
    CurrentStock          float64
    MinStock              float64
    MaxStock              float64

    // Tributação (referência para regra padrão)
    DefaultTaxRuleID      *uuid.UUID

    // Informações Adicionais
    AdditionalInfo        string    // Informações adicionais do produto

    Active                bool
    CreatedAt             time.Time
    UpdatedAt             time.Time
    DeletedAt             *time.Time
}
```

**Origem da Mercadoria (Campo obrigatório):**
- **0**: Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- **1**: Estrangeira - Importação direta, exceto a indicada no código 6
- **2**: Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7
- **3**: Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%
- **4**: Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos
- **5**: Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%
- **6**: Estrangeira - Importação direta, sem similar nacional, constante em lista da CAMEX
- **7**: Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista da CAMEX
- **8**: Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%

**Unidades de Medida Mais Comuns:**
- **UN**: Unidade
- **PC**: Peça
- **CX**: Caixa
- **KG**: Quilograma
- **MT**: Metro
- **LT**: Litro
- **M2**: Metro quadrado
- **M3**: Metro cúbico
- **TON**: Tonelada
- **PAR**: Par
- **DZ**: Dúzia

**GTIN (Código de Barras):**
- Obrigatório quando o produto possui código de barras
- Pode ser EAN-8, EAN-13, UPC, GTIN-14
- Se não possui, informar "SEM GTIN"

**CEST - Quando é Obrigatório:**
- Produtos sujeitos à Substituição Tributária (ST)
- Produtos listados no Convênio ICMS 92/2015
- Segmentos: Combustíveis, Bebidas, Cigarros, Autopeças, Materiais de Construção, etc

### 4.2. Clientes/Fornecedores
```go
type Customer struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID
    
    // Tipo
    Type                  string    // "customer", "supplier", "both"
    PersonType            string    // "fisica", "juridica"
    
    // Identificação
    Name                  string
    TradeName             string
    Document              string    // CPF ou CNPJ
    StateRegistration     string    // IE
    MunicipalRegistration string    // IM
    
    // Contato
    Email                 string
    Phone                 string
    Mobile                string
    
    // Endereço
    Street                string
    Number                string
    Complement            string
    District              string
    City                  string
    State                 string
    ZipCode               string
    CityCode              string    // Código IBGE
    Country               string
    CountryCode           string    // 1058 = Brasil
    
    // Fiscal
    TaxRegime             string    // Regime tributário do cliente
    ICMSContributor       bool      // Contribuinte de ICMS
    
    // Observações
    Notes                 string
    
    Active                bool
    CreatedAt             time.Time
    UpdatedAt             time.Time
    DeletedAt             *time.Time
}
```

### 4.3. Transportadoras (Opcional)

**Dados para Transporte de Mercadorias:**

```go
type Carrier struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID

    // Identificação
    Name                  string    // Razão Social/Nome
    TradeName             string    // Nome Fantasia
    Document              string    // CPF/CNPJ
    StateRegistration     string    // IE

    // Endereço
    Street                string
    Number                string
    District              string
    City                  string
    State                 string    // UF
    ZipCode               string

    // Veículo Padrão
    VehiclePlate          string    // Placa do veículo
    VehicleState          string    // UF da placa
    RNTRC                 string    // Registro Nacional de Transportadores Rodoviários de Carga

    Active                bool
    CreatedAt             time.Time
    UpdatedAt             time.Time
}
```

**Modalidade de Frete (obrigatório na NFe):**
- **0**: Contratação do Frete por conta do Remetente (CIF)
- **1**: Contratação do Frete por conta do Destinatário (FOB)
- **2**: Contratação do Frete por conta de Terceiros
- **3**: Transporte Próprio por conta do Remetente
- **4**: Transporte Próprio por conta do Destinatário
- **9**: Sem Ocorrência de Transporte

**Volumes Transportados:**
```go
type Volume struct {
    Quantity              int       // Quantidade de volumes
    Species               string    // Espécie (Caixa, Fardo, etc)
    Brand                 string    // Marca dos volumes
    Numbering             string    // Numeração dos volumes
    GrossWeight           float64   // Peso bruto (kg)
    NetWeight             float64   // Peso líquido (kg)
}
```

---

## 5. Produtos e Serviços

### 5.1. Cadastro Completo de Produto
```go
type ProductComplete struct {
    Product               Product
    TaxRule               ProductTaxRule
    NCMInfo               NCM
    CESTInfo              *CEST
}
```

### 5.2. Tabela de Preços
```go
type PriceTable struct {
    ID                    uuid.UUID
    CompanyID             uuid.UUID
    Name                  string
    Description           string
    Active                bool
}

type PriceTableItem struct {
    ID                    uuid.UUID
    PriceTableID          uuid.UUID
    ProductID             uuid.UUID
    Price                 float64
    MinQuantity           float64
}
```

---

## 6. Emissão de NFe

### 6.1. NFe Completa - Estrutura Atualizada

```go
type NFe struct {
    // ========== IDENTIFICAÇÃO ==========
    ID                    uuid.UUID
    CompanyID             uuid.UUID
    UserID                uuid.UUID

    // Numeração (OBRIGATÓRIO)
    Number                int       // Número da NFe
    Series                int       // Série da NFe (1-999)
    Model                 string    // "55" = NFe, "65" = NFCe

    // Datas (OBRIGATÓRIO)
    IssueDate             time.Time // Data/Hora de emissão
    EntryExitDate         *time.Time // Data/Hora de saída/entrada

    // Tipo de Operação (OBRIGATÓRIO)
    Type                  int       // 0=Entrada, 1=Saída
    Purpose               int       // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    ConsumerOperation     int       // 0=Não, 1=Consumidor final
    PresenceIndicator     int       // 0=Não se aplica, 1=Presencial, 2=Internet, etc

    // Natureza da Operação (OBRIGATÓRIO)
    OperationNature       string    // Ex: "Venda de mercadoria"

    // ========== DESTINATÁRIO (OBRIGATÓRIO) ==========
    CustomerID            uuid.UUID
    Customer              Customer  // Dados completos do destinatário

    // ========== PRODUTOS/ITENS (OBRIGATÓRIO) ==========
    Items                 []NFeItem // Pelo menos 1 item

    // ========== TOTAIS (CALCULADOS) ==========
    TotalProducts         float64   // Total dos produtos
    TotalDiscount         float64   // Total de descontos
    TotalFreight          float64   // Total do frete
    TotalInsurance        float64   // Total do seguro
    TotalOtherExpenses    float64   // Outras despesas acessórias

    // Totais de Impostos
    TotalICMS             float64   // Total do ICMS
    TotalICMSST           float64   // Total do ICMS ST
    TotalIPI              float64   // Total do IPI
    TotalPIS              float64   // Total do PIS
    TotalCOFINS           float64   // Total do COFINS
    TotalFCP              float64   // Total do Fundo de Combate à Pobreza

    // Total da NFe (OBRIGATÓRIO)
    TotalNFe              float64   // Valor total da NFe

    // ========== TRANSPORTE ==========
    FreightMode           int       // 0-4, 9 (ver modalidades)
    CarrierID             *uuid.UUID
    Carrier               *Carrier  // Dados da transportadora (se houver)
    VehiclePlate          string    // Placa do veículo
    VehicleState          string    // UF da placa
    VehicleRNTRC          string    // RNTRC

    // Volumes Transportados
    Volumes               []Volume

    // ========== PAGAMENTO (OBRIGATÓRIO para NFe) ==========
    PaymentIndicator      int       // 0=À vista, 1=A prazo, 2=Outros
    PaymentMethod         []Payment // Formas de pagamento

    // ========== INFORMAÇÕES ADICIONAIS ==========
    AdditionalInfo        string    // Informações complementares
    FiscalInfo            string    // Informações fiscais

    // ========== REFERÊNCIAS ==========
    ReferencedNFes        []string  // Chaves de NFes referenciadas
    ReferencedCTes        []string  // Chaves de CTes referenciadas

    // ========== CONTROLE ==========
    Status                NFeStatus // draft, processing, authorized, rejected, cancelled
    AccessKey             string    // Chave de acesso (44 dígitos)
    Protocol              string    // Protocolo de autorização
    AuthorizationDate     *time.Time

    // XML e PDF
    XML                   string    // XML completo da NFe
    DANFE                 []byte    // PDF do DANFE

    // Cancelamento
    CancellationReason    string
    CancellationProtocol  string
    CancelledAt           *time.Time

    // Carta de Correção
    Corrections           []Correction

    // Timestamps
    CreatedAt             time.Time
    UpdatedAt             time.Time
    DeletedAt             *time.Time
}
```

### 6.2. Item da NFe - Estrutura Completa

```go
type NFeItem struct {
    ID                    uuid.UUID
    NFeID                 uuid.UUID
    Number                int       // Número sequencial do item (1, 2, 3...)

    // ========== PRODUTO (OBRIGATÓRIO) ==========
    ProductID             uuid.UUID
    Code                  string    // Código do produto
    Barcode               string    // GTIN/EAN (ou "SEM GTIN")
    Description           string    // Descrição do produto (até 120 caracteres)
    NCM                   string    // NCM - 8 dígitos - OBRIGATÓRIO
    CEST                  string    // CEST - 7 dígitos (quando obrigatório)
    CFOP                  string    // CFOP - 4 dígitos - OBRIGATÓRIO

    // ========== UNIDADES E QUANTIDADES (OBRIGATÓRIO) ==========
    // Unidade Comercial
    CommercialUnit        string    // Unidade comercial (UN, KG, etc)
    CommercialQuantity    float64   // Quantidade comercial
    CommercialUnitPrice   float64   // Valor unitário comercial

    // Unidade Tributável (geralmente igual à comercial)
    TaxUnit               string    // Unidade tributável
    TaxQuantity           float64   // Quantidade tributável
    TaxUnitPrice          float64   // Valor unitário tributável

    // ========== VALORES (OBRIGATÓRIO) ==========
    TotalPrice            float64   // Valor total do item (qtd * valor unitário)
    Discount              float64   // Valor do desconto
    Freight               float64   // Valor do frete
    Insurance             float64   // Valor do seguro
    OtherExpenses         float64   // Outras despesas acessórias

    // Valor total do item (com descontos e acréscimos)
    TotalValue            float64   // Total do item para a NFe

    // ========== ICMS (OBRIGATÓRIO) ==========
    ICMSOrigin            int       // Origem da mercadoria (0-8) - OBRIGATÓRIO
    ICMSCST               string    // CST do ICMS (00, 10, 20, etc) - Regime Normal
    ICMSCSOSN             string    // CSOSN (101, 102, etc) - Simples Nacional
    ICMSModBC             int       // Modalidade de BC do ICMS (0-3)
    ICMSBaseCalc          float64   // Base de cálculo do ICMS
    ICMSRate              float64   // Alíquota do ICMS (%)
    ICMSValue             float64   // Valor do ICMS

    // ICMS ST (Substituição Tributária)
    ICMSSTModBC           int       // Modalidade de BC do ICMS ST
    ICMSSTMargin          float64   // Margem de valor agregado (MVA) %
    ICMSSTBaseCalc        float64   // Base de cálculo do ICMS ST
    ICMSSTRate            float64   // Alíquota do ICMS ST (%)
    ICMSSTValue           float64   // Valor do ICMS ST

    // FCP (Fundo de Combate à Pobreza)
    FCPRate               float64   // Alíquota do FCP (%)
    FCPValue              float64   // Valor do FCP

    // ========== IPI ==========
    IPICST                string    // CST do IPI
    IPICode               string    // Código de enquadramento do IPI
    IPIBaseCalc           float64   // Base de cálculo do IPI
    IPIRate               float64   // Alíquota do IPI (%)
    IPIValue              float64   // Valor do IPI

    // ========== PIS ==========
    PISCST                string    // CST do PIS (01, 02, etc)
    PISBaseCalc           float64   // Base de cálculo do PIS
    PISRate               float64   // Alíquota do PIS (%)
    PISValue              float64   // Valor do PIS

    // ========== COFINS ==========
    COFINSCST             string    // CST do COFINS
    COFINSBaseCalc        float64   // Base de cálculo do COFINS
    COFINSRate            float64   // Alíquota do COFINS (%)
    COFINSValue           float64   // Valor do COFINS

    // ========== INFORMAÇÕES ADICIONAIS ==========
    AdditionalInfo        string    // Informações adicionais do item

    CreatedAt             time.Time
    UpdatedAt             time.Time
}
```

**Campos Obrigatórios por Item:**
- ✅ Código do produto
- ✅ Descrição
- ✅ NCM (8 dígitos)
- ✅ CFOP (4 dígitos)
- ✅ Unidade comercial e tributável
- ✅ Quantidade comercial e tributável
- ✅ Valor unitário comercial e tributável
- ✅ Valor total
- ✅ Origem da mercadoria (0-8)
- ✅ CST ou CSOSN do ICMS
- ✅ CST do PIS
- ✅ CST do COFINS
- ✅ GTIN (ou "SEM GTIN" se não possuir)

### 6.3. Formas de Pagamento (OBRIGATÓRIO para NFe)

```go
type Payment struct {
    ID                    uuid.UUID
    NFeID                 uuid.UUID

    // Forma de Pagamento (OBRIGATÓRIO)
    Method                string    // Código da forma de pagamento
    Value                 float64   // Valor do pagamento

    // Dados específicos por forma de pagamento
    // Cartão de Crédito/Débito
    CardCNPJ              string    // CNPJ da operadora de cartão
    CardFlag              string    // Bandeira do cartão
    CardAuthorizationCode string    // Código de autorização

    // PIX
    PIXKey                string    // Chave PIX (se aplicável)

    // Duplicatas (para pagamento a prazo)
    DueDate               *time.Time // Data de vencimento
    InstallmentNumber     int       // Número da parcela
}
```

**Formas de Pagamento (Tabela Atualizada 2025):**
- **01**: Dinheiro
- **02**: Cheque
- **03**: Cartão de Crédito
- **04**: Cartão de Débito
- **05**: Crédito Loja
- **10**: Vale Alimentação
- **11**: Vale Refeição
- **12**: Vale Presente
- **13**: Vale Combustível
- **14**: Duplicata Mercantil
- **15**: Boleto Bancário
- **16**: Depósito Bancário
- **17**: Pagamento Instantâneo (PIX)
- **18**: Transferência bancária, Carteira Digital
- **19**: Programa de fidelidade, Cashback, Crédito Virtual
- **90**: Sem pagamento
- **99**: Outros

**Indicador de Pagamento:**
- **0**: Pagamento à vista
- **1**: Pagamento a prazo
- **2**: Outros

**Observações Importantes:**
- Para NFe, é OBRIGATÓRIO informar as formas de pagamento
- Para NFCe, também é obrigatório
- A soma dos valores de pagamento deve ser igual ao total da NFe
- Para pagamento a prazo, informar as duplicatas com vencimentos
- Para cartão, informar CNPJ da operadora e bandeira
- Para PIX, pode informar a chave PIX utilizada

### 6.4. Duplicatas/Parcelas

```go
type Installment struct {
    ID                    uuid.UUID
    NFeID                 uuid.UUID

    Number                string    // Número da duplicata (001, 002, etc)
    DueDate               time.Time // Data de vencimento
    Value                 float64   // Valor da parcela
}
```

---

## 7. Modelos de Dados

### Estrutura de Tabelas no Banco

```sql
-- Configurações Fiscais
CREATE TABLE company_fiscal_configs (...)
CREATE TABLE operation_natures (...)
CREATE TABLE cfops (...)
CREATE TABLE ncms (...)
CREATE TABLE cests (...)
CREATE TABLE icms_csts (...)
CREATE TABLE icms_csosns (...)
CREATE TABLE pis_cofins_csts (...)

-- Cadastros
CREATE TABLE products (...)
CREATE TABLE product_tax_rules (...)
CREATE TABLE customers (...)
CREATE TABLE carriers (...)
CREATE TABLE price_tables (...)
CREATE TABLE price_table_items (...)

-- NFe
CREATE TABLE nfes (...)
CREATE TABLE nfe_items (...)
CREATE TABLE nfe_volumes (...)
CREATE TABLE nfe_installments (...)
CREATE TABLE nfe_references (...)
```

---

## 8. APIs e Endpoints

### 8.1. Configurações Tributárias
```
POST   /api/v1/admin/fiscal-config
GET    /api/v1/admin/fiscal-config
PUT    /api/v1/admin/fiscal-config

POST   /api/v1/admin/operation-natures
GET    /api/v1/admin/operation-natures
PUT    /api/v1/admin/operation-natures/:id
DELETE /api/v1/admin/operation-natures/:id
```

### 8.2. Produtos
```
POST   /api/v1/products
GET    /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

POST   /api/v1/products/:id/tax-rule
GET    /api/v1/products/:id/tax-rule
PUT    /api/v1/products/:id/tax-rule
```

### 8.3. Clientes
```
POST   /api/v1/customers
GET    /api/v1/customers
GET    /api/v1/customers/:id
PUT    /api/v1/customers/:id
DELETE /api/v1/customers/:id
```

### 8.4. NFe
```
POST   /api/v1/nfes              # Criar draft
POST   /api/v1/nfes/:id/items    # Adicionar item
PUT    /api/v1/nfes/:id/items/:item_id
DELETE /api/v1/nfes/:id/items/:item_id
POST   /api/v1/nfes/:id/calculate  # Calcular impostos
POST   /api/v1/nfes/:id/authorize  # Autorizar
POST   /api/v1/nfes/:id/cancel     # Cancelar
GET    /api/v1/nfes/:id/xml        # Download XML
GET    /api/v1/nfes/:id/danfe      # Download DANFE (PDF)
```

---

## 9. Fluxo de Emissão

### 9.1. Fluxo Completo
```
1. Criar NFe Draft
   ↓
2. Adicionar Itens
   ↓
3. Selecionar Cliente
   ↓
4. Configurar Transporte (opcional)
   ↓
5. Configurar Pagamento
   ↓
6. Calcular Impostos Automaticamente
   ↓
7. Validar NFe
   ↓
8. Autorizar na SEFAZ
   ↓
9. Gerar DANFE
   ↓
10. Enviar Email (opcional)
```

### 9.2. Cálculo Automático de Impostos
```go
func CalculateItemTaxes(item *NFeItem, company *Company, customer *Customer) {
    // 1. Buscar regra tributária do produto
    taxRule := GetProductTaxRule(item.ProductID, company.ID)
    
    // 2. Determinar CFOP baseado em:
    //    - Natureza da operação
    //    - Estado do emitente vs destinatário
    //    - Tipo de operação
    
    // 3. Calcular ICMS
    if company.TaxRegime == SimplesNacional {
        // Usar CSOSN
        item.ICMSCST = taxRule.ICMSCSOSN
        // Simples Nacional não destaca ICMS na nota
    } else {
        // Usar CST
        item.ICMSCST = taxRule.ICMSCST
        item.ICMSBaseCalc = item.TotalPrice
        item.ICMSRate = taxRule.ICMSRate
        item.ICMSValue = item.ICMSBaseCalc * (item.ICMSRate / 100)
    }
    
    // 4. Calcular IPI
    if taxRule.IPIRate > 0 {
        item.IPIBaseCalc = item.TotalPrice
        item.IPIRate = taxRule.IPIRate
        item.IPIValue = item.IPIBaseCalc * (item.IPIRate / 100)
    }
    
    // 5. Calcular PIS
    item.PISBaseCalc = item.TotalPrice
    item.PISRate = taxRule.PISRate
    item.PISValue = item.PISBaseCalc * (item.PISRate / 100)
    
    // 6. Calcular COFINS
    item.COFINSBaseCalc = item.TotalPrice
    item.COFINSRate = taxRule.COFINSRate
    item.COFINSValue = item.COFINSBaseCalc * (item.COFINSRate / 100)
}
```

---

## 10. Validações Necessárias

### 10.1. Validações do Emitente (Company)
- ✅ CNPJ válido (14 dígitos com verificadores)
- ✅ Inscrição Estadual válida
- ✅ Endereço completo (Rua, Número, Bairro, Cidade, UF, CEP)
- ✅ Código IBGE do município (7 dígitos)
- ✅ Regime tributário definido
- ✅ Certificado digital válido e não expirado
- ✅ Company ativa
- ✅ Série e numeração configuradas

### 10.2. Validações do Destinatário
- ✅ CPF (11 dígitos) ou CNPJ (14 dígitos) válido
- ✅ Nome/Razão Social preenchido
- ✅ Endereço completo
- ✅ Código IBGE do município (7 dígitos)
- ✅ UF válida (2 letras)
- ✅ CEP válido (8 dígitos)
- ✅ Inscrição Estadual (quando contribuinte)
- ✅ Email válido (recomendado)
- ✅ Telefone com DDD

### 10.3. Validações dos Produtos/Itens
- ✅ Pelo menos 1 item na NFe
- ✅ Código do produto preenchido
- ✅ Descrição preenchida (até 120 caracteres)
- ✅ NCM válido (8 dígitos)
- ✅ CEST válido (7 dígitos, quando obrigatório)
- ✅ CFOP válido (4 dígitos)
- ✅ Unidade comercial e tributável preenchidas
- ✅ Quantidade > 0
- ✅ Valor unitário > 0
- ✅ Origem da mercadoria (0-8)
- ✅ GTIN válido ou "SEM GTIN"

### 10.4. Validações Tributárias
- ✅ CST ou CSOSN do ICMS válido
- ✅ CST do PIS válido
- ✅ CST do COFINS válido
- ✅ CST do IPI (quando aplicável)
- ✅ Alíquotas dentro dos limites legais
- ✅ Base de cálculo correta
- ✅ Valores de impostos calculados corretamente
- ✅ CEST obrigatório para produtos com ST

### 10.5. Validações de Totais
- ✅ Total dos produtos = soma dos itens
- ✅ Total da NFe = produtos + frete + seguro + outras despesas - descontos
- ✅ Total de impostos calculado corretamente
- ✅ Soma das formas de pagamento = total da NFe

### 10.6. Validações de Transporte
- ✅ Modalidade de frete válida (0-4, 9)
- ✅ Dados da transportadora (quando informada)
- ✅ Placa do veículo (formato AAA-9999 ou AAA9A99)
- ✅ UF da placa válida
- ✅ Peso bruto e líquido (quando informado)

### 10.7. Validações de Pagamento
- ✅ Pelo menos uma forma de pagamento
- ✅ Forma de pagamento válida (01-99)
- ✅ Soma dos pagamentos = total da NFe
- ✅ Dados do cartão (quando forma = 03 ou 04)
- ✅ Duplicatas com vencimento (quando a prazo)
- ✅ CNPJ da operadora de cartão (quando cartão)

### 10.8. Validações de Regras de Negócio
- ✅ Limite mensal de NFes (conforme plano)
- ✅ Certificado digital ativo
- ✅ Ambiente correto (produção/homologação)
- ✅ Numeração sequencial
- ✅ Data de emissão não futura
- ✅ Data de saída >= data de emissão

### 10.9. Validações Específicas por UF
- ✅ Regras específicas de cada estado
- ✅ Alíquotas interestaduais corretas
- ✅ DIFAL (Diferencial de Alíquota) quando aplicável
- ✅ Partilha do ICMS (operações interestaduais para consumidor final)

### 10.10. Validações do XML
- ✅ Estrutura XML válida conforme schema NFe 4.0
- ✅ Assinatura digital válida
- ✅ Chave de acesso calculada corretamente (44 dígitos)
- ✅ Dígito verificador da chave correto
- ✅ Todos os campos obrigatórios preenchidos

---

## 11. Resumo - Campos Obrigatórios para Emissão de NFe

### ✅ Emitente (Company)
1. CNPJ (14 dígitos)
2. Razão Social
3. Nome Fantasia
4. Inscrição Estadual
5. Endereço completo (Rua, Número, Bairro, Cidade, UF, CEP)
6. Código IBGE do município (7 dígitos)
7. Regime tributário
8. Certificado digital válido

### ✅ Destinatário (Customer)
1. CPF ou CNPJ
2. Nome/Razão Social
3. Endereço completo (Rua, Número, Bairro, Cidade, UF, CEP)
4. Código IBGE do município (7 dígitos)
5. Inscrição Estadual (se contribuinte) ou indicador de isento/não contribuinte
6. Email (recomendado)
7. Telefone

### ✅ Produto (Item da NFe)
1. Código do produto
2. Descrição (até 120 caracteres)
3. NCM (8 dígitos)
4. CFOP (4 dígitos)
5. Unidade comercial e tributável
6. Quantidade comercial e tributável
7. Valor unitário comercial e tributável
8. Valor total
9. GTIN/EAN ou "SEM GTIN"
10. Origem da mercadoria (0-8)
11. CST ou CSOSN do ICMS
12. CST do PIS
13. CST do COFINS
14. CEST (quando obrigatório - produtos com ST)

### ✅ NFe (Cabeçalho)
1. Número e Série
2. Data/Hora de emissão
3. Natureza da operação
4. Tipo de operação (0=Entrada, 1=Saída)
5. Finalidade (1=Normal, 2=Complementar, etc)
6. Indicador de consumidor final
7. Indicador de presença
8. Modalidade de frete
9. Formas de pagamento
10. Total da NFe

---

## 📅 Cronograma de Implementação

### Fase 1: Atualização de Models e Migrations (2-3 dias)
- [ ] Atualizar model Company com campos obrigatórios
- [ ] Criar model Customer completo
- [ ] Criar model Product completo
- [ ] Criar model Carrier
- [ ] Criar migrations para todas as tabelas
- [ ] Popular tabelas auxiliares (CFOP, NCM base, CST)

### Fase 2: Cadastros Base (3-4 dias)
- [ ] Implementar CRUD de Clientes
  - [ ] Service layer
  - [ ] Handlers/Controllers
  - [ ] Validações (CPF/CNPJ, CEP, IBGE)
  - [ ] Testes
- [ ] Implementar CRUD de Produtos
  - [ ] Service layer
  - [ ] Handlers/Controllers
  - [ ] Validações (NCM, CEST, GTIN)
  - [ ] Testes
- [ ] Implementar CRUD de Transportadoras
  - [ ] Service layer
  - [ ] Handlers/Controllers
  - [ ] Testes

### Fase 3: Configurações Tributárias (4-5 dias)
- [ ] Criar tabelas de configuração tributária
- [ ] Implementar regras tributárias por produto
- [ ] Implementar naturezas de operação
- [ ] Implementar engine de cálculo de impostos
  - [ ] Cálculo de ICMS (Normal e Simples Nacional)
  - [ ] Cálculo de ICMS ST
  - [ ] Cálculo de IPI
  - [ ] Cálculo de PIS/COFINS
  - [ ] Cálculo de FCP
- [ ] Testes de cálculo

### Fase 4: NFe Completa (5-7 dias)
- [ ] Refatorar model NFe atual
- [ ] Implementar model NFeItem completo
- [ ] Implementar model Payment
- [ ] Implementar model Volume
- [ ] Implementar service de NFe
  - [ ] Criar draft
  - [ ] Adicionar/editar/remover itens
  - [ ] Calcular impostos automaticamente
  - [ ] Calcular totais
  - [ ] Validar NFe completa
- [ ] Implementar handlers
- [ ] Testes unitários

### Fase 5: Integração ACBr e Autorização (3-4 dias)
- [ ] Integrar geração de XML com ACBr
- [ ] Implementar assinatura digital
- [ ] Implementar envio para SEFAZ
- [ ] Implementar consulta de status
- [ ] Implementar cancelamento
- [ ] Implementar carta de correção
- [ ] Testes em homologação

### Fase 6: Validações e Testes (3-4 dias)
- [ ] Implementar todas as validações obrigatórias
- [ ] Testes de emissão completos
- [ ] Testes de diferentes cenários
  - [ ] Venda estadual
  - [ ] Venda interestadual
  - [ ] Devolução
  - [ ] Complementar
  - [ ] Com ST
  - [ ] Simples Nacional vs Regime Normal
- [ ] Correções e ajustes

### Fase 7: Documentação e Deploy (2-3 dias)
- [ ] Documentação da API
- [ ] Guia de uso
- [ ] Exemplos de requisições
- [ ] Deploy em produção
- [ ] Treinamento

**Total Estimado: 22-30 dias (4-6 semanas)**

---

## 🎯 Prioridades

### Alta Prioridade
1. Configuração fiscal da company
2. Cadastro de produtos com NCM
3. Cadastro de clientes
4. Cálculo automático de impostos
5. Emissão básica de NFe

### Média Prioridade
1. Regras tributárias avançadas
2. Substituição tributária
3. Múltiplas naturezas de operação
4. Transportadora e volumes

### Baixa Prioridade
1. Tabelas de preço
2. Integração com estoque
3. Relatórios fiscais
4. Dashboard de impostos

---

## 📚 Referências Atualizadas (Outubro/2025)

### Documentação Oficial
- [Portal Nacional da NFe](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Manual de Integração NFe 4.0](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/fwLvLUSmU8=)
- [Schemas XML NFe 4.0](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=)
- [Nota Técnica NFe](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=tW+YMyk/50s=)

### Tabelas e Códigos
- [Tabela CFOP Completa](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Iy/5Qol1YbE=)
- [Tabela NCM - Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/nomenclatura-comum-do-mercosul-ncm)
- [Tabela CEST - Convênio ICMS 92/2015](https://www.confaz.fazenda.gov.br/legislacao/convenios/2015/CV092_15)
- [CST ICMS](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=mNQliEG/ZsM=)
- [CSOSN - Simples Nacional](http://www8.receita.fazenda.gov.br/SimplesNacional/)
- [Códigos IBGE de Municípios](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)

### Validações e Regras
- [Validador de CPF/CNPJ](https://www.gov.br/receitafederal/)
- [Consulta NCM](https://portalunico.siscomex.gov.br/classif/)
- [Alíquotas Interestaduais ICMS](https://www.confaz.fazenda.gov.br/)

### ACBr
- [Projeto ACBr](https://www.projetoacbr.com.br/)
- [ACBr Monitor](https://www.projetoacbr.com.br/forum/topic/56416-acbrmonitor/)
- [Documentação ACBrNFe](https://www.projetoacbr.com.br/forum/forum/56-nf-e/)

---

## ✅ Checklist Completo de Implementação

### Infraestrutura
- [x] Autenticação e autorização
- [x] Companies (emitentes)
- [x] Certificados digitais
- [x] Integração ACBr básica
- [ ] Atualizar Company com campos obrigatórios NFe

### Cadastros Base
- [ ] **Clientes/Destinatários**
  - [ ] Model completo
  - [ ] Repository
  - [ ] Service
  - [ ] Handlers
  - [ ] Validações (CPF/CNPJ, CEP, IBGE)
  - [ ] Testes

- [ ] **Produtos**
  - [ ] Model completo
  - [ ] Repository
  - [ ] Service
  - [ ] Handlers
  - [ ] Validações (NCM, CEST, GTIN, Origem)
  - [ ] Testes

- [ ] **Transportadoras**
  - [ ] Model
  - [ ] Repository
  - [ ] Service
  - [ ] Handlers
  - [ ] Testes

### Configurações Tributárias
- [ ] Tabelas auxiliares
  - [ ] CFOP (popular com dados padrão)
  - [ ] NCM (integração ou importação)
  - [ ] CEST (popular com dados padrão)
  - [ ] CST ICMS
  - [ ] CSOSN
  - [ ] CST PIS/COFINS

- [ ] Naturezas de Operação
  - [ ] Model
  - [ ] CRUD
  - [ ] Configurações padrão

- [ ] Regras Tributárias por Produto
  - [ ] Model
  - [ ] CRUD
  - [ ] Associação produto x regra

### Engine de Cálculo
- [ ] Cálculo de ICMS
  - [ ] Regime Normal (CST)
  - [ ] Simples Nacional (CSOSN)
  - [ ] Redução de base de cálculo
  - [ ] ICMS ST
  - [ ] FCP

- [ ] Cálculo de IPI
- [ ] Cálculo de PIS
- [ ] Cálculo de COFINS
- [ ] Testes de cálculo por cenário

### NFe Completa
- [ ] Models
  - [ ] NFe (refatorar atual)
  - [ ] NFeItem
  - [ ] Payment
  - [ ] Installment
  - [ ] Volume
  - [ ] Correction

- [ ] Repository
  - [ ] NFe
  - [ ] NFeItem
  - [ ] Payment

- [ ] Service
  - [ ] Criar draft
  - [ ] Adicionar/editar/remover itens
  - [ ] Calcular impostos automaticamente
  - [ ] Calcular totais
  - [ ] Validar NFe completa
  - [ ] Autorizar
  - [ ] Cancelar
  - [ ] Carta de correção
  - [ ] Download XML
  - [ ] Gerar DANFE

- [ ] Handlers/Controllers
  - [ ] Todas as rotas
  - [ ] Tratamento de erros

- [ ] Validações
  - [ ] Emitente
  - [ ] Destinatário
  - [ ] Produtos/Itens
  - [ ] Tributação
  - [ ] Totais
  - [ ] Transporte
  - [ ] Pagamento
  - [ ] Regras de negócio
  - [ ] XML

### Integração SEFAZ
- [ ] Geração de XML NFe 4.0
- [ ] Assinatura digital
- [ ] Envio para autorização
- [ ] Consulta de status
- [ ] Cancelamento
- [ ] Inutilização de numeração
- [ ] Carta de correção eletrônica
- [ ] Download de XML autorizado
- [ ] Geração de DANFE (PDF)

### Testes
- [ ] Testes unitários
  - [ ] Services
  - [ ] Cálculos
  - [ ] Validações

- [ ] Testes de integração
  - [ ] Fluxo completo de emissão
  - [ ] Diferentes cenários

- [ ] Testes em homologação SEFAZ
  - [ ] Venda estadual
  - [ ] Venda interestadual
  - [ ] Devolução
  - [ ] Complementar
  - [ ] Com ST
  - [ ] Simples Nacional
  - [ ] Regime Normal
  - [ ] Cancelamento
  - [ ] Carta de correção

### Documentação
- [ ] Documentação da API
- [ ] Guia de configuração inicial
- [ ] Guia de cadastros
- [ ] Guia de emissão de NFe
- [ ] Exemplos de requisições
- [ ] Troubleshooting
- [ ] FAQ

### Deploy e Produção
- [ ] Configuração de ambiente de produção
- [ ] Certificados em produção
- [ ] Testes finais
- [ ] Treinamento de usuários
- [ ] Go-live

---

## 🎯 Próximos Passos Imediatos

1. **Atualizar model Company** com todos os campos obrigatórios
2. **Criar model Customer** completo com validações
3. **Criar model Product** completo com classificação fiscal
4. **Criar migrations** para todas as tabelas
5. **Implementar CRUD de Clientes** com validações
6. **Implementar CRUD de Produtos** com validações
7. **Popular tabelas auxiliares** (CFOP, CST, etc)
8. **Implementar engine de cálculo** de impostos
9. **Refatorar NFe** para estrutura completa
10. **Testes em homologação**

---

**Documento criado em:** 19/10/2025
**Versão:** 2.0
**Status:** Planejamento Completo - Atualizado com pesquisa web
**Última atualização:** 19/10/2025

