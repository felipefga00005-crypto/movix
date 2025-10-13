# Movix Backend API

Backend da aplicação Movix desenvolvido em Go com Gin Framework e GORM.

## 🚀 Tecnologias

- **Go 1.21+**
- **Gin** - Framework HTTP
- **GORM** - ORM para Go
- **PostgreSQL** - Banco de dados
- **Docker** - Containerização

## 📁 Estrutura do Projeto

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Entry point da aplicação
├── internal/
│   ├── config/
│   │   └── config.go         # Configurações da aplicação
│   ├── database/
│   │   └── postgres.go       # Conexão com PostgreSQL
│   ├── models/
│   │   └── user.go           # Models GORM
│   ├── handlers/
│   │   └── user_handler.go   # Handlers HTTP
│   ├── services/
│   │   └── user_service.go   # Lógica de negócio
│   └── middleware/
│       └── cors.go           # Middlewares
├── .env                      # Variáveis de ambiente
├── docker-compose.yml        # Docker Compose para PostgreSQL
├── go.mod                    # Dependências Go
└── Makefile                  # Comandos úteis
```

## 🛠️ Instalação

### Pré-requisitos

- Go 1.21 ou superior
- Docker e Docker Compose
- Make (opcional)

### Passo a Passo

1. **Clone o repositório**
```bash
cd backend
```

2. **Instale as dependências**
```bash
make install
# ou
go mod download
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env conforme necessário
```

4. **Suba o PostgreSQL e DbGate com Docker**
```bash
make docker-up
# ou
docker-compose up -d
```

5. **Execute o servidor**
```bash
make run
# ou
go run cmd/server/main.go
```

O servidor estará rodando em `http://localhost:8080`

## 🗄️ Administração do Banco de Dados

O projeto inclui o **DbGate** como ferramenta de administração do banco de dados:

- **URL**: http://localhost:3001
- **Usuário**: postgres
- **Senha**: postgres
- **Banco**: movix

O DbGate oferece:
- Interface web moderna para administração do PostgreSQL
- Editor SQL com syntax highlighting
- Visualização de dados em tabelas
- Geração de queries automáticas
- Import/Export de dados
- Visualização de esquemas e relacionamentos

## 📚 API Endpoints

### Health Check
```
GET /health
```

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/usuarios` | Lista todos os usuários |
| GET | `/api/v1/usuarios/:id` | Busca usuário por ID |
| POST | `/api/v1/usuarios` | Cria novo usuário |
| PUT | `/api/v1/usuarios/:id` | Atualiza usuário |
| DELETE | `/api/v1/usuarios/:id` | Deleta usuário |
| PUT | `/api/v1/usuarios/:id/senha` | Altera senha |
| GET | `/api/v1/usuarios/status?status=Ativo` | Lista por status |
| GET | `/api/v1/usuarios/perfil?perfil=admin` | Lista por perfil |
| GET | `/api/v1/usuarios/search?q=nome` | Busca por nome/email |
| GET | `/api/v1/usuarios/stats` | Estatísticas |

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/clientes` | Lista todos os clientes |
| GET | `/api/v1/clientes/:id` | Busca cliente por ID |
| POST | `/api/v1/clientes` | Cria novo cliente |
| PUT | `/api/v1/clientes/:id` | Atualiza cliente |
| DELETE | `/api/v1/clientes/:id` | Deleta cliente |
| GET | `/api/v1/clientes/status?status=Ativo` | Lista por status |
| GET | `/api/v1/clientes/categoria?categoria=Premium` | Lista por categoria |
| GET | `/api/v1/clientes/search?q=nome` | Busca por nome/email/CPF |
| GET | `/api/v1/clientes/stats` | Estatísticas |

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/produtos` | Lista todos os produtos |
| GET | `/api/v1/produtos/:id` | Busca produto por ID |
| POST | `/api/v1/produtos` | Cria novo produto |
| PUT | `/api/v1/produtos/:id` | Atualiza produto |
| DELETE | `/api/v1/produtos/:id` | Deleta produto |
| PUT | `/api/v1/produtos/:id/estoque` | Atualiza estoque |
| GET | `/api/v1/produtos/status?status=Ativo` | Lista por status |
| GET | `/api/v1/produtos/categoria?categoria=Informática` | Lista por categoria |
| GET | `/api/v1/produtos/estoque-baixo` | Lista produtos com estoque baixo |
| GET | `/api/v1/produtos/search?q=nome` | Busca por nome/código/marca |
| GET | `/api/v1/produtos/stats` | Estatísticas |

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/fornecedores` | Lista todos os fornecedores |
| GET | `/api/v1/fornecedores/:id` | Busca fornecedor por ID |
| POST | `/api/v1/fornecedores` | Cria novo fornecedor |
| PUT | `/api/v1/fornecedores/:id` | Atualiza fornecedor |
| DELETE | `/api/v1/fornecedores/:id` | Deleta fornecedor |
| GET | `/api/v1/fornecedores/status?status=Ativo` | Lista por status |
| GET | `/api/v1/fornecedores/categoria?categoria=Fabricante` | Lista por categoria |
| GET | `/api/v1/fornecedores/search?q=nome` | Busca por razão social/CNPJ |
| GET | `/api/v1/fornecedores/stats` | Estatísticas |

### Exemplos de Requisições

**Criar Usuário**
```bash
curl -X POST http://localhost:8080/api/v1/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@movix.com",
    "senha": "senha123",
    "telefone": "(11) 99999-1111",
    "cargo": "Administrador",
    "departamento": "TI",
    "perfil": "admin",
    "status": "Ativo"
  }'
```

**Listar Usuários**
```bash
curl http://localhost:8080/api/v1/usuarios
```

**Buscar por ID**
```bash
curl http://localhost:8080/api/v1/usuarios/1
```

**Atualizar Usuário**
```bash
curl -X PUT http://localhost:8080/api/v1/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Santos",
    "telefone": "(11) 98888-2222"
  }'
```

**Alterar Senha**
```bash
curl -X PUT http://localhost:8080/api/v1/usuarios/1/senha \
  -H "Content-Type: application/json" \
  -d '{
    "senhaAtual": "senha123",
    "senhaNova": "novaSenha456"
  }'
```

**Buscar por Status**
```bash
curl http://localhost:8080/api/v1/usuarios/status?status=Ativo
```

**Estatísticas**
```bash
curl http://localhost:8080/api/v1/usuarios/stats
```

## 🗄️ Modelo de Dados

### User (Usuário)

```go
type User struct {
    ID              uint       // ID único
    Codigo          string     // Código do usuário (ex: USR001)
    Nome            string     // Nome completo
    Email           string     // Email (único)
    Senha           string     // Senha (hasheada)
    Telefone        string     // Telefone
    Cargo           string     // Cargo
    Departamento    string     // Departamento
    Perfil          string     // admin, gerente, vendedor, etc
    Status          string     // Ativo, Inativo, Pendente
    Avatar          string     // URL do avatar
    UltimoAcesso    *time.Time // Último acesso
    DataCadastro    time.Time  // Data de cadastro
    DataAtualizacao time.Time  // Data de atualização
    DeletedAt       time.Time  // Soft delete
}
```

## 🔧 Comandos Make

```bash
make help          # Mostra todos os comandos disponíveis
make install       # Instala dependências
make run           # Executa o servidor
make build         # Compila o projeto
make test          # Executa testes
make clean         # Limpa arquivos compilados
make docker-up     # Sobe PostgreSQL
make docker-down   # Para PostgreSQL
make docker-logs   # Mostra logs do PostgreSQL
```

## 🐳 Docker

O projeto inclui um `docker-compose.yml` com PostgreSQL e DbGate:

### Serviços Disponíveis

- **PostgreSQL**: Banco de dados principal (porta 5432)
- **DbGate**: Interface de administração do banco (porta 3001)

### Comandos Docker

```bash
# Subir todos os serviços (PostgreSQL + DbGate)
docker-compose up -d

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do PostgreSQL
docker-compose logs -f postgres

# Ver logs apenas do DbGate
docker-compose logs -f dbgate

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v

# Verificar status dos serviços
docker-compose ps
```

### Acessos

- **API Backend**: http://localhost:8080
- **DbGate (Admin DB)**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- CORS configurado
- Soft delete para usuários
- Validação de dados com Gin binding

## 📝 Notas

- O GORM faz auto-migration automaticamente ao iniciar o servidor
- Não é necessário escrever SQL, o GORM cuida de tudo
- Os hooks `BeforeCreate` e `BeforeUpdate` fazem o hash automático das senhas
- O código do usuário é gerado automaticamente se não fornecido

## 🚧 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar mais models (Produtos, Clientes, Fornecedores)
- [ ] Implementar testes unitários
- [ ] Adicionar paginação
- [ ] Implementar upload de avatar
- [ ] Adicionar logs estruturados
- [ ] Implementar rate limiting

