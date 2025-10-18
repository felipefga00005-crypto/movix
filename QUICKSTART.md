# 🚀 Quick Start Guide

## Início Rápido (5 minutos)

### 1. Inicie o PostgreSQL

```bash
docker-compose up -d postgres
```

Aguarde alguns segundos para o PostgreSQL inicializar.

### 2. Inicie o Backend

O backend executa automaticamente as migrations e o seed em modo desenvolvimento.

```bash
# Na pasta backend
go run cmd/api/main.go
```

O backend estará rodando em `http://localhost:8080`

### 4. Inicie o Frontend

```bash
# Em outro terminal, na pasta frontend
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 5. Faça Login

Acesse http://localhost:3000 e faça login com:

- **Super Admin**: admin@movix.com / admin123
- **Admin**: admin@empresa.com / admin123
- **User**: user@empresa.com / user123

## 🧪 Testando a API

### Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@movix.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@movix.com",
    "nome": "Super Admin",
    "role": "super_admin"
  }
}
```

### Obter dados do usuário

```bash
# Substitua <TOKEN> pelo token recebido no login
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Health Check

```bash
curl http://localhost:8080/health
```

## 🐳 Usando Docker Compose (Alternativa)

Se preferir rodar tudo com Docker:

```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Em outro terminal, executar seed
docker exec -it movix-backend go run cmd/seed/main.go
```

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- pgAdmin: http://localhost:5050

## 📊 Acessar o Banco de Dados

### Via psql (Docker)

```bash
docker exec -it movix-postgres psql -U movix -d movix
```

Comandos úteis:
```sql
-- Listar tabelas
\dt

-- Ver super admins
SELECT * FROM super_admins;

-- Ver empresas
SELECT * FROM empresas;

-- Ver usuários
SELECT * FROM usuarios;

-- Ver módulos
SELECT * FROM modulos;
```

### Via pgAdmin

1. Acesse http://localhost:5050
2. Login: admin@movix.com / admin
3. Add New Server:
   - Name: Movix
   - Host: postgres (ou localhost se rodando local)
   - Port: 5432
   - Database: movix
   - Username: movix
   - Password: movix123

## 🔍 Verificando se está tudo funcionando

### Backend

```bash
# Health check
curl http://localhost:8080/health
# Deve retornar: OK

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@movix.com","password":"admin123"}'
# Deve retornar token e dados do usuário
```

### Frontend

1. Acesse http://localhost:3000
2. Deve redirecionar para /login
3. Faça login com admin@movix.com / admin123
4. Deve redirecionar para /dashboard/super-admin

## 🛑 Parar os Serviços

### Desenvolvimento Local

```bash
# Ctrl+C nos terminais do backend e frontend

# Parar PostgreSQL
docker-compose down
```

### Docker Compose

```bash
docker-compose down

# Para remover volumes também
docker-compose down -v
```

## 🔄 Resetar o Banco de Dados

```bash
# Parar e remover volumes
docker-compose down -v

# Iniciar PostgreSQL novamente
docker-compose up -d postgres

# Executar seed
cd backend
go run cmd/seed/main.go
```

## 📝 Próximos Passos

Agora que o sistema está rodando, você pode:

1. Explorar o dashboard
2. Implementar novos endpoints no backend
3. Criar novas páginas no frontend
4. Adicionar funcionalidades conforme o PRD

Consulte o [README.md](README.md) para mais detalhes sobre a arquitetura e desenvolvimento.

