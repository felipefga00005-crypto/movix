# 📋 ESTRUTURA PADRÃO DOS CADASTROS

## 🏗️ Arquitetura Base

Cada cadastro segue a mesma estrutura arquitetural baseada no padrão do cadastro de clientes:

### 📁 Estrutura de Arquivos por Entidade

```
📁 /app/cadastros/[entidade]/
├── 📄 page.tsx                           # Página principal com listagem
├── 📁 [id]/
│   └── 📄 page.tsx                      # Página de detalhes com tabs

📁 /components/cadastros/[entidade]/
├── 📄 [entidade]-form-dialog.tsx         # Modal de formulário (criar/editar)
├── 📄 [entidade]-data-table.tsx          # Tabela com paginação e filtros
├── 📄 [entidade]-filters.tsx             # Componente de filtros
├── 📄 [entidade]-section-cards.tsx       # Cards de estatísticas
└── 📄 [entidade]-table-actions.tsx       # Ações da tabela (editar, excluir, etc.)

📁 /hooks/cadastros/
├── 📄 use-[entidade].ts                  # Hook principal (CRUD operations)
└── 📄 use-[entidade]-form.ts             # Hook do formulário com validações

📁 /lib/api/
└── 📄 [entidade].ts                      # Service da API com operações CRUD

📁 /types/
└── 📄 index.ts                           # Types TypeScript (já existente)
```

## 🎯 Cadastros a Implementar

### 1. 🏢 Fornecedores
```
📁 /app/cadastros/fornecedores/
├── 📄 page.tsx
├── 📁 [id]/
│   └── 📄 page.tsx

📁 /components/cadastros/fornecedores/
├── 📄 fornecedor-form-dialog.tsx
├── 📄 fornecedores-data-table.tsx
├── 📄 fornecedores-filters.tsx
├── 📄 fornecedores-section-cards.tsx
└── 📄 fornecedores-table-actions.tsx

📁 /hooks/cadastros/
├── 📄 use-fornecedores.ts
└── 📄 use-fornecedor-form.ts

📁 /lib/api/
└── 📄 fornecedores.ts
```

### 2. 📦 Produtos
```
📁 /app/cadastros/produtos/
├── 📄 page.tsx
├── 📁 [id]/
│   └── 📄 page.tsx

📁 /components/cadastros/produtos/
├── 📄 produto-form-dialog.tsx
├── 📄 produtos-data-table.tsx
├── 📄 produtos-filters.tsx
├── 📄 produtos-section-cards.tsx
└── 📄 produtos-table-actions.tsx

📁 /hooks/cadastros/
├── 📄 use-produtos.ts
└── 📄 use-produto-form.ts

📁 /lib/api/
└── 📄 produtos.ts
```

### 3. 👥 Usuários (Melhorar Existente)
```
📁 /app/cadastros/usuarios/
├── 📄 page.tsx                          # ✅ Existe - Melhorar
├── 📁 [id]/
│   └── 📄 page.tsx                      # ❌ Criar

📁 /components/cadastros/usuarios/
├── 📄 usuario-form-dialog.tsx           # ❌ Criar
├── 📄 usuarios-data-table.tsx           # ✅ Existe - Melhorar
├── 📄 usuarios-filters.tsx              # ❌ Criar
├── 📄 usuarios-section-cards.tsx        # ❌ Criar
└── 📄 usuarios-table-actions.tsx        # ❌ Criar

📁 /hooks/cadastros/
├── 📄 use-usuarios.ts                   # ❌ Criar
└── 📄 use-usuario-form.ts               # ❌ Criar

📁 /lib/api/
└── 📄 usuarios.ts                       # ❌ Criar
```

### 4. 🏷️ Cadastros Auxiliares

#### Categorias, Marcas, Unidades, Grupos
- Seguem a mesma estrutura base
- Formulários mais simples
- Menos campos e validações

## 🔧 Componentes Base (Para Refatoração Futura)

```
📁 /components/base/
├── 📄 base-form-dialog.tsx              # Dialog base reutilizável
├── 📄 base-data-table.tsx               # DataTable base reutilizável
├── 📄 base-filters.tsx                  # Filtros base reutilizáveis
├── 📄 base-section-cards.tsx            # Cards base reutilizáveis
└── 📄 base-details-tabs.tsx             # Tabs de detalhes base

📁 /hooks/base/
├── 📄 use-generic-crud.ts               # Hook CRUD genérico
├── 📄 use-generic-form.ts               # Hook de formulário genérico
└── 📄 use-generic-filters.ts            # Hook de filtros genérico

📁 /lib/base/
└── 📄 base-api-service.ts               # Classe base para API services
```

## 📋 Padrões de Nomenclatura

### Arquivos
- **Páginas:** `page.tsx`
- **Componentes:** `[entidade]-[tipo].tsx` (ex: `cliente-form-dialog.tsx`)
- **Hooks:** `use-[entidade].ts` ou `use-[entidade]-[tipo].ts`
- **APIs:** `[entidade].ts` (ex: `clientes.ts`)

### Componentes
- **FormDialog:** `[Entidade]FormDialog` (ex: `ClienteFormDialog`)
- **DataTable:** `[Entidade]DataTable` (ex: `ClientesDataTable`)
- **Filters:** `[Entidade]Filters` (ex: `ClientesFilters`)
- **SectionCards:** `[Entidade]SectionCards` (ex: `ClientesSectionCards`)

### Hooks
- **Principal:** `use[Entidade]` (ex: `useClientes`)
- **Formulário:** `use[Entidade]Form` (ex: `useClienteForm`)

### APIs
- **Service:** `[entidade]Service` (ex: `clientesService`)
- **Funções:** `get[Entidade]`, `create[Entidade]`, etc.

## 🎯 Próximos Passos

1. **Validar Types** - Verificar se todos os tipos estão definidos
2. **Implementar Fornecedores** - Primeiro cadastro completo
3. **Implementar Produtos** - Segundo cadastro com complexidade maior
4. **Melhorar Usuários** - Atualizar cadastro existente
5. **Cadastros Auxiliares** - Implementar cadastros menores
6. **Refatoração** - Extrair componentes base reutilizáveis
