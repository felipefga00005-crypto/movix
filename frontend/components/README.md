# 📁 Estrutura de Componentes - Movix Frontend

Esta documentação descreve a organização dos componentes do projeto Movix.

## 🗂️ Estrutura de Pastas

```
components/
├── auth/                    # Componentes de autenticação
├── layout/                  # Componentes de layout e navegação
├── dashboard/               # Componentes específicos do dashboard
├── shared/                  # Componentes compartilhados
├── cadastros/              # Componentes de cadastros (CRUD)
└── ui/                     # Componentes base do shadcn/ui
```

---

## 📦 Detalhamento das Pastas

### 🔐 `auth/` - Autenticação

Componentes relacionados ao fluxo de autenticação do usuário.

**Arquivos:**
- `login-form.tsx` - Formulário de login
- `register-form.tsx` - Formulário de registro
- `forgot-password-form.tsx` - Formulário de recuperação de senha
- `reset-password-form.tsx` - Formulário de redefinição de senha
- `index.ts` - Barrel export

**Uso:**
```tsx
import { LoginForm, RegisterForm } from "@/components/auth";
```

**Características:**
- ✅ Validação com React Hook Form + Zod
- ✅ Feedback visual com Sonner toast
- ✅ Loading states com spinners
- ✅ Mostrar/ocultar senha
- ✅ Indicador de força de senha

---

### 🎨 `layout/` - Layout e Navegação

Componentes de estrutura da aplicação, navegação e layout.

**Arquivos:**
- `app-sidebar.tsx` - Sidebar principal da aplicação
- `nav-main.tsx` - Navegação principal
- `nav-secondary.tsx` - Navegação secundária
- `nav-documents.tsx` - Navegação de documentos
- `nav-user.tsx` - Menu do usuário
- `site-header.tsx` - Cabeçalho do site
- `index.ts` - Barrel export

**Uso:**
```tsx
import { AppSidebar, SiteHeader, NavUser } from "@/components/layout";
```

**Características:**
- ✅ Sidebar responsiva
- ✅ Navegação hierárquica
- ✅ Menu de usuário com dropdown
- ✅ Breadcrumbs

---

### 📊 `dashboard/` - Dashboard

Componentes específicos da página de dashboard.

**Arquivos:**
- `section-cards.tsx` - Cards de seção do dashboard
- `chart-area-interactive.tsx` - Gráfico de área interativo
- `backend-status.tsx` - Status do backend
- `index.ts` - Barrel export

**Uso:**
```tsx
import { SectionCards, ChartAreaInteractive, BackendStatus } from "@/components/dashboard";
```

**Características:**
- ✅ Gráficos com Recharts
- ✅ Cards informativos
- ✅ Indicadores de status

---

### 🔄 `shared/` - Compartilhados

Componentes reutilizáveis em diferentes partes da aplicação.

**Arquivos:**
- `data-table.tsx` - Tabela de dados genérica
- `mode-toggle.tsx` - Toggle de tema claro/escuro
- `theme-provider.tsx` - Provider de tema
- `index.ts` - Barrel export

**Uso:**
```tsx
import { DataTable, ModeToggle, ThemeProvider } from "@/components/shared";
```

**Características:**
- ✅ Componentes genéricos
- ✅ Altamente reutilizáveis
- ✅ Sem dependências de domínio

---

### 📝 `cadastros/` - Cadastros (CRUD)

Componentes de cadastro organizados por entidade.

**Estrutura:**
```
cadastros/
├── clientes/
│   ├── cliente-form-dialog.tsx
│   ├── cliente-form.tsx
│   └── clientes-table.tsx
├── fornecedores/
│   └── fornecedores-table.tsx
└── produtos/
    └── produtos-table.tsx
```

**Uso:**
```tsx
import { ClienteFormDialog } from "@/components/cadastros/clientes/cliente-form-dialog";
import { FornecedoresTable } from "@/components/cadastros/fornecedores/fornecedores-table";
```

**Características:**
- ✅ Organização por entidade
- ✅ Formulários com validação
- ✅ Tabelas com paginação
- ✅ Dialogs para edição

---

### 🎯 `ui/` - Componentes Base (shadcn/ui)

Componentes primitivos do shadcn/ui.

**Arquivos principais:**
- `button.tsx` - Botão
- `input.tsx` - Campo de entrada
- `form.tsx` - Formulário (React Hook Form)
- `dialog.tsx` - Modal/Dialog
- `table.tsx` - Tabela
- `card.tsx` - Card
- `checkbox.tsx` - Checkbox
- `select.tsx` - Select/Dropdown
- E muitos outros...

**Uso:**
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem } from "@/components/ui/form";
```

**Características:**
- ✅ Baseado em Radix UI
- ✅ Totalmente acessível
- ✅ Customizável com Tailwind CSS
- ✅ TypeScript

---

## 🎯 Boas Práticas

### 1. **Barrel Exports**
Cada pasta possui um `index.ts` para facilitar importações:

```tsx
// ❌ Evite
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";

// ✅ Prefira
import { LoginForm, RegisterForm } from "@/components/auth";
```

### 2. **Organização por Funcionalidade**
Componentes são agrupados por funcionalidade, não por tipo:

```
✅ Correto:
components/auth/login-form.tsx
components/auth/register-form.tsx

❌ Incorreto:
components/forms/login-form.tsx
components/forms/register-form.tsx
```

### 3. **Componentes Específicos vs Genéricos**
- **Específicos**: `auth/`, `dashboard/`, `cadastros/`
- **Genéricos**: `shared/`, `ui/`

### 4. **Nomenclatura**
- Componentes: PascalCase (`LoginForm.tsx`)
- Arquivos: kebab-case (`login-form.tsx`)
- Pastas: kebab-case (`forgot-password/`)

---

## 🔄 Migração de Componentes Antigos

Se você encontrar importações antigas, atualize conforme a tabela:

| Antigo | Novo |
|--------|------|
| `@/components/login-form` | `@/components/auth` |
| `@/components/app-sidebar` | `@/components/layout` |
| `@/components/section-cards` | `@/components/dashboard` |
| `@/components/data-table` | `@/components/shared` |
| `@/components/theme-provider` | `@/components/shared` |

---

## 📚 Referências

- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Última atualização:** 2025-10-14

