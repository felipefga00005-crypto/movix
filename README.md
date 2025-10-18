# Movix - SaaS B2B Administration Platform

Sistema de administração SaaS B2B desenvolvido com Go, Next.js, shadcn/ui, Tailwind CSS e PostgreSQL.

## 🚀 Stack Tecnológica

### Backend
- **Go 1.23** - Linguagem de programação
- **Chi Router** - Framework HTTP
- **GORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **PostgreSQL 16** - Banco de dados

### Frontend
- **Next.js 15** - Framework React com App Router
- **shadcn/ui** - Componentes UI
- **Tailwind CSS 4** - Estilização
- **Axios** - Cliente HTTP
- **React Hook Form + Zod** - Validação de formulários

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **pgAdmin** - Administração do banco de dados

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- Go 1.23+ (para desenvolvimento local)
- Make (opcional, para usar comandos do Makefile)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd movix
```

### 2. Configure as variáveis de ambiente

#### Backend
```bash
cd backend
cp .env.example .env
# Edite .env se necessário (valores padrão já funcionam)
```

#### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edite .env.local se necessário (valores padrão já funcionam)
```

> 📝 Para mais detalhes sobre variáveis de ambiente, veja [ENV_SETUP.md](ENV_SETUP.md)

### 3. Inicie o banco de dados

```bash
# Iniciar PostgreSQL e DBGate
make db-up

# Ou manualmente
cd backend
docker-compose up -d
```

Aguarde alguns segundos para o PostgreSQL inicializar (healthcheck).

### 4. Inicie o Backend

```bash
# Em um terminal
make backend

# Ou manualmente
cd backend
go run cmd/server/main.go
```

O backend irá:
- Conectar ao banco de dados
- Executar migrations automaticamente
- Executar seed (apenas em desenvolvimento)
- Iniciar na porta 8080

### 5. Inicie o Frontend

```bash
# Em outro terminal
make frontend

# Ou manualmente
cd frontend
npm run dev
```

O frontend estará disponível em http://localhost:3000

## 🔑 Primeiro Acesso

Na primeira vez que você acessar o sistema:

1. Acesse http://localhost:3000
2. Você será redirecionado para `/setup`
3. Crie o primeiro Super Admin preenchendo:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
4. Após criar, você será automaticamente logado no sistema

**Nota:** A rota `/setup` só está disponível quando não existe nenhum Super Admin no banco de dados.

## 🌐 Acessando a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **DBGate**: http://localhost:3001 (Database management UI)

## 📚 Estrutura do Projeto

```
movix/
├── backend/
│   ├── cmd/
│   │   ├── api/          # Aplicação principal
│   │   └── seed/         # Script de seed
│   ├── internal/
│   │   ├── config/       # Configurações
│   │   ├── database/     # Conexão e migrations
│   │   ├── handlers/     # Handlers HTTP
│   │   ├── middleware/   # Middlewares
│   │   └── models/       # Models do banco
│   └── pkg/
│       └── utils/        # Utilitários (JWT, password)
├── frontend/
│   ├── app/
│   │   ├── (auth)/       # Rotas públicas (login)
│   │   └── (dashboard)/  # Rotas privadas (dashboard)
│   ├── components/       # Componentes React
│   ├── contexts/         # Context API (Auth)
│   ├── hooks/            # Custom hooks
│   └── lib/
│       └── api/          # Cliente API
└── docker-compose.yml
```

## 🔧 Comandos Úteis

### Com Makefile

```bash
make help           # Mostra todos os comandos disponíveis
make dev            # Inicia ambiente de desenvolvimento completo
make status         # Verifica status de todos os serviços

# Database
make db-up          # Inicia apenas banco de dados (PostgreSQL + DBGate)
make db-down        # Para banco de dados
make db-logs        # Mostra logs do banco
make db-clean       # Para e remove volumes do banco
make db-reset       # Reseta banco (para, remove volumes e reinicia)
make db-shell       # Conecta ao PostgreSQL via psql

# Backend & Frontend
make backend        # Roda backend localmente
make frontend       # Roda frontend localmente
make kill           # Para backend e frontend
make kill-backend   # Para apenas backend
make kill-frontend  # Para apenas frontend

# Build
make build          # Build backend e frontend
make build-backend  # Build apenas backend
make build-frontend # Build apenas frontend
make clean          # Limpa arquivos de build

# Outros
make install        # Instala todas as dependências
make test           # Executa testes
```

### Sem Makefile

```bash
# Iniciar banco de dados
docker-compose up -d

# Parar banco de dados
docker-compose down

# Ver logs
docker-compose logs -f

# Limpar volumes
docker-compose down -v

# Backend
cd backend && go run cmd/server/main.go

# Frontend
cd frontend && npm run dev
```

## 🔌 API Endpoints

### Setup (Público)

```
GET    /api/v1/setup/status           # Verifica se precisa setup
POST   /api/v1/setup                  # Cria primeiro Super Admin
```

### Autenticação (Público)

```
POST   /api/v1/auth/login                      # Login
GET    /api/v1/auth/invites/:token             # Ver convite
POST   /api/v1/auth/invites/accept             # Aceitar convite
POST   /api/v1/auth/password-reset/request     # Solicitar reset de senha
POST   /api/v1/auth/password-reset/confirm     # Confirmar reset de senha
```

### Autenticação (Protegido)

```
GET    /api/v1/auth/me         # Dados do usuário
POST   /api/v1/auth/logout     # Logout
POST   /api/v1/auth/refresh    # Refresh token
```

### Super Admin (Protegido)

```
POST   /api/v1/admin/invites              # Criar convite
GET    /api/v1/admin/empresas             # Listar empresas
POST   /api/v1/admin/empresas             # Criar empresa
GET    /api/v1/admin/empresas/:id         # Buscar empresa
PUT    /api/v1/admin/empresas/:id         # Atualizar empresa
DELETE /api/v1/admin/empresas/:id         # Deletar empresa
GET    /api/v1/admin/modulos              # Listar módulos
POST   /api/v1/admin/modulos              # Criar módulo
```

### Health Check

```
GET    /health                 # Status da API
```

## 🧪 Desenvolvimento Local

### Backend

```bash
cd backend

# Instalar dependências
go mod download

# Executar
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar
npm run dev
```

## 🗄️ Banco de Dados

### Estrutura

- `super_admins` - Super administradores
- `empresas` - Empresas/contas
- `usuarios` - Usuários internos
- `cnpjs` - CNPJs por empresa
- `modulos` - Módulos do sistema
- `empresa_modulo` - Módulos ativos por empresa
- `usuario_modulo` - Módulos por usuário

### Acessar PostgreSQL

```bash
# Via Docker
docker exec -it movix-postgres psql -U movix -d movix

# Via pgAdmin
# Acesse http://localhost:5050
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. Usuário faz login com email/senha
2. Backend valida credenciais e retorna JWT
3. Frontend armazena token no localStorage
4. Token é enviado em todas as requisições protegidas
5. Backend valida token via middleware

## 🎨 Frontend - Rotas

### Públicas (auth)
- `/` - Redireciona para `/setup` ou `/login`
- `/setup` - Configuração inicial (primeiro Super Admin)
- `/login` - Página de login
- `/forgot-password` - Solicitar recuperação de senha
- `/reset-password/[token]` - Redefinir senha
- `/signup/[token]` - Aceitar convite e criar conta

### Privadas (dashboard)
- `/dashboard` - Dashboard principal
- `/dashboard/super-admin` - Dashboard do Super Admin
- `/dashboard/admin` - Dashboard do Admin
- Requer autenticação (protegido por middleware)
- Redireciona para `/login` se não autenticado

## 📝 Próximos Passos

Conforme o PRD, as próximas implementações incluem:

1. **Super Admin**
   - CRUD de empresas
   - Gestão de módulos
   - Gestão de CNPJs

2. **Admin da Conta**
   - CRUD de usuários
   - Atribuição de módulos
   - Gestão de CNPJs

3. **Usuário Interno**
   - Visualização de módulos
   - Seleção de CNPJ ativo

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Usar o Makefile para matar processos
make kill              # Para backend e frontend
make kill-backend      # Para apenas backend
make kill-frontend     # Para apenas frontend

# Ou manualmente
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # PostgreSQL

# Matar processo específico
kill -9 <PID>
```

### Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Ver logs do PostgreSQL
docker logs movix-postgres
```

### Rebuild completo

```bash
# Parar tudo e limpar
docker-compose down -v

# Rebuild
docker-compose up --build

# Seed novamente
make seed
```

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuindo

Para contribuir com o projeto, siga as diretrizes de desenvolvimento e crie pull requests para revisão.

