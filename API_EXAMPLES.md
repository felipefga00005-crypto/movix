# 🔌 API Examples

Exemplos de uso da API com curl, HTTPie e JavaScript.

## 🔐 Autenticação

### Login - Super Admin

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@movix.com",
    "password": "admin123"
  }'
```

**HTTPie:**
```bash
http POST http://localhost:8080/api/v1/auth/login \
  email=admin@movix.com \
  password=admin123
```

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@movix.com',
    password: 'admin123',
  }),
});

const data = await response.json();
console.log(data);
// { token: "eyJhbGc...", user: { id: "...", email: "...", ... } }
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNDU2NzgtMTIzNC0xMjM0LTEyMzQtMTIzNDU2Nzg5MGFiIiwiZW1haWwiOiJhZG1pbkBtb3ZpeC5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJleHAiOjE3MDk4NTYwMDAsImlhdCI6MTcwOTc2OTYwMH0.abc123...",
  "user": {
    "id": "12345678-1234-1234-1234-1234567890ab",
    "email": "admin@movix.com",
    "nome": "Super Admin",
    "role": "super_admin"
  }
}
```

### Login - Admin da Empresa

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "87654321-4321-4321-4321-210987654321",
    "email": "admin@empresa.com",
    "nome": "Admin Empresa",
    "role": "admin",
    "empresa_id": "abcdef12-3456-7890-abcd-ef1234567890"
  }
}
```

### Login - Usuário Regular

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@empresa.com",
    "password": "user123"
  }'
```

---

## 👤 Dados do Usuário Autenticado

**curl:**
```bash
# Substitua <TOKEN> pelo token recebido no login
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

**HTTPie:**
```bash
http GET http://localhost:8080/api/v1/auth/me \
  "Authorization: Bearer <TOKEN>"
```

**JavaScript (Fetch):**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const user = await response.json();
console.log(user);
```

**Axios (como no frontend):**
```javascript
import axios from 'axios';

const token = localStorage.getItem('token');

const response = await axios.get('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

console.log(response.data);
```

**Resposta:**
```json
{
  "id": "12345678-1234-1234-1234-1234567890ab",
  "email": "admin@movix.com",
  "nome": "Super Admin",
  "role": "super_admin"
}
```

---

## 🔄 Refresh Token

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Authorization: Bearer <TOKEN>"
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token..."
}
```

---

## 🚪 Logout

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

**Resposta:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🏥 Health Check

**curl:**
```bash
curl http://localhost:8080/health
```

**Resposta:**
```
OK
```

---

## 🧪 Testando Erros

### Login com credenciais inválidas

**curl:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }'
```

**Resposta (401):**
```
Invalid credentials
```

### Acessar rota protegida sem token

**curl:**
```bash
curl -X GET http://localhost:8080/api/v1/auth/me
```

**Resposta (401):**
```
Authorization header required
```

### Token inválido

**curl:**
```bash
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer invalid_token"
```

**Resposta (401):**
```
Invalid or expired token
```

---

## 📝 Exemplo Completo de Fluxo

### 1. Login

```bash
# Fazer login e salvar o token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@movix.com","password":"admin123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. Usar o token para acessar dados

```bash
# Obter dados do usuário
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq
```

### 3. Refresh do token

```bash
# Renovar o token
NEW_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.token')

echo "New Token: $NEW_TOKEN"
```

### 4. Logout

```bash
# Fazer logout
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Inspecionando o JWT Token

Você pode decodificar o JWT em https://jwt.io ou usando:

**Node.js:**
```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

**Bash (com jq):**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo $TOKEN | cut -d. -f2 | base64 -d | jq
```

**Payload esperado:**
```json
{
  "user_id": "12345678-1234-1234-1234-1234567890ab",
  "email": "admin@movix.com",
  "role": "super_admin",
  "exp": 1709856000,
  "iat": 1709769600
}
```

---

## 🐛 Debugging

### Ver logs do backend

```bash
# Se rodando localmente
# Os logs aparecem no terminal

# Se rodando com Docker
docker logs -f movix-backend
```

### Verificar se o backend está rodando

```bash
curl http://localhost:8080/health
```

### Verificar conexão com o banco

```bash
# Conectar ao PostgreSQL
docker exec -it movix-postgres psql -U movix -d movix

# Verificar se há usuários
SELECT email, nome, ativo FROM super_admins;
SELECT email, nome, role FROM usuarios;
```

---

## 📚 Coleção Postman/Insomnia

### Postman Collection (JSON)

```json
{
  "info": {
    "name": "Movix API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@movix.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "http://localhost:8080/api/v1/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "auth", "login"]
            }
          }
        },
        {
          "name": "Me",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "http://localhost:8080/api/v1/auth/me",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "v1", "auth", "me"]
            }
          }
        }
      ]
    }
  ]
}
```

Salve como `movix-api.postman_collection.json` e importe no Postman.

---

## 🎯 Próximos Endpoints (A Implementar)

Conforme o PRD, os próximos endpoints serão:

### Super Admin
- `GET /api/v1/admin/empresas` - Listar empresas
- `POST /api/v1/admin/empresas` - Criar empresa
- `GET /api/v1/admin/empresas/:id` - Detalhes da empresa
- `PUT /api/v1/admin/empresas/:id` - Atualizar empresa
- `DELETE /api/v1/admin/empresas/:id` - Deletar empresa

### Admin da Conta
- `GET /api/v1/empresa/usuarios` - Listar usuários
- `POST /api/v1/empresa/usuarios` - Criar usuário
- `PUT /api/v1/empresa/usuarios/:id` - Atualizar usuário
- `DELETE /api/v1/empresa/usuarios/:id` - Deletar usuário

E assim por diante...

