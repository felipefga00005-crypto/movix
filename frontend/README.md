# Movix Frontend

Sistema de emissão de Nota Fiscal Eletrônica (NFe) - Interface Web

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **TanStack Table** - Tabelas de dados
- **Tabler Icons** - Ícones
- **Sonner** - Notificações toast
- **jwt-decode** - Decodificação de JWT
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend Movix rodando (padrão: http://localhost:8080)

## 🔧 Instalação

1. Clone o repositório e navegue até a pasta frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🏃 Executando

### Modo Desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

### Build para Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   │   └── login/                # Página de login
│   └── (dashboard)/              # Rotas do dashboard
│       ├── dashboard/            # Dashboard principal
│       ├── nfes/                 # Gestão de NFes
│       ├── clientes/             # Gestão de clientes
│       ├── produtos/             # Gestão de produtos
│       ├── transportadoras/      # Gestão de transportadoras
│       ├── admin/                # Área administrativa
│       │   ├── companies/        # Gestão de empresas
│       │   └── users/            # Gestão de usuários
│       └── superadmin/           # Área super admin
│           └── accounts/         # Gestão de contas
│
├── components/
│   ├── auth/                     # Componentes de autenticação
│   ├── dashboard/                # Componentes do dashboard
│   ├── layout/                   # Componentes de layout
│   │   ├── app-sidebar.tsx       # Sidebar principal
│   │   ├── nav-main.tsx          # Navegação principal
│   │   ├── nav-user.tsx          # Menu do usuário
│   │   └── nav-secondary.tsx     # Navegação secundária
│   ├── shared/                   # Componentes compartilhados
│   │   └── data-table.tsx        # Tabela de dados reutilizável
│   └── ui/                       # Componentes UI (shadcn/ui)
│
├── contexts/
│   └── auth-context.tsx          # Contexto de autenticação
│
├── lib/
│   ├── services/                 # Serviços de API
│   │   ├── api.service.ts        # Cliente HTTP genérico
│   │   ├── auth.service.ts       # Serviço de autenticação
│   │   ├── account.service.ts    # Serviço de contas
│   │   ├── company.service.ts    # Serviço de empresas
│   │   ├── user.service.ts       # Serviço de usuários
│   │   ├── nfe.service.ts        # Serviço de NFes
│   │   ├── customer.service.ts   # Serviço de clientes
│   │   ├── product.service.ts    # Serviço de produtos
│   │   ├── carrier.service.ts    # Serviço de transportadoras
│   │   └── certificate.service.ts # Serviço de certificados
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   └── utils.ts                  # Utilitários
│
└── hooks/                        # Custom hooks
    └── use-mobile.ts
```

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Refresh token automático
- ✅ Proteção de rotas
- ✅ Gerenciamento de sessão

### Gestão de NFes
- ✅ Listagem com paginação
- ✅ Criação de rascunho
- ✅ Autorização
- ✅ Cancelamento
- ✅ Download de XML

### Gestão de Cadastros
- ✅ Clientes (CRUD completo)
- ✅ Produtos (CRUD completo)
- ✅ Transportadoras (CRUD completo)

### Área Administrativa (Admin)
- ✅ Gestão de empresas
- ✅ Gestão de usuários
- ✅ Gestão de certificados digitais

### Área SuperAdmin
- ✅ Gestão de contas
- ✅ Controle de limites
- ✅ Controle de status

## 🔐 Controle de Acesso

### Perfis de Usuário

1. **SuperAdmin**
   - Acesso total ao sistema
   - Gestão de contas
   - Gestão de empresas e usuários
   - Todas as funcionalidades operacionais

2. **Admin**
   - Gestão de empresas da sua conta
   - Gestão de usuários da sua conta
   - Gestão de certificados
   - Todas as funcionalidades operacionais

3. **User**
   - Gestão de NFes
   - Gestão de clientes
   - Gestão de produtos
   - Gestão de transportadoras

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

## 📝 Próximos Passos

- [ ] Formulários de criação/edição
- [ ] Dashboard com estatísticas
- [ ] Relatórios
- [ ] Exportação de dados
- [ ] Testes unitários
- [ ] Testes E2E

## 📄 Licença

Este projeto é privado e proprietário.
