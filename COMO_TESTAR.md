# 🧪 Como Testar a Integração - Movix ERP

## ✅ Pré-requisitos

1. **Backend Go rodando** em `http://localhost:8080`
2. **Frontend Next.js rodando** em `http://localhost:3000`
3. **PostgreSQL rodando** (via Docker)

## 🚀 Passo a Passo

### 1. Iniciar o Backend

```bash
# Terminal 1 - Backend
cd backend
docker-compose up -d  # Subir PostgreSQL
make run              # Iniciar servidor Go
```

Você deve ver:
```
Server running on :8080
```

### 2. Verificar Backend

```bash
# Testar health check
curl http://localhost:8080/health

# Deve retornar:
# {"message":"Movix API is running","status":"ok"}
```

### 3. Iniciar o Frontend

```bash
# Terminal 2 - Frontend
cd frontend
npm run dev
```

Você deve ver:
```
- Local:        http://localhost:3000
```

### 4. Acessar as Páginas

Abra o navegador e acesse:

#### 📋 Clientes
**URL:** http://localhost:3000/cadastros/clientes

**O que testar:**
- ✅ Visualizar lista de clientes
- ✅ Ver estatísticas (Total, Ativos, Inativos, Premium)
- ✅ Clicar em "Novo Cliente" para abrir o drawer
- ✅ Preencher formulário e criar cliente
- ✅ Clicar nos 3 pontos (⋮) para editar
- ✅ Editar cliente existente
- ✅ Deletar cliente (com confirmação)
- ✅ Clicar em "Atualizar" para recarregar dados

#### 📦 Produtos
**URL:** http://localhost:3000/cadastros/produtos

**O que testar:**
- ✅ Visualizar lista de produtos
- ✅ Ver estatísticas (Total, Ativos, Estoque Baixo, Valor Total)
- ✅ Clicar em "Novo Produto" para abrir o drawer
- ✅ Preencher formulário e criar produto
- ✅ Editar produto existente
- ✅ Deletar produto
- ✅ Verificar cálculo de valor total do estoque

## 🎯 Funcionalidades Implementadas

### CRUD Completo de Clientes ✅

**Criar:**
1. Clique em "Novo Cliente"
2. Preencha os campos obrigatórios:
   - Nome
   - Email
   - Telefone
   - CPF
3. Preencha campos opcionais (endereço, cidade, etc.)
4. Selecione Categoria (Premium, Gold, Silver, Bronze)
5. Selecione Status (Ativo, Inativo, Pendente)
6. Clique em "Cadastrar"

**Editar:**
1. Clique nos 3 pontos (⋮) na linha do cliente
2. Clique em "Editar"
3. Modifique os campos desejados
4. Clique em "Atualizar"

**Deletar:**
1. Clique nos 3 pontos (⋮) na linha do cliente
2. Clique em "Excluir"
3. Confirme a exclusão

### CRUD Completo de Produtos ✅

**Criar:**
1. Clique em "Novo Produto"
2. Preencha os campos obrigatórios:
   - Nome
   - Categoria
   - Preço de Venda
3. Preencha campos opcionais:
   - Marca
   - Unidade
   - Código de Barras
   - Preço de Custo
   - Estoque Inicial
   - Estoque Mínimo
   - NCM
   - Descrição
   - Observações
4. Selecione Status
5. Clique em "Cadastrar"

**Editar:**
1. Clique nos 3 pontos (⋮) na linha do produto
2. Clique em "Editar"
3. Modifique os campos (exceto estoque inicial)
4. Clique em "Atualizar"

**Deletar:**
1. Clique nos 3 pontos (⋮) na linha do produto
2. Clique em "Excluir"
3. Confirme a exclusão

## 🔍 Verificar Integração

### No DevTools do Navegador

1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Filtre por **Fetch/XHR**
4. Recarregue a página

Você deve ver requisições para:
- `http://localhost:8080/api/v1/clientes`
- `http://localhost:8080/api/v1/clientes/stats`
- `http://localhost:8080/api/v1/produtos`
- `http://localhost:8080/api/v1/produtos/stats`

### Verificar Dados no Backend

```bash
# Listar clientes
curl http://localhost:8080/api/v1/clientes | jq

# Ver estatísticas de clientes
curl http://localhost:8080/api/v1/clientes/stats | jq

# Listar produtos
curl http://localhost:8080/api/v1/produtos | jq

# Ver estatísticas de produtos
curl http://localhost:8080/api/v1/produtos/stats | jq
```

## 🐛 Troubleshooting

### Erro: "Failed to load resource: 404"

**Problema:** Backend não está rodando ou URL incorreta

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:8080/health

# Se não estiver, iniciar:
cd backend && make run
```

### Erro: "CORS policy"

**Problema:** CORS não configurado no backend

**Solução:** Verificar se o middleware CORS está habilitado no backend

### Dados não aparecem

**Problema:** Banco de dados vazio

**Solução:** Criar dados de teste via API:
```bash
# Criar cliente de teste
curl -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "cpf": "123.456.789-00",
    "categoria": "Premium",
    "status": "Ativo"
  }'

# Criar produto de teste
curl -X POST http://localhost:8080/api/v1/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Dell",
    "categoria": "Informática",
    "marca": "Dell",
    "preco": 3499.90,
    "estoque": 10,
    "estoqueMinimo": 5,
    "status": "Ativo"
  }'
```

### Frontend não conecta ao Backend

**Problema:** Variável de ambiente não configurada

**Solução:**
```bash
# Verificar se existe .env.local
cat frontend/.env.local

# Se não existir, criar:
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > frontend/.env.local

# Reiniciar o frontend
cd frontend && npm run dev
```

## ✨ Recursos Implementados

### UI/UX
- ✅ Drawer responsivo para formulários
- ✅ Loading states (spinners)
- ✅ Error states (mensagens de erro)
- ✅ Empty states (quando não há dados)
- ✅ Confirmação antes de deletar
- ✅ Feedback visual ao salvar

### Validação
- ✅ Validação de formulário com Zod
- ✅ Mensagens de erro em português
- ✅ Campos obrigatórios marcados com *
- ✅ Validação de email
- ✅ Validação de números

### Performance
- ✅ Auto-fetch ao carregar página
- ✅ Refresh manual com botão
- ✅ Estados de loading otimizados
- ✅ Hooks customizados reutilizáveis

## 📊 Dados de Teste

O backend já vem com alguns dados de exemplo:

### Clientes
- Carlos Eduardo Silva (Premium)

### Produtos
- Notebook Dell (Informática)

### Fornecedores
- Dell Brasil Ltda (Fabricante)

### Usuários
- Admin (admin)
- Gerente (gerente)

## 🎉 Próximos Passos

Após testar a integração básica:

1. ✅ Completar CRUD de Fornecedores
2. ✅ Completar CRUD de Usuários
3. ⏳ Adicionar paginação
4. ⏳ Adicionar filtros avançados
5. ⏳ Adicionar busca em tempo real
6. ⏳ Implementar autenticação
7. ⏳ Adicionar upload de imagens

---

**Desenvolvido para Movix ERP** 🚀

