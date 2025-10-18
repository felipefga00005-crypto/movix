# ✅ Checklist de Verificação

Use este checklist para verificar se tudo está funcionando corretamente.

## 📦 Instalação

- [ ] Repositório clonado
- [ ] Docker e Docker Compose instalados
- [ ] Node.js 20+ instalado (para dev local)
- [ ] Go 1.23+ instalado (para dev local)

## 🗄️ Banco de Dados

- [ ] PostgreSQL iniciado (`docker-compose up -d postgres`)
- [ ] Aguardou 10 segundos para inicialização
- [ ] Seed executado (`cd backend && go run cmd/seed/main.go`)
- [ ] Viu mensagens de sucesso:
  - [ ] ✓ Super Admin created
  - [ ] ✓ Empresa created
  - [ ] ✓ Admin User created
  - [ ] ✓ Regular User created
  - [ ] ✓ Modules created (4)
  - [ ] ✓ CNPJ created

## 🔧 Backend

- [ ] Dependências instaladas (`cd backend && go mod download`)
- [ ] Arquivo `.env` criado (copiado de `.env.example`)
- [ ] Backend compila sem erros (`go build -o main cmd/api/main.go`)
- [ ] Backend inicia sem erros (`go run cmd/api/main.go`)
- [ ] Viu mensagem: "Server listening on :8080"
- [ ] Health check funciona: `curl http://localhost:8080/health` retorna "OK"

## 🎨 Frontend

- [ ] Dependências instaladas (`cd frontend && npm install`)
- [ ] Arquivo `.env.local` existe
- [ ] Frontend compila sem erros (`npm run dev`)
- [ ] Viu mensagem: "Ready in X ms"
- [ ] Acessa http://localhost:3000 sem erros

## 🔐 Autenticação

### Login Super Admin
- [ ] Acessa http://localhost:3000
- [ ] Redireciona para /login
- [ ] Formulário de login aparece
- [ ] Preenche: admin@movix.com / admin123
- [ ] Clica em "Login"
- [ ] Vê toast de sucesso
- [ ] Redireciona para /dashboard/super-admin
- [ ] Dashboard carrega corretamente

### Login Admin
- [ ] Faz logout (se necessário)
- [ ] Acessa /login
- [ ] Preenche: admin@empresa.com / admin123
- [ ] Clica em "Login"
- [ ] Redireciona para /dashboard/admin
- [ ] Dashboard carrega corretamente

### Login User
- [ ] Faz logout (se necessário)
- [ ] Acessa /login
- [ ] Preenche: user@empresa.com / user123
- [ ] Clica em "Login"
- [ ] Redireciona para /dashboard
- [ ] Dashboard carrega corretamente

### Proteção de Rotas
- [ ] Faz logout
- [ ] Tenta acessar /dashboard diretamente
- [ ] É redirecionado para /login
- [ ] Após login, consegue acessar /dashboard

## 🧪 API Testing

### Health Check
```bash
curl http://localhost:8080/health
```
- [ ] Retorna "OK"

### Login via API
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@movix.com","password":"admin123"}'
```
- [ ] Retorna JSON com `token` e `user`
- [ ] Token é uma string longa (JWT)
- [ ] User contém: id, email, nome, role

### Me Endpoint
```bash
# Substitua <TOKEN> pelo token recebido
curl -X GET http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```
- [ ] Retorna dados do usuário
- [ ] Contém: id, email, nome, role

### Erro de Autenticação
```bash
curl -X GET http://localhost:8080/api/v1/auth/me
```
- [ ] Retorna erro 401
- [ ] Mensagem: "Authorization header required"

## 🐳 Docker Compose

- [ ] Todos os serviços iniciam: `docker-compose up`
- [ ] Postgres está healthy: `docker ps` mostra "(healthy)"
- [ ] Backend inicia após postgres
- [ ] Frontend inicia após backend
- [ ] Sem erros nos logs: `docker-compose logs`

### Serviços Rodando
- [ ] `docker ps` mostra 4 containers:
  - [ ] movix-postgres
  - [ ] movix-backend
  - [ ] movix-frontend
  - [ ] movix-pgadmin

### Portas Acessíveis
- [ ] Frontend: http://localhost:3000
- [ ] Backend: http://localhost:8080
- [ ] PostgreSQL: localhost:5432
- [ ] pgAdmin: http://localhost:5050

## 🗃️ pgAdmin

- [ ] Acessa http://localhost:5050
- [ ] Login: admin@movix.com / admin
- [ ] Consegue adicionar servidor:
  - [ ] Host: postgres (ou localhost)
  - [ ] Port: 5432
  - [ ] Database: movix
  - [ ] Username: movix
  - [ ] Password: movix123
- [ ] Consegue ver as tabelas:
  - [ ] super_admins
  - [ ] empresas
  - [ ] usuarios
  - [ ] cnpjs
  - [ ] modulos
  - [ ] empresa_modulo
  - [ ] usuario_modulo

## 📊 Dados no Banco

### Super Admins
```sql
SELECT email, nome, ativo FROM super_admins;
```
- [ ] Retorna 1 registro: admin@movix.com

### Empresas
```sql
SELECT nome, plano, status FROM empresas;
```
- [ ] Retorna 1 registro: Empresa Demo

### Usuários
```sql
SELECT email, nome, role FROM usuarios;
```
- [ ] Retorna 2 registros:
  - [ ] admin@empresa.com (admin)
  - [ ] user@empresa.com (user)

### Módulos
```sql
SELECT nome, slug FROM modulos;
```
- [ ] Retorna 4 registros:
  - [ ] NF-e
  - [ ] NFC-e
  - [ ] CT-e
  - [ ] MDF-e

### CNPJs
```sql
SELECT cnpj, razao_social, autorizado FROM cnpjs;
```
- [ ] Retorna 1 registro: 12345678000190

## 🔄 Fluxo Completo

1. [ ] Inicia PostgreSQL
2. [ ] Executa seed
3. [ ] Inicia backend
4. [ ] Inicia frontend
5. [ ] Acessa http://localhost:3000
6. [ ] Faz login com admin@movix.com
7. [ ] Vê dashboard
8. [ ] Faz logout
9. [ ] É redirecionado para /login
10. [ ] Faz login com admin@empresa.com
11. [ ] Vê dashboard
12. [ ] Fecha navegador
13. [ ] Abre novamente
14. [ ] Ainda está logado (token no localStorage)
15. [ ] Faz logout
16. [ ] Token é removido

## 🐛 Troubleshooting

Se algo não funcionar:

### Backend não inicia
- [ ] Verificou logs: `docker logs movix-backend`
- [ ] PostgreSQL está rodando?
- [ ] Variáveis de ambiente corretas?
- [ ] Porta 8080 está livre?

### Frontend não inicia
- [ ] Verificou logs: `docker logs movix-frontend`
- [ ] node_modules instalado?
- [ ] Porta 3000 está livre?
- [ ] NEXT_PUBLIC_API_URL está correto?

### Login não funciona
- [ ] Backend está rodando?
- [ ] Seed foi executado?
- [ ] Credenciais corretas?
- [ ] Console do navegador mostra erros?
- [ ] Network tab mostra requisição para /api/v1/auth/login?

### Erro de CORS
- [ ] Backend tem CORS configurado?
- [ ] Frontend está em http://localhost:3000?
- [ ] Backend está em http://localhost:8080?

## ✅ Tudo Funcionando!

Se todos os itens acima estão marcados, parabéns! 🎉

O sistema está funcionando corretamente e você pode começar a desenvolver as funcionalidades de negócio conforme o PRD.

## 📚 Próximos Passos

1. [ ] Ler o PRD.md
2. [ ] Implementar CRUD de empresas (Super Admin)
3. [ ] Implementar CRUD de usuários (Admin)
4. [ ] Implementar gestão de módulos
5. [ ] Implementar gestão de CNPJs
6. [ ] Adicionar testes
7. [ ] Melhorar UI/UX
8. [ ] Adicionar funcionalidades fiscais

Boa sorte! 🚀

