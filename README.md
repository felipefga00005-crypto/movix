# Sistema ERP/PVD - Movix

Sistema completo de gestão empresarial com ponto de venda, emissão fiscal e controle financeiro.

## 🚀 Funcionalidades Principais

### 📊 Módulo PDV (Ponto de Venda)
- Interface touch-friendly para vendas
- Gestão de carrinho de compras
- Múltiplas formas de pagamento
- Impressão de cupons fiscais
- Controle de operadores

### 📋 Módulo Fiscal
- **NF-e** - Nota Fiscal Eletrônica
- **NFC-e** - Nota Fiscal de Consumidor Eletrônica
- **CT-e** - Conhecimento de Transporte Eletrônico
- **MDF-e** - Manifesto Eletrônico de Documentos Fiscais
- Integração com SEFAZ
- Gestão de certificados digitais

### 📦 Módulo de Estoque
- Controle de entrada e saída
- Gestão de produtos e categorias
- Inventário e contagem
- Relatórios de movimentação
- Controle de lotes e validade

### 💰 Módulo Financeiro
- Contas a pagar e receber
- Fluxo de caixa
- Conciliação bancária
- Relatórios financeiros
- Gestão de centros de custo

### 👥 Módulo de Cadastros
- Clientes e fornecedores
- Produtos e serviços
- Usuários e permissões
- Configurações do sistema

### 📈 Relatórios e Dashboard
- Dashboard executivo
- Relatórios gerenciais
- Métricas de vendas
- Análises financeiras

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **Radix UI** - Componentes acessíveis
- **Recharts** - Gráficos e visualizações
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma** - ORM e banco de dados
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **JWT** - Autenticação

### Integrações
- **SEFAZ** - Emissão fiscal
- **Bancos** - Conciliação bancária
- **Correios** - Cálculo de frete
- **Gateways de Pagamento** - PIX, cartões

## 📁 Estrutura do Projeto

```
movix/
├── frontend/                 # Aplicação React/Next.js
│   ├── app/                 # Páginas (App Router)
│   │   ├── pdv/            # Módulo PDV
│   │   ├── fiscal/         # Módulo Fiscal
│   │   ├── estoque/        # Módulo Estoque
│   │   ├── financeiro/     # Módulo Financeiro
│   │   ├── cadastros/      # Módulo Cadastros
│   │   ├── relatorios/     # Relatórios
│   │   └── configuracoes/  # Configurações
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes base
│   │   ├── shared/        # Componentes compartilhados
│   │   └── [modulo]/      # Componentes por módulo
│   ├── lib/               # Utilitários e configurações
│   ├── types/             # Tipos TypeScript
│   └── hooks/             # Custom hooks
├── backend/                # API Node.js
│   ├── src/
│   │   ├── controllers/   # Controladores
│   │   ├── services/      # Lógica de negócio
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Rotas da API
│   │   └── middleware/    # Middlewares
│   └── tests/             # Testes
├── database/              # Banco de dados
│   ├── migrations/        # Migrações
│   ├── seeds/            # Dados iniciais
│   └── schemas/          # Esquemas
└── docs/                 # Documentação
```

## 🚦 Roadmap de Desenvolvimento

### Fase 1 - Fundação (4 semanas)
- [x] Estruturação do projeto
- [ ] Configuração do backend
- [ ] Sistema de autenticação
- [ ] Módulo de cadastros básicos

### Fase 2 - Core Business (6 semanas)
- [ ] Módulo PDV completo
- [ ] Gestão de estoque
- [ ] Emissão de NFC-e

### Fase 3 - Fiscal Avançado (4 semanas)
- [ ] Emissão de NF-e
- [ ] CT-e e MDF-e
- [ ] Integração SEFAZ

### Fase 4 - Financeiro (4 semanas)
- [ ] Contas a pagar/receber
- [ ] Fluxo de caixa
- [ ] Relatórios financeiros

### Fase 5 - Analytics (2 semanas)
- [ ] Dashboard executivo
- [ ] Relatórios avançados
- [ ] Métricas de performance

## 🔧 Instalação e Desenvolvimento

```bash
# Clone o repositório
git clone [url-do-repo]
cd movix

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd ../backend
npm install
npm run dev
```

## 📝 Licença

Este projeto está sob licença MIT.
