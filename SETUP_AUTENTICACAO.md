# 🔐 Sistema de Autenticação - Guia Rápido

## ✅ O que foi implementado

### Backend (Go)
- ✅ Serviço de autenticação com JWT
- ✅ Endpoints de login, registro e setup
- ✅ Middleware de autenticação
- ✅ Proteção de rotas com JWT
- ✅ Hash de senhas com bcrypt
- ✅ Verificação de setup inicial

### Frontend (Next.js)
- ✅ Página de setup inicial (`/setup`)
- ✅ Página de login (`/login`)
- ✅ Formulário de login funcional
- ✅ Middleware de proteção de rotas
- ✅ Hook `useAuth` para gerenciar autenticação
- ✅ Funções de autenticação (login, logout, etc.)

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

**Backend** - Crie ou edite `backend/.env`:
```env
JWT_SECRET=seu-secret-super-seguro-aqui
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=movix
SERVER_PORT=8080
```

**Frontend** - Crie `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Iniciar o Backend

```bash
cd backend
make run
# ou
go run cmd/server/main.go
```

O servidor estará rodando em `http://localhost:8080`

### 3. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

### 4. Primeiro Acesso (Setup)

1. Acesse `http://localhost:3000`
2. Você será redirecionado para `/setup`
3. Preencha os dados do Super Admin:
   - Nome completo
   - Email
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
4. Clique em "Criar Super Admin e Começar"
5. Você será automaticamente logado e redirecionado

### 5. Login Subsequente

1. Acesse `http://localhost:3000/login`
2. Digite email e senha
3. Clique em "Entrar"

## 📡 Endpoints da API

### Públicos (sem autenticação)

```bash
# Verificar se precisa de setup
GET /api/v1/auth/setup/status

# Criar super admin (apenas primeira vez)
POST /api/v1/auth/setup
{
  "nome": "Admin",
  "email": "admin@movix.com",
  "senha": "senha123",
  "telefone": "11999999999"
}

# Login
POST /api/v1/auth/login
{
  "email": "admin@movix.com",
  "senha": "senha123"
}
```

### Protegidos (requerem token)

```bash
# Dados do usuário atual
GET /api/v1/auth/me
Authorization: Bearer <token>

# Atualizar token
POST /api/v1/auth/refresh
Authorization: Bearer <token>

# Todas as outras rotas do sistema
GET /api/v1/usuarios
GET /api/v1/clientes
GET /api/v1/produtos
# etc...
```

## 🔑 Testando com cURL

### 1. Verificar Status do Setup
```bash
curl http://localhost:8080/api/v1/auth/setup/status
```

### 2. Criar Super Admin
```bash
curl -X POST http://localhost:8080/api/v1/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Super Admin",
    "email": "admin@movix.com",
    "senha": "senha123",
    "telefone": "11999999999"
  }'
```

### 3. Fazer Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@movix.com",
    "senha": "senha123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "codigo": "USR20250114120000",
    "nome": "Super Admin",
    "email": "admin@movix.com",
    "perfil": "super_admin",
    "status": "Ativo"
  }
}
```

### 4. Usar o Token
```bash
TOKEN="seu-token-aqui"

curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| `super_admin` | Acesso total (criado no setup) |
| `admin` | Administrador |
| `gerente` | Gerente |
| `operador` | Operador (padrão) |

## 🔒 Segurança

- **JWT Token**: Validade de 7 dias
- **Senha**: Hash bcrypt, mínimo 6 caracteres
- **Rotas Protegidas**: Middleware valida token em todas as rotas
- **CORS**: Configurado para aceitar requisições do frontend

## 📁 Arquivos Criados/Modificados

### Backend
```
backend/
├── internal/
│   ├── handlers/
│   │   └── auth_handler.go          ✨ NOVO
│   ├── services/
│   │   └── auth_service.go          ✨ NOVO
│   ├── middleware/
│   │   └── auth.go                  ✨ NOVO
│   ├── models/
│   │   └── user.go                  📝 MODIFICADO
│   ├── routers/
│   │   └── router.go                📝 MODIFICADO
│   └── cmd/server/
│       └── main.go                  📝 MODIFICADO
└── go.mod                           📝 MODIFICADO (+ JWT)
```

### Frontend
```
frontend/
├── app/
│   ├── setup/
│   │   └── page.tsx                 ✨ NOVO
│   ├── login/
│   │   └── page.tsx                 📝 MODIFICADO
│   └── page.tsx                     📝 MODIFICADO
├── components/
│   └── login-form.tsx               📝 MODIFICADO
├── lib/
│   └── auth.ts                      ✨ NOVO
├── hooks/
│   └── useAuth.ts                   ✨ NOVO
└── middleware.ts                    ✨ NOVO
```

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no `.env`
- Verifique se a porta 8080 está livre

### Frontend não conecta ao backend
- Verifique se o backend está rodando
- Verifique a variável `NEXT_PUBLIC_API_URL` no `.env.local`
- Verifique o console do navegador para erros de CORS

### Erro "setup já foi realizado"
- O sistema já tem usuários cadastrados
- Use a rota de login normal

### Token expirado
- Faça login novamente
- O token tem validade de 7 dias

## 📝 Próximos Passos Sugeridos

1. Implementar recuperação de senha
2. Adicionar validação de força de senha
3. Implementar bloqueio após tentativas falhas
4. Adicionar logs de auditoria
5. Implementar refresh token automático
6. Adicionar autenticação de dois fatores (2FA)

## 🎉 Pronto!

Agora você tem um sistema completo de autenticação funcionando! 

- Acesse `http://localhost:3000` para começar
- Complete o setup inicial
- Faça login e aproveite o sistema

