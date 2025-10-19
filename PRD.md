# PRD - Sistema de Emissão de NFe

## 📋 Visão Geral

Sistema multi-tenant para emissão de Nota Fiscal Eletrônica (NFe) com hierarquia de usuários.

**Stack**: Go + PostgreSQL + Redis

---

## 🎯 Objetivos

- Sistema multi-tenant para emissão de NFe
- Hierarquia: SuperAdmin → Admin (Escritório) → User (Cliente)
- Usuários podem acessar múltiplas empresas
- Integração completa com SEFAZ
- API RESTful segura e escalável

---

## 👥 Hierarquia de Usuários

```
SuperAdmin (role: superadmin)
    └── Account (Escritório de Contabilidade)
        ├── Admin (role: admin) - Gerente do Escritório
        └── Companies (CNPJs dos Clientes)
            └── User (role: user) - Ex: João (Padaria + Oficina)
```

### Permissões

**SuperAdmin** (`role="superadmin"`, `account_id=NULL`)
- Criar/editar/deletar Accounts
- Definir limites por Account (max companies, users, NFes/mês)
- Visualizar métricas globais

**Admin** (`role="admin"`)
- Criar/editar/deletar Companies (dentro de sua Account)
- Criar/editar/deletar Users (dentro de sua Account)
- Vincular Users a múltiplas Companies
- Gerenciar certificados digitais

**User** (`role="user"`)
- Acessar múltiplas Companies vinculadas
- Trocar de Company ativa sem logout
- Emitir NFe para a Company ativa
- Visualizar histórico de NFes

---

## 📊 Entidades

### User
- `id`, `account_id` (NULL para superadmin), `email`, `password`, `name`, `phone`
- `role` (superadmin, admin, user), `status` (active, inactive, suspended)

### Account
- `id`, `name`, `email`, `phone`, `document` (CNPJ)
- `max_companies`, `max_users`, `max_nfes_per_month`
- `status` (active, suspended, cancelled)

### Company
- `id`, `account_id`, `trade_name`, `legal_name`, `document` (CNPJ)
- `state_registration`, `municipal_registration`, `address` (JSON)
- `tax_regime`, `environment`, `certificate_id`
- `next_nfe_number`, `nfe_series`, `status`

### UserCompany (Pivot)
- `id`, `user_id`, `company_id`, `role` (owner, manager, operator)

### NFe
- `id`, `company_id`, `user_id`, `number`, `series`, `model`
- `customer` (JSON), `items` (JSON)
- `total_products`, `total_nfe`
- `status` (draft, pending, authorized, rejected, cancelled)
- `access_key`, `protocol`, `xml`

### Certificate
- `id`, `company_id`, `name`, `content` (encrypted), `password` (encrypted)
- `expires_at`, `status` (active, expired)

---

## 🔐 Autenticação

### JWT Claims
```
- user_id
- account_id (NULL para SuperAdmin)
- role (superadmin, admin, user)
- company_id (Company ativa, apenas para user)
```

### Endpoints
- `POST /api/auth/login` - Login único para todos os roles
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/switch-company` - Trocar company ativa (apenas user)

### Middlewares
- `AuthMiddleware` - Valida JWT
- `RequireRole(roles...)` - Valida role do usuário
- `RequireAccount` - Valida acesso à Account
- `RequireCompany` - Valida acesso à Company

---

## 📁 Estrutura do Projeto

```
backend/
├── cmd/api/main.go
├── internal/
│   ├── config/config.go
│   ├── database/
│   │   ├── connection.go
│   │   ├── migrations/
│   │   └── seeds/
│   ├── models/
│   │   ├── user.go
│   │   ├── account.go
│   │   ├── company.go
│   │   ├── user_company.go
│   │   ├── nfe.go
│   │   └── certificate.go
│   ├── repositories/
│   │   ├── user_repository.go
│   │   ├── account_repository.go
│   │   ├── company_repository.go
│   │   ├── user_company_repository.go
│   │   ├── nfe_repository.go
│   │   └── certificate_repository.go
│   ├── services/
│   │   ├── auth_service.go
│   │   ├── user_service.go
│   │   ├── account_service.go
│   │   ├── company_service.go
│   │   ├── nfe_service.go
│   │   ├── acbr_service.go
│   │   └── certificate_service.go
│   ├── handlers/
│   │   ├── auth_handler.go
│   │   ├── user_handler.go
│   │   ├── account_handler.go
│   │   ├── company_handler.go
│   │   └── nfe_handler.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── role.go
│   │   ├── account.go
│   │   ├── company.go
│   │   ├── cors.go
│   │   └── logger.go
│   ├── router/router.go
│   └── validators/
│       ├── user_validator.go
│       ├── account_validator.go
│       ├── company_validator.go
│       └── nfe_validator.go
├── pkg/
│   ├── jwt/jwt.go
│   ├── crypto/crypto.go
│   ├── response/response.go
│   └── errors/errors.go
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── Makefile
├── go.mod
└── go.sum
```

---

## 🛠️ Stack Tecnológica

### Core
- Go 1.21+
- Gin (framework web)
- GORM (ORM)
- PostgreSQL 15+
- Redis

### Bibliotecas
- `github.com/golang-jwt/jwt/v5` - JWT
- `github.com/go-playground/validator/v10` - Validação
- `github.com/golang-migrate/migrate/v4` - Migrations
- `golang.org/x/crypto/bcrypt` - Hash de senhas
- `github.com/google/uuid` - UUID
- `github.com/joho/godotenv` - Env vars

### Integração NFe
- **ACBrNFeMonitorDLL** - DLL do ACBr para integração com SEFAZ
- CGO para chamar funções da DLL do ACBr
- `encoding/json` - Comunicação com ACBr via JSON

---

## 📝 Tasks de Desenvolvimento

### ✅ Fase 1: Setup (Semana 1-2)
- [ ] Inicializar projeto Go (`go mod init`)
- [ ] Criar estrutura de pastas
- [ ] Configurar Docker Compose (Postgres + Redis)
- [ ] Criar `.env.example` e `/internal/config`
- [ ] Implementar conexão com banco (`/internal/database/connection.go`)
- [ ] Configurar migrations (golang-migrate)
- [ ] Criar Makefile com comandos úteis

### ✅ Fase 2: Models e Migrations (Semana 2-3)
- [ ] Criar models em `/internal/models/`
  - [ ] `user.go` (com campo `role`)
  - [ ] `account.go`
  - [ ] `company.go`
  - [ ] `user_company.go`
  - [ ] `nfe.go`
  - [ ] `certificate.go`
- [ ] Criar migrations SQL para todas as tabelas
- [ ] Criar seed de SuperAdmin inicial
- [ ] Testar migrations (up/down)

### ✅ Fase 3: Autenticação (Semana 3-4)
- [ ] Implementar `/pkg/jwt` (geração e validação)
- [ ] Implementar `/pkg/crypto` (bcrypt)
- [ ] Criar `auth_service.go`
  - [ ] Login
  - [ ] Refresh token
  - [ ] Switch company
- [ ] Criar `auth_handler.go`
- [ ] Criar middlewares
  - [ ] `auth.go` (validação JWT)
  - [ ] `role.go` (autorização por role)
  - [ ] `account.go` (validação de Account)
  - [ ] `company.go` (validação de Company)
- [ ] Configurar rotas em `/internal/router/router.go`
- [ ] Testar com Postman

### ✅ Fase 4: Repositories (Semana 4-5)
- [ ] Criar repositories em `/internal/repositories/`
  - [ ] `user_repository.go`
  - [ ] `account_repository.go`
  - [ ] `company_repository.go`
  - [ ] `user_company_repository.go`
  - [ ] `nfe_repository.go`
  - [ ] `certificate_repository.go`
- [ ] Implementar CRUD básico
- [ ] Implementar queries complexas (filtros, paginação)
- [ ] Testar repositories

### ✅ Fase 5: Módulo SuperAdmin (Semana 5-6)
- [ ] Criar `account_service.go`
  - [ ] Criar Account
  - [ ] Atualizar limites
  - [ ] Listar Accounts
  - [ ] Criar primeiro Admin da Account
- [ ] Criar `account_handler.go`
- [ ] Configurar rotas protegidas (apenas superadmin)
- [ ] Testar endpoints

### ✅ Fase 6: Módulo Admin (Semana 6-8)
- [ ] Criar `company_service.go`
  - [ ] CRUD de Companies
  - [ ] Validar limites (max_companies)
- [ ] Criar `user_service.go`
  - [ ] CRUD de Users (role="user")
  - [ ] Vincular User a Companies
  - [ ] Validar limites (max_users)
- [ ] Criar `company_handler.go` e `user_handler.go`
- [ ] Configurar rotas protegidas (admin + superadmin)
- [ ] Testar endpoints

### ✅ Fase 7: Troca de Company (Semana 8)
- [ ] Implementar `POST /api/auth/switch-company`
- [ ] Validar se User tem acesso à Company
- [ ] Gerar novo token JWT com novo `company_id`
- [ ] Implementar `GET /api/user/companies` (listar companies do user)
- [ ] Testar troca de company

### ✅ Fase 8: Certificados Digitais (Semana 9)
- [ ] Criar `certificate_service.go`
  - [ ] Upload de certificado A1 (.pfx)
  - [ ] Criptografar certificado e senha
  - [ ] Validar certificado
  - [ ] Verificar expiração
- [ ] Criar endpoints de certificados
- [ ] Testar upload e validação

### ✅ Fase 9: Integração ACBr (Semana 9-10)
- [ ] Configurar ACBrNFeMonitorDLL
  - [ ] Baixar e configurar DLL do ACBr
  - [ ] Criar wrapper Go usando CGO
  - [ ] Implementar funções de comunicação com DLL
- [ ] Criar `acbr_service.go`
  - [ ] Inicializar ACBr Monitor
  - [ ] Configurar certificado digital
  - [ ] Configurar ambiente (homologação/produção)
  - [ ] Configurar webservices por UF
- [ ] Testar comunicação com DLL

### ✅ Fase 10: Integração SEFAZ via ACBr (Semana 10-12)
- [ ] Implementar funções ACBr em `acbr_service.go`
  - [ ] Enviar NFe para autorização
  - [ ] Consultar status da NFe
  - [ ] Cancelar NFe
  - [ ] Inutilizar numeração
  - [ ] Consultar cadastro
  - [ ] Download de XML
- [ ] Processar retornos do ACBr (JSON)
- [ ] Tratar erros e rejeições SEFAZ
- [ ] Testar em ambiente de homologação

### ✅ Fase 11: Módulo NFe (Semana 12-13)
- [ ] Criar `nfe_service.go`
  - [ ] Criar NFe (draft)
  - [ ] Gerar JSON para ACBr
  - [ ] Autorizar NFe via ACBr
  - [ ] Processar retorno do ACBr
  - [ ] Cancelar NFe via ACBr
  - [ ] Listar NFes com filtros
  - [ ] Download de XML
  - [ ] Validar limites (max_nfes_per_month)
- [ ] Criar `nfe_handler.go`
- [ ] Configurar rotas
- [ ] Testar fluxo completo de emissão

### ✅ Fase 12: Validações (Semana 13-14)
- [ ] Criar validators em `/internal/validators/`
  - [ ] Validação de CPF/CNPJ
  - [ ] Validação de dados de NFe
  - [ ] Validação de limites
- [ ] Implementar logs de auditoria
- [ ] Implementar rate limiting
- [ ] Testar validações

### ✅ Fase 13: Testes (Semana 14-15)
- [ ] Testes unitários (services)
- [ ] Testes unitários (repositories)
- [ ] Testes de integração (handlers)
- [ ] Testes de autorização (middlewares)
- [ ] Testes de integração SEFAZ (homologação)
- [ ] Cobertura > 70%

### ✅ Fase 14: Deploy (Semana 15-16)
- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Criar README.md
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Configurar ambiente de produção
- [ ] Deploy
- [ ] Monitoramento e logs
- [ ] Backups automáticos

---

## 🔌 Integração com ACBr

### ACBrNFeMonitorDLL

O sistema utiliza a **ACBrNFeMonitorDLL** para integração com SEFAZ, eliminando a necessidade de implementar manualmente:
- Geração de XML NFe
- Assinatura digital
- Comunicação SOAP com SEFAZ
- Validação de schemas XSD
- Tratamento de retornos SEFAZ

### Arquitetura de Integração

```
Go Backend (API)
    ↓ (CGO)
ACBrNFeMonitorDLL (Windows DLL)
    ↓ (SOAP)
SEFAZ (Webservices)
```

### Comunicação Go ↔ ACBr

**Formato**: JSON

**Exemplo - Enviar NFe**:
```json
{
  "comando": "NFE.EnviarNFe",
  "parametros": {
    "nfe": {
      "ide": {...},
      "emit": {...},
      "dest": {...},
      "det": [...]
    }
  }
}
```

**Retorno ACBr**:
```json
{
  "sucesso": true,
  "protocolo": "123456789012345",
  "xml": "<nfeProc>...</nfeProc>",
  "mensagem": "NFe autorizada"
}
```

### Funções ACBr Utilizadas

1. **NFE.EnviarNFe** - Enviar NFe para autorização
2. **NFE.ConsultarNFe** - Consultar status da NFe
3. **NFE.CancelarNFe** - Cancelar NFe autorizada
4. **NFE.InutilizarNumeracao** - Inutilizar numeração
5. **NFE.ConsultarCadastro** - Consultar cadastro de contribuinte
6. **NFE.StatusServico** - Verificar status do serviço SEFAZ

### Configuração ACBr

O ACBr será configurado via JSON com:
- Certificado digital (path do .pfx + senha)
- Ambiente (homologação/produção)
- UF do emitente
- Série e numeração da NFe
- Configurações de proxy (se necessário)

### Vantagens do ACBr

✅ **Manutenção**: ACBr é mantido pela comunidade e sempre atualizado
✅ **Compliance**: Garante conformidade com layouts SEFAZ
✅ **Estabilidade**: Biblioteca madura e testada
✅ **Suporte**: Comunidade ativa e documentação
✅ **Funcionalidades**: Suporta todos os eventos NFe (cancelamento, carta de correção, etc)

---

## 🔑 Funcionalidades Principais

### 1. Multi-tenancy
- Isolamento de dados por Account
- SuperAdmin vê tudo
- Admin vê apenas sua Account
- User vê apenas suas Companies

### 2. Troca de Company
- User pode estar vinculado a múltiplas Companies
- Troca de contexto sem logout
- Novo token JWT gerado com novo `company_id`

### 3. Limites por Account
- `max_companies` - Máximo de CNPJs
- `max_users` - Máximo de usuários
- `max_nfes_per_month` - Máximo de NFes por mês

### 4. Integração SEFAZ via ACBr
- Autorização de NFe via ACBrNFeMonitorDLL
- Cancelamento de NFe
- Consulta de status
- Inutilização de numeração
- Carta de correção eletrônica (CCe)
- Download de XML autorizado
- Assinatura digital automática pelo ACBr

---

## 📌 Regras de Negócio

1. SuperAdmin tem `account_id = NULL`
2. Admin e User devem ter `account_id` preenchido
3. User só pode acessar Companies vinculadas via `user_companies`
4. Admin só pode criar Companies e Users dentro de sua Account
5. Validar limites antes de criar Companies, Users ou NFes
6. Certificado digital é obrigatório para emitir NFe
7. ACBr cuida da assinatura digital e validação de XML automaticamente
8. Armazenar XML autorizado por no mínimo 5 anos (obrigatório por lei)
9. ACBrNFeMonitorDLL deve estar instalado no servidor Windows
10. Comunicação com ACBr é feita via CGO (C bindings)

---

## 💻 Requisitos de Sistema

### Servidor de Aplicação
- **SO**: Windows Server 2016+ (para rodar ACBrNFeMonitorDLL)
- **Go**: 1.21+
- **CGO**: Habilitado (para chamar DLL do ACBr)
- **PostgreSQL**: 15+
- **Redis**: 7+

### ACBr
- **ACBrNFeMonitorDLL**: Versão mais recente
- **Dependências**: Runtime do Delphi (se necessário)
- **Certificado A1**: Instalado no servidor ou arquivo .pfx

### Desenvolvimento
- **Windows**: Para desenvolvimento com ACBr
- **Docker**: Para PostgreSQL e Redis (desenvolvimento)
- **Postman**: Para testes de API

---

## 🚀 Próximos Passos

1. Revisar e aprovar este PRD
2. Criar repositório Git
3. Baixar e configurar ACBrNFeMonitorDLL
4. Iniciar Fase 1 (Setup)
5. Definir sprints semanais

