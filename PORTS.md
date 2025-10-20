# 🔌 **Configuração de Portas - Movix NFe**

## 📊 **Mapeamento de Portas**

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| **🔹 Backend NestJS** | `3000` | http://localhost:3000 | API REST principal |
| **🔹 DbGate** | `3001` | http://localhost:3001 | Interface de administração do banco |
| **🔹 Frontend Next.js** | `3002` | http://localhost:3002 | Interface web do usuário |
| **🔹 PostgreSQL** | `5432` | localhost:5432 | Banco de dados |
| **🔹 Redis** | `6379` | localhost:6379 | Cache e sessões |

## 🚀 **Como Iniciar os Serviços**

### 1. **Backend + Banco de Dados**
```bash
cd backend
docker-compose up -d  # Inicia PostgreSQL, Redis e DbGate
npm run start:dev     # Inicia o backend NestJS na porta 3000
```

### 2. **Frontend**
```bash
cd frontend
npm run dev          # Inicia o frontend Next.js na porta 3002
```

## 🔗 **URLs de Acesso**

- **🌐 Frontend**: http://localhost:3002
- **🔌 API Backend**: http://localhost:3000
- **🗄️ DbGate (Admin DB)**: http://localhost:3001
- **📊 API Docs (Swagger)**: http://localhost:3000/api (se configurado)

## ⚙️ **Configurações de Ambiente**

### **Backend (.env)**
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movix_nfe?schema=public"
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3002
```

## 🔄 **Proxy Configuration**

O frontend está configurado para fazer proxy das requisições `/api/*` para o backend:

```
Frontend (3002) → /api/* → Backend (3000)
```

Isso significa que no frontend você pode fazer:
```javascript
fetch('/api/clientes')  // Será redirecionado para http://localhost:3000/clientes
```

## 🐳 **Docker Services**

```yaml
services:
  postgres:    # 5432:5432
  dbgate:      # 3001:3000  
  redis:       # 6379:6379
```

## 🛠️ **Troubleshooting**

### **Porta em uso**
```bash
# Verificar portas em uso
netstat -tlnp | grep -E ':(3000|3001|3002)'

# Matar processo em porta específica
sudo fuser -k 3000/tcp
```

### **Conflitos de porta**
Se alguma porta estiver em uso, você pode alterar:

1. **Backend**: Altere `PORT` no `backend/.env`
2. **Frontend**: Altere `PORT` no `frontend/.env.local` e scripts no `package.json`
3. **DbGate**: Altere o mapeamento no `docker-compose.yml`

## 📝 **Notas Importantes**

- ✅ **Backend sempre na 3000** (padrão NestJS)
- ✅ **Frontend sempre na 3002** (evita conflito)
- ✅ **DbGate na 3001** (admin do banco)
- ✅ **Proxy configurado** no Next.js para `/api/*`
- ✅ **CORS configurado** para desenvolvimento
