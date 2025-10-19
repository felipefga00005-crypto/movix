# Integração DFe-service com Backend Go

## 📋 Visão Geral

Este documento descreve a integração completa entre o backend Go e o microserviço DFe-service (.NET) para emissão de NFe.

## 🏗️ Arquitetura

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────┐
│                 │  ────────────────────────>  │                  │
│  Backend Go     │                             │  DFe-service     │
│  (Port 8080)    │  <────────────────────────  │  (.NET - 5000)   │
│                 │                             │                  │
└─────────────────┘                             └──────────────────┘
        │                                               │
        │                                               │
        v                                               v
  ┌──────────┐                                   ┌──────────┐
  │PostgreSQL│                                   │  SEFAZ   │
  └──────────┘                                   └──────────┘
```

## 📦 Componentes Criados

### 1. Client HTTP Go (`backend/pkg/dfe/`)

#### `client.go`
Cliente HTTP para comunicação com o DFe-service:
- `AuthorizeNFe()` - Autoriza NFe
- `CancelNFe()` - Cancela NFe
- `CheckServiceStatus()` - Consulta status SEFAZ
- `GenerateDanfe()` - Gera DANFE

#### `types.go`
Tipos de dados para comunicação:
- `NFeRequest` - Requisição de autorização
- `NFeResponse` - Resposta de autorização
- `CancelNFeRequest` - Requisição de cancelamento
- `CancelNFeResponse` - Resposta de cancelamento
- `StatusServiceRequest` - Requisição de status
- `StatusServiceResponse` - Resposta de status
- `DanfeRequest` - Requisição de DANFE
- `DanfeResponse` - Resposta de DANFE

### 2. DFe Service Adapter (`backend/internal/services/dfe_service.go`)

Serviço que converte models internos do Go para o formato do DFe-service:

```go
type DFeService struct {
    client      *dfe.Client
    companyRepo *repositories.CompanyRepository
    certRepo    *repositories.CertificateRepository
}
```

**Métodos principais:**
- `AuthorizeNFe()` - Converte NFe e envia para autorização
- `CancelNFe()` - Cancela NFe autorizada
- `CheckServiceStatus()` - Verifica status do serviço SEFAZ
- `convertNFeToDFeRequest()` - Converte models Go para DFe request
- `loadCertificate()` - Carrega certificado digital da empresa

### 3. Atualização do NFeService

O `NFeService` foi atualizado para usar o `DFeService`:

**Antes:**
```go
// Send to SEFAZ via ACBr
response, err := s.acbrService.EnviarNFe(company, acbrNFe)
```

**Depois:**
```go
// Send to SEFAZ via DFe microservice
response, err := s.dfeService.AuthorizeNFe(nfe, company)
```

### 4. Configurações

#### `.env.example`
```bash
# DFe Service Configuration (Microserviço .NET)
DFE_SERVICE_URL=http://localhost:5000
DFE_SERVICE_TIMEOUT=60s
```

#### `config.go`
```go
type DFeConfig struct {
    ServiceURL string
    Timeout    time.Duration
}
```

### 5. Router Setup

O `DFeService` é inicializado no router:

```go
dfeService := services.NewDFeService(
    cfg.DFe.ServiceURL, 
    cfg.DFe.Timeout, 
    companyRepo, 
    certRepo
)
nfeService := services.NewNFeService(
    nfeRepo, 
    companyRepo, 
    accountRepo, 
    acbrService, 
    dfeService
)
```

## 🔄 Fluxo de Autorização de NFe

```
1. Frontend/API Request
   │
   v
2. NFeHandler.HandleAuthorizeNFe()
   │
   v
3. NFeService.AuthorizeNFe()
   │
   v
4. DFeService.AuthorizeNFe()
   │  ├─> Carrega certificado
   │  ├─> Converte NFe para DFe request
   │  └─> Chama DFe-service HTTP
   │
   v
5. DFe-service (.NET)
   │  ├─> Valida dados
   │  ├─> Gera XML NFe
   │  ├─> Assina digitalmente
   │  └─> Envia para SEFAZ
   │
   v
6. SEFAZ
   │  ├─> Valida NFe
   │  └─> Retorna protocolo
   │
   v
7. Resposta volta para Go
   │  ├─> Atualiza status da NFe
   │  ├─> Salva XML e protocolo
   │  └─> Retorna para frontend
```

## 📊 Conversão de Dados

### Company (Go) → CompanyData (DFe)

```go
CompanyData{
    Document:              company.Document,
    Name:                  company.LegalName,
    TradeName:             company.TradeName,
    StateRegistration:     company.StateRegistration,
    MunicipalRegistration: company.MunicipalRegistration,
    TaxRegime:             convertTaxRegime(company.TaxRegime),
    Address:               convertAddress(company.Address),
    Email:                 company.Email,
    Phone:                 company.Phone,
}
```

### Customer (Go) → CustomerData (DFe)

```go
CustomerData{
    PersonType:            "fisica" ou "juridica",
    Document:              customer.Document,
    Name:                  customer.Name,
    StateRegistrationType: "contribuinte", "isento", "nao_contribuinte",
    Address:               convertAddress(...),
    Email:                 customer.Email,
    Phone:                 customer.Phone,
}
```

### NFeItem (Go) → NFeItemData (DFe)

```go
NFeItemData{
    ItemNumber:  itemNumber,
    Code:        item.Code,
    Description: item.Description,
    NCM:         item.NCM,
    CFOP:        item.CFOP,
    Unit:        item.Unit,
    Quantity:    item.Quantity,
    UnitValue:   item.UnitPrice,
    TotalValue:  item.TotalPrice,
    Origin:      item.Origin,
    Tax: TaxData{
        ICMS:   {...},
        PIS:    {...},
        COFINS: {...},
    },
}
```

## 🚀 Como Usar

### 1. Iniciar o DFe-service

```bash
cd DFe-service
dotnet run
```

O serviço estará disponível em `http://localhost:5000`

### 2. Configurar o Backend Go

Criar/atualizar `.env`:

```bash
DFE_SERVICE_URL=http://localhost:5000
DFE_SERVICE_TIMEOUT=60s
```

### 3. Iniciar o Backend Go

```bash
cd backend
go run cmd/api/main.go
```

### 4. Testar a Integração

```bash
# Criar uma NFe draft
curl -X POST http://localhost:8080/api/v1/nfes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "uuid-da-empresa",
    "customer": {...},
    "items": [...]
  }'

# Autorizar a NFe
curl -X POST http://localhost:8080/api/v1/nfes/{id}/authorize \
  -H "Authorization: Bearer $TOKEN"
```

## 🔍 Logs e Debugging

### Backend Go
```bash
# Logs estruturados em JSON
{"level":"info","msg":"Sending NFe to DFe service","nfe_id":"..."}
```

### DFe-service
```bash
# Logs do Serilog
[20:28:40 INF] Recebida requisição de autorização de NFe - Série: 1, Número: 1
[20:28:40 INF] NFe autorizada com sucesso
```

## ⚠️ Próximos Passos

### 3. Implementar DFe.NET Real

Atualmente o DFe-service está usando um mock. Próximos passos:

1. ✅ Criar `NFeServiceReal.cs` com DFe.NET
2. ✅ Implementar geração de XML NFe 4.0
3. ✅ Implementar assinatura digital
4. ✅ Implementar envio para SEFAZ
5. ✅ Implementar consulta de status
6. ✅ Implementar cancelamento
7. ✅ Implementar geração de DANFE

### 5. Testes de Integração

1. ✅ Testar fluxo completo Go → .NET → SEFAZ
2. ✅ Testar em ambiente de homologação
3. ✅ Testar diferentes cenários (venda estadual, interestadual, etc)
4. ✅ Testar cancelamento
5. ✅ Testar geração de DANFE

## 📝 Checklist de Implementação

- [x] Client HTTP Go criado
- [x] Tipos de dados definidos
- [x] DFeService adapter criado
- [x] NFeService atualizado
- [x] Configurações adicionadas
- [x] Router atualizado
- [ ] DFe.NET real implementado
- [ ] Testes de integração completos
- [ ] Documentação de API atualizada
- [ ] Deploy em produção

## 🎯 Benefícios da Arquitetura

1. **Separação de Responsabilidades**: Go cuida da lógica de negócio, .NET cuida da integração SEFAZ
2. **Escalabilidade**: DFe-service pode ser escalado independentemente
3. **Manutenibilidade**: Código fiscal isolado no microserviço
4. **Flexibilidade**: Fácil trocar implementação (ACBr → DFe.NET)
5. **Testabilidade**: Cada componente pode ser testado isoladamente

## 📚 Referências

- [DFe.NET GitHub](https://github.com/ZeusAutomacao/DFe.NET)
- [Manual NFe 4.0](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [PLANEJAMENTO_SISTEMA_NFE.md](./PLANEJAMENTO_SISTEMA_NFE.md)

---

**Última atualização:** 19/10/2025
**Status:** ✅ Integração básica completa - Aguardando implementação DFe.NET real

