# Movix - Sistema de Emissão de NFe

Sistema multi-tenant para emissão de Nota Fiscal Eletrônica (NFe) com hierarquia de usuários.

## 🚀 Stack Tecnológica

- **Go 1.21+**
- **Gin** - Framework web
- **GORM** - ORM
- **PostgreSQL 15+** - Banco de dados
- **Redis** - Cache e rate limiting
- **JWT** - Autenticação
- **Docker** - Containerização

## 📋 Pré-requisitos

- Go 1.21 ou superior
- Docker e Docker Compose
- Make (opcional, mas recomendado)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/movix.git
cd movix/backend
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Instale o golang-migrate

```bash
make migrate-install
```

### 4. Inicie os containers Docker

```bash
make docker-up
```

### 5. Execute as migrations

```bash
make migrate-up
```

### 6. Inicie a aplicação

```bash
make run
```

A API estará disponível em `http://localhost:8080`

## 📝 Comandos Make Disponíveis

```bash
make help              # Mostra todos os comandos disponíveis
make run               # Executa a aplicação
make build             # Compila a aplicação
make test              # Executa os testes
make test-coverage     # Executa os testes com relatório de cobertura
make clean             # Limpa arquivos de build
make docker-up         # Inicia os containers Docker
make docker-down       # Para os containers Docker
make docker-logs       # Mostra os logs dos containers
make migrate-up        # Executa as migrations
make migrate-down      # Reverte a última migration
make migrate-create    # Cria uma nova migration
make tidy              # Organiza as dependências Go
make fmt               # Formata o código
make dev               # Inicia ambiente de desenvolvimento
make setup             # Setup inicial completo
```

## 🏗️ Estrutura do Projeto

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Entry point da aplicação
├── internal/
│   ├── config/                  # Configurações
│   ├── database/                # Conexão e migrations
│   ├── models/                  # Models do banco de dados
│   ├── repositories/            # Camada de acesso a dados
│   ├── services/                # Lógica de negócio
│   ├── handlers/                # Handlers HTTP
│   ├── middleware/              # Middlewares
│   ├── router/                  # Configuração de rotas
│   └── validators/              # Validadores
├── pkg/                         # Pacotes reutilizáveis
│   ├── jwt/                     # Utilitários JWT
│   ├── crypto/                  # Criptografia
│   ├── response/                # Respostas padronizadas
│   └── errors/                  # Erros customizados
├── docker-compose.yml
├── Makefile
├── .env.example
└── README.md
```

## 🔐 Hierarquia de Usuários

```
SuperAdmin (role: superadmin)
    └── Account (Escritório de Contabilidade)
        ├── Admin (role: admin) - Gerente do Escritório
        └── Companies (CNPJs dos Clientes)
            └── User (role: user) - Cliente
```

## 📚 Documentação da API

A documentação completa da API estará disponível em `/api/docs` após a implementação do Swagger.

## 🧪 Testes

```bash
# Executar todos os testes
make test

# Executar testes com cobertura
make test-coverage
```

## 🐳 Docker

### Serviços disponíveis:

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **DbGate**: `http://localhost:3000`
  - Interface web moderna para administração do banco de dados
  - Conexão pré-configurada com PostgreSQL

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@movix.com

