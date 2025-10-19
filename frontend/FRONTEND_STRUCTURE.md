# Estrutura do Frontend - Movix

## 📁 Estrutura de Diretórios

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   │   └── login/
│   └── (dashboard)/              # Rotas do dashboard
│       └── dashboard/
│           ├── nfes/             # Gestão de NFes
│           ├── clientes/         # Gestão de clientes
│           ├── produtos/         # Gestão de produtos
│           ├── transportadoras/  # Gestão de transportadoras
│           ├── admin/            # Área administrativa
│           │   ├── companies/    # Gestão de empresas
│           │   └── users/        # Gestão de usuários
│           └── superadmin/       # Área super admin
│               └── accounts/     # Gestão de contas
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

## 🎯 Funcionalidades Implementadas

### 1. **Autenticação**
- ✅ Login com email e senha
- ✅ Refresh token automático
- ✅ Proteção de rotas
- ✅ Contexto de autenticação global
- ✅ Gerenciamento de tokens via cookies

### 2. **Gestão de NFes**
- ✅ Listagem de NFes com paginação
- ✅ Criação de NFe (rascunho)
- ✅ Autorização de NFe
- ✅ Cancelamento de NFe
- ✅ Download de XML
- ✅ Filtros por status

### 3. **Gestão de Clientes**
- ✅ Listagem de clientes
- ✅ Criação de cliente
- ✅ Edição de cliente
- ✅ Exclusão de cliente
- ✅ Busca por nome

### 4. **Gestão de Produtos**
- ✅ Listagem de produtos
- ✅ Criação de produto
- ✅ Edição de produto
- ✅ Exclusão de produto
- ✅ Controle de estoque
- ✅ Busca por nome

### 5. **Gestão de Transportadoras**
- ✅ Listagem de transportadoras
- ✅ Criação de transportadora
- ✅ Edição de transportadora
- ✅ Exclusão de transportadora
- ✅ Busca por nome

### 6. **Área Administrativa (Admin)**
- ✅ Gestão de empresas
- ✅ Gestão de usuários
- ✅ Gestão de certificados digitais
- ✅ Controle de status (ativo/inativo)
- ✅ Vinculação de usuários a empresas

### 7. **Área SuperAdmin**
- ✅ Gestão de contas
- ✅ Controle de limites (empresas, usuários, NFes)
- ✅ Controle de status (ativo/suspenso/cancelado)
- ✅ Criação de conta com primeiro admin

## 🔐 Controle de Acesso

### Níveis de Permissão

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

## 📊 Componentes Principais

### DataTable
Componente reutilizável para exibição de dados tabulares com:
- Paginação
- Ordenação
- Filtros
- Busca
- Ações personalizadas

### Sidebar
Navegação lateral dinâmica baseada no perfil do usuário:
- Menu adaptativo por role
- Indicador de página ativa
- Informações do usuário
- Logout

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **TanStack Table** - Tabelas de dados
- **Tabler Icons** - Ícones
- **Sonner** - Notificações toast
- **jwt-decode** - Decodificação de JWT
- **Zod** - Validação de schemas

## 🔄 Fluxo de Dados

```
Componente → Service → API Client → Backend
                ↓
            Auth Context
                ↓
          Token Management
                ↓
        Automatic Refresh
```

## 📝 Próximos Passos

### Páginas de Formulário
- [ ] Formulário de criação/edição de NFe
- [ ] Formulário de criação/edição de cliente
- [ ] Formulário de criação/edição de produto
- [ ] Formulário de criação/edição de transportadora
- [ ] Formulário de criação/edição de empresa
- [ ] Formulário de criação/edição de usuário
- [ ] Formulário de criação/edição de conta

### Funcionalidades Adicionais
- [ ] Dashboard com estatísticas
- [ ] Relatórios
- [ ] Exportação de dados
- [ ] Importação em lote
- [ ] Histórico de alterações
- [ ] Notificações em tempo real
- [ ] Tema escuro/claro
- [ ] Configurações de usuário

### Melhorias
- [ ] Validação de formulários com Zod
- [ ] Loading states
- [ ] Error boundaries
- [ ] Testes unitários
- [ ] Testes E2E
- [ ] Documentação de componentes
- [ ] Storybook

## 🚀 Como Executar

```bash
# Instalar dependências
cd frontend
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar NEXT_PUBLIC_API_URL

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🌐 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📱 Responsividade

Todas as páginas são responsivas e funcionam em:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🎨 Design System

O projeto utiliza o design system do shadcn/ui com customizações:
- Cores primárias e secundárias
- Tipografia consistente
- Espaçamentos padronizados
- Componentes acessíveis (ARIA)

