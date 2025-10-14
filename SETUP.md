# 🚀 Setup do Projeto Movix

## 📋 Configuração Rápida

### 1. **Backend (Go)**

```bash
# Entre na pasta do backend
cd backend

# Copie o arquivo de exemplo
cp .env.example .env

# Suba o banco PostgreSQL
docker-compose up -d

# Instale as dependências
make install

# Execute o backend
make run
```

**✅ Backend rodando em:** `http://localhost:8080`

---

### 2. **Frontend (Next.js)**

```bash
# Entre na pasta do frontend
cd frontend

# Copie o arquivo de exemplo (já criado)
# cp .env.example .env

# Instale as dependências
npm install

# Execute o frontend
npm run dev
```

**✅ Frontend rodando em:** `http://localhost:3000`

---

## 🔧 Configurações dos Arquivos .env

### **Backend (.env)**
```env
# Servidor
SERVER_PORT=8080
ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=movix
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

### **Frontend (.env)**
```env
# API do backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Ambiente
NODE_ENV=development
```

---

## 🐳 Docker (Banco de Dados)

O PostgreSQL roda via Docker Compose:

```bash
# Subir o banco
cd backend
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Parar o banco
docker-compose down
```

---

## 🔗 URLs Importantes

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api/v1
- **PostgreSQL:** localhost:5432

---

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` 
- O `.gitignore` já está configurado para proteger esses arquivos
- Use sempre os arquivos `.env.example` como referência
