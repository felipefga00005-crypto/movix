# Sistema de Autenticação - Movix

## 📋 Visão Geral

Sistema completo de autenticação implementado com Next.js 14, React Context API e integração com backend Go.

## 🔐 Funcionalidades Implementadas

### Backend (Go)
- ✅ JWT Authentication com access e refresh tokens
- ✅ Middlewares de autenticação e autorização
- ✅ Proteção de rotas por role (superadmin, admin, user)
- ✅ Switch de company para usuários multi-empresa
- ✅ Endpoints de login, refresh e switch-company

### Frontend (Next.js)
- ✅ Middleware Next.js para proteção de rotas
- ✅ AuthContext para gerenciamento de estado global
- ✅ Serviço de autenticação (auth.service.ts)
- ✅ Componente de login funcional
- ✅ Proteção de rotas por role
- ✅ Auto-refresh de tokens
- ✅ Logout funcional

## 📁 Estrutura de Arquivos

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Layout para páginas de autenticação
│   │   └── login/
│   │       └── page.tsx        # Página de login
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard principal (todos os roles)
│   │   ├── admin/
│   │   │   └── page.tsx        # Dashboard do Admin
│   │   └── superadmin/
│   │       └── page.tsx        # Dashboard do SuperAdmin
│   └── layout.tsx              # Layout raiz com AuthProvider
├── components/
│   ├── auth/
│   │   └── protected-route.tsx # Componente de proteção de rotas
│   ├── login-form.tsx          # Formulário de login
│   └── layout/
│       └── nav-user.tsx        # Menu do usuário com logout
├── contexts/
│   └── auth-context.tsx        # Context de autenticação
├── lib/
│   ├── auth.ts                 # Funções auxiliares de auth (deprecated)
│   └── services/
│       └── auth.service.ts     # Serviço principal de autenticação
├── middleware.ts               # Middleware Next.js
├── .env.local                  # Variáveis de ambiente
└── .env.local.example          # Exemplo de variáveis de ambiente
```

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 4. Testar o Login

1. Acesse `http://localhost:3000`
2. Você será redirecionado para `/login`
3. Use as credenciais de teste (conforme seed do backend)
4. Após login bem-sucedido, será redirecionado para o dashboard apropriado

## 🔑 Fluxo de Autenticação

### Login
1. Usuário preenche email e senha
2. Frontend envia POST para `/api/v1/auth/login`
3. Backend valida credenciais e retorna tokens JWT
4. Frontend armazena tokens em cookies
5. Usuário é redirecionado para dashboard baseado em seu role

### Proteção de Rotas
1. Middleware Next.js verifica presença de token
2. Se não autenticado, redireciona para `/login`
3. Se autenticado, permite acesso
4. Componente `ProtectedRoute` valida role do usuário

### Refresh de Token
1. Antes de cada requisição, verifica se token está expirado
2. Se expirado, usa refresh token para obter novo access token
3. Se refresh falhar, faz logout automático

### Logout
1. Usuário clica em "Log out" no menu
2. Frontend limpa cookies de autenticação
3. Redireciona para `/login`

## 📝 Uso do AuthContext

```tsx
'use client'

import { useAuth } from '@/contexts/auth-context'

export function MyComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## 🛡️ Proteção de Rotas por Role

### Usando o Componente ProtectedRoute

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div>Admin content here</div>
    </ProtectedRoute>
  )
}
```

### Usando o Middleware

O middleware protege automaticamente:
- `/dashboard/*` - Requer autenticação
- `/login` - Redireciona para dashboard se já autenticado
- `/` - Redireciona para login ou dashboard baseado em autenticação

## 🔄 Switch de Company (Multi-tenant)

Para usuários com acesso a múltiplas empresas:

```tsx
import { useAuth } from '@/contexts/auth-context'

export function CompanySwitcher() {
  const { switchCompany, getUserCompanies } = useAuth()
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    getUserCompanies().then(setCompanies)
  }, [])

  const handleSwitch = async (companyId: string) => {
    await switchCompany(companyId)
    // Página será recarregada com novo contexto
  }

  return (
    <select onChange={(e) => handleSwitch(e.target.value)}>
      {companies.map(company => (
        <option key={company.id} value={company.id}>
          {company.trade_name}
        </option>
      ))}
    </select>
  )
}
```

## 🔧 Serviço de Autenticação

### Métodos Disponíveis

```typescript
import { authService } from '@/lib/services/auth.service'

// Login
await authService.login({ email, password })

// Logout
await authService.logout()

// Get current user
const user = authService.getCurrentUser()

// Check authentication
const isAuth = authService.isAuthenticated()

// Check role
const isAdmin = authService.hasRole('admin')
const hasAccess = authService.hasRole(['admin', 'superadmin'])

// Fetch with auto-refresh
const response = await authService.fetchWithAuth('/api/v1/companies')

// Switch company
await authService.switchCompany(companyId)

// Get user companies
const companies = await authService.getUserCompanies()
```

## 🎯 Rotas Disponíveis

### Públicas
- `/login` - Página de login

### Protegidas (Requer Autenticação)
- `/dashboard` - Dashboard principal (todos os roles)
- `/dashboard/admin` - Dashboard do Admin (admin, superadmin)
- `/dashboard/superadmin` - Dashboard do SuperAdmin (apenas superadmin)

## 🐛 Troubleshooting

### Token não está sendo salvo
- Verifique se os cookies estão habilitados no navegador
- Verifique se `NEXT_PUBLIC_API_URL` está correto

### Redirecionamento infinito
- Limpe os cookies do navegador
- Verifique se o backend está rodando
- Verifique se o token JWT está válido

### Erro de CORS
- Verifique se o backend tem CORS configurado para `http://localhost:3000`
- Verifique o arquivo `.env` do backend

## 📚 Próximos Passos

- [ ] Implementar "Esqueci minha senha"
- [ ] Adicionar autenticação de dois fatores (2FA)
- [ ] Implementar login social (Google, etc)
- [ ] Adicionar testes unitários
- [ ] Implementar rate limiting no frontend
- [ ] Adicionar logs de auditoria

