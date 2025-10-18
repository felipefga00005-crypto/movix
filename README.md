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
```

Edite o arquivo `.env` conforme necessário.

### 3. Inicie os serviços com Docker Compose

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou use o Makefile
make build
make up
```

## 🔑 Credenciais Padrão

O seed é executado automaticamente quando o backend inicia em modo desenvolvimento (`ENVIRONMENT=development`).

Você terá os seguintes usuários:

| Tipo | Email | Senha | Descrição |
|------|-------|-------|-----------|
| Super Admin | admin@movix.com | admin123 | Administrador do sistema |
| Admin | admin@empresa.com | admin123 | Administrador da empresa |
| Usuário | user@empresa.com | user123 | Usuário regular |

## 🌐 Acessando a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **pgAdmin**: http://localhost:5050
  - Email: admin@movix.com
  - Senha: admin

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
make dev            # Inicia todos os serviços
make up             # Inicia em modo detached
make down           # Para todos os serviços
make logs           # Mostra logs
make clean          # Para e remove volumes
make seed           # Executa seed do banco
make backend-dev    # Roda backend localmente
make frontend-dev   # Roda frontend localmente
```

### Sem Makefile

```bash
# Iniciar serviços
docker-compose up

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up --build

# Seed
cd backend && go run cmd/seed/main.go
```

## 🔌 API Endpoints

### Autenticação

```
POST   /api/v1/auth/login      # Login
GET    /api/v1/auth/me         # Dados do usuário (protegido)
POST   /api/v1/auth/logout     # Logout (protegido)
POST   /api/v1/auth/refresh    # Refresh token (protegido)
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
- `/login` - Página de login

### Privadas (dashboard)
- `/dashboard` - Dashboard principal
- Requer autenticação
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
# Verificar processos usando as portas
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :5432  # PostgreSQL

# Matar processo
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

