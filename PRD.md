# PRD – SaaS B2B Administração (Go + Next.js + shadcn/ui)

## 1. Visão Geral

**Objetivo:**  
Implementar rapidamente o módulo de administração do SaaS B2B, permitindo que o **Super Admin** controle contas de clientes, módulos liberados, CNPJs e usuários internos, sem integração fiscal ainda.

**Escopo inicial:**  
- Gestão de contas e empresas.  
- Gestão de usuários internos e permissões.  
- Gestão de CNPJs por empresa.  
- Controle de módulos habilitados por Super Admin.

**Não está no escopo neste momento:**  
- Emissão de NF-e, NFC-e, CT-e, MDF-e.  
- Integração com serviços fiscais.  
- Testes automatizados, documentação detalhada, auditoria ou logs complexos.

---

## 2. Usuários e Hierarquia

| Papel | Funções principais | Observações |
|-------|-----------------|------------|
| **Super Admin** | - Criar/editar/deletar contas de clientes <br> - Ativar/desativar módulos por conta <br> - Autorizar CNPJs <br> - Visualizar dashboard simplificado de contas | Painel central de controle |
| **Admin da Conta** | - Gerenciar usuários internos <br> - Gerenciar CNPJs da empresa <br> - Ativar módulos liberados pelo Super Admin | Admin local da empresa |
| **Usuário Interno** | - Apenas visualização inicial de módulo administrativo (não operacional) | Não terá emissão fiscal ainda |

---

## 3. Funcionalidades Implementadas Agora

### 3.1 Super Admin
- Criar e remover contas de clientes.  
- Editar informações básicas da empresa (nome, plano, status).  
- Ativar/desativar módulos da conta.  
- Adicionar, remover e autorizar CNPJs para cada conta.  
- Dashboard simples mostrando lista de contas e CNPJs autorizados.

### 3.2 Admin da Conta
- Criar e gerenciar usuários internos.  
- Definir quais usuários têm acesso a quais módulos liberados.  
- Adicionar/editar/remover CNPJs internos da empresa.  
- Interface para visualizar módulos liberados e status do CNPJ.

### 3.3 Usuário Interno
- Visualizar módulos liberados e CNPJs autorizados.  
- Selecionar CNPJ ativo (não funcional para emissão ainda).  

---

## 4. Stack Tecnológica

### 4.1 Backend (Go)
- **Framework:** Chi Router ou Gin
- **ORM:** GORM ou sqlx
- **Autenticação:** JWT (golang-jwt/jwt)
- **Validação:** go-playground/validator
- **Migrations:** golang-migrate/migrate
- **Estrutura:** Clean Architecture (handlers, services, repositories)

### 4.2 Frontend (Next.js 14+)
- **Framework:** Next.js 14 com App Router
- **UI Components:** shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** React Context API ou Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios ou Fetch API
- **Autenticação:** NextAuth.js ou implementação custom com JWT

### 4.3 Banco de Dados
- **Database:** PostgreSQL 16
- **Containerização:** Docker Compose
- **Migrations:** golang-migrate ou GORM AutoMigrate

### 4.4 Infraestrutura
- **Containerização:** Docker + Docker Compose
- **Serviços:**
  - `backend` (Go API)
  - `frontend` (Next.js)
  - `postgres` (PostgreSQL)
  - `pgadmin` (opcional, para desenvolvimento)

---

## 5. Banco de Dados – Estrutura Básica

### 5.1 Tabelas Principais

```sql
-- Super Admins
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Empresas (Contas de Clientes)
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    plano VARCHAR(50) DEFAULT 'basic',
    status VARCHAR(50) DEFAULT 'active',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usuários Internos
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CNPJs
CREATE TABLE cnpjs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    autorizado BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos do Sistema
CREATE TABLE modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Módulos por Empresa (liberados pelo Super Admin)
CREATE TABLE empresa_modulo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id, modulo_id)
);

-- Módulos por Usuário (atribuídos pelo Admin da Conta)
CREATE TABLE usuario_modulo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo_id UUID REFERENCES modulos(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, modulo_id)
);

-- Sessões de Usuário (CNPJ ativo selecionado)
CREATE TABLE usuario_sessao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    cnpj_id UUID REFERENCES cnpjs(id) ON DELETE CASCADE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Índices Recomendados
```sql
CREATE INDEX idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX idx_cnpjs_empresa_id ON cnpjs(empresa_id);
CREATE INDEX idx_empresa_modulo_empresa_id ON empresa_modulo(empresa_id);
CREATE INDEX idx_usuario_modulo_usuario_id ON usuario_modulo(usuario_id);
CREATE INDEX idx_cnpjs_cnpj ON cnpjs(cnpj);
```

---

## 6. API Backend (Go) – Endpoints Principais

### 6.1 Autenticação
```
POST   /api/v1/auth/login              # Login (Super Admin, Admin, User)
POST   /api/v1/auth/logout             # Logout
GET    /api/v1/auth/me                 # Dados do usuário autenticado
POST   /api/v1/auth/refresh            # Refresh token
```

### 6.2 Super Admin – Gestão de Empresas
```
GET    /api/v1/admin/empresas          # Listar todas empresas
POST   /api/v1/admin/empresas          # Criar empresa
GET    /api/v1/admin/empresas/:id      # Detalhes da empresa
PUT    /api/v1/admin/empresas/:id      # Atualizar empresa
DELETE /api/v1/admin/empresas/:id      # Deletar empresa
```

### 6.3 Super Admin – Gestão de Módulos
```
GET    /api/v1/admin/modulos           # Listar módulos disponíveis
POST   /api/v1/admin/modulos           # Criar módulo
GET    /api/v1/admin/empresas/:id/modulos  # Módulos da empresa
POST   /api/v1/admin/empresas/:id/modulos  # Ativar módulo para empresa
DELETE /api/v1/admin/empresas/:id/modulos/:modulo_id  # Desativar módulo
```

### 6.4 Super Admin – Gestão de CNPJs
```
GET    /api/v1/admin/empresas/:id/cnpjs     # CNPJs da empresa
POST   /api/v1/admin/empresas/:id/cnpjs     # Adicionar CNPJ
PUT    /api/v1/admin/cnpjs/:id              # Autorizar/editar CNPJ
DELETE /api/v1/admin/cnpjs/:id              # Remover CNPJ
```

### 6.5 Admin da Conta – Gestão de Usuários
```
GET    /api/v1/empresa/usuarios        # Listar usuários da empresa
POST   /api/v1/empresa/usuarios        # Criar usuário
GET    /api/v1/empresa/usuarios/:id    # Detalhes do usuário
PUT    /api/v1/empresa/usuarios/:id    # Atualizar usuário
DELETE /api/v1/empresa/usuarios/:id    # Deletar usuário
```

### 6.6 Admin da Conta – Gestão de Módulos de Usuários
```
GET    /api/v1/empresa/usuarios/:id/modulos     # Módulos do usuário
POST   /api/v1/empresa/usuarios/:id/modulos     # Atribuir módulo
DELETE /api/v1/empresa/usuarios/:id/modulos/:modulo_id  # Remover módulo
```

### 6.7 Admin da Conta – Gestão de CNPJs
```
GET    /api/v1/empresa/cnpjs           # CNPJs da empresa
POST   /api/v1/empresa/cnpjs           # Adicionar CNPJ
PUT    /api/v1/empresa/cnpjs/:id       # Editar CNPJ
DELETE /api/v1/empresa/cnpjs/:id       # Remover CNPJ
```

### 6.8 Usuário Interno – Visualização
```
GET    /api/v1/user/modulos            # Módulos liberados
GET    /api/v1/user/cnpjs              # CNPJs autorizados
POST   /api/v1/user/cnpj/selecionar    # Selecionar CNPJ ativo
GET    /api/v1/user/cnpj/ativo         # CNPJ ativo na sessão
```

---

## 7. Frontend (Next.js + shadcn/ui) – Estrutura de Páginas

### 7.1 Estrutura de Diretórios
```
/app
  /(auth)
    /login
      page.tsx              # Página de login
  /(super-admin)
    /dashboard
      page.tsx              # Dashboard Super Admin
    /empresas
      page.tsx              # Lista de empresas
      /[id]
        page.tsx            # Detalhes da empresa
        /modulos
          page.tsx          # Módulos da empresa
        /cnpjs
          page.tsx          # CNPJs da empresa
        /usuarios
          page.tsx          # Usuários da empresa
  /(admin)
    /dashboard
      page.tsx              # Dashboard Admin da Conta
    /usuarios
      page.tsx              # Gestão de usuários
      /[id]
        page.tsx            # Detalhes do usuário
    /cnpjs
      page.tsx              # Gestão de CNPJs
    /modulos
      page.tsx              # Módulos liberados
  /(user)
    /dashboard
      page.tsx              # Dashboard Usuário Interno
    /modulos
      page.tsx              # Módulos disponíveis
    /cnpjs
      page.tsx              # Seleção de CNPJ
/components
  /ui                       # shadcn/ui components
  /layout
    Sidebar.tsx
    Header.tsx
    Navigation.tsx
  /forms
    LoginForm.tsx
    EmpresaForm.tsx
    UsuarioForm.tsx
    CNPJForm.tsx
  /tables
    EmpresasTable.tsx
    UsuariosTable.tsx
    CNPJsTable.tsx
/lib
  /api
    client.ts               # Axios instance
    auth.ts                 # Auth helpers
  /hooks
    useAuth.ts
    useEmpresas.ts
    useUsuarios.ts
  /utils
    validators.ts
    formatters.ts
```

### 7.2 Componentes shadcn/ui Utilizados
- `Button`
- `Card`
- `Table`
- `Form` (com React Hook Form)
- `Input`
- `Select`
- `Dialog`
- `DropdownMenu`
- `Badge`
- `Tabs`
- `Toast`
- `Avatar`
- `Separator`
- `Switch`

---

## 8. Docker Compose – Configuração

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: movix-postgres
    environment:
      POSTGRES_DB: movix
      POSTGRES_USER: movix
      POSTGRES_PASSWORD: movix123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - movix-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: movix-backend
    environment:
      DATABASE_URL: postgres://movix:movix123@postgres:5432/movix?sslmode=disable
      JWT_SECRET: your-secret-key-change-in-production
      PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - movix-network
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: movix-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8080/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - movix-network
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: movix-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@movix.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - movix-network

volumes:
  postgres_data:

networks:
  movix-network:
    driver: bridge
```

---

## 9. Fluxos de Uso Implementados

### 9.1 Fluxo Super Admin
1. Super Admin faz login → acessa dashboard
2. Cria nova empresa → define plano e status
3. Ativa módulos para a empresa (NF-e, NFC-e, etc.)
4. Adiciona CNPJs para a empresa
5. Autoriza CNPJs específicos
6. Visualiza lista de empresas, módulos ativos e CNPJs

### 9.2 Fluxo Admin da Conta
1. Admin faz login → acessa dashboard da empresa
2. Visualiza módulos liberados pelo Super Admin
3. Cria usuários internos
4. Atribui módulos liberados aos usuários
5. Gerencia CNPJs da empresa
6. Visualiza status de CNPJs autorizados

### 9.3 Fluxo Usuário Interno
1. Usuário faz login → acessa dashboard
2. Visualiza módulos disponíveis
3. Visualiza lista de CNPJs autorizados
4. Seleciona CNPJ ativo para a sessão
5. Navega pelos módulos liberados (sem funcionalidade fiscal ainda)

### 9.4 Validações Backend
- Verificar se usuário tem permissão para acessar módulo
- Verificar se CNPJ está autorizado
- Verificar se módulo está ativo para a empresa
- Verificar role do usuário (Super Admin, Admin, User)
- Validar JWT em todas as rotas protegidas

---

## 10. Roadmap de Implementação

### Fase 1: Setup Inicial (Semana 1)
- [ ] Configurar Docker Compose
- [ ] Criar estrutura do projeto Go (backend)
- [ ] Criar estrutura do projeto Next.js (frontend)
- [ ] Configurar PostgreSQL e migrations
- [ ] Configurar shadcn/ui e Tailwind CSS

### Fase 2: Backend Core (Semana 2)
- [ ] Implementar autenticação JWT
- [ ] Criar models e repositories (GORM)
- [ ] Implementar endpoints de Super Admin
- [ ] Implementar endpoints de Admin da Conta
- [ ] Implementar endpoints de Usuário Interno
- [ ] Adicionar middlewares de autenticação e autorização

### Fase 3: Frontend Core (Semana 3)
- [ ] Implementar sistema de autenticação
- [ ] Criar layout base com sidebar e header
- [ ] Implementar dashboard Super Admin
- [ ] Implementar CRUD de empresas
- [ ] Implementar gestão de módulos
- [ ] Implementar gestão de CNPJs

### Fase 4: Frontend Admin e User (Semana 4)
- [ ] Implementar dashboard Admin da Conta
- [ ] Implementar CRUD de usuários internos
- [ ] Implementar atribuição de módulos
- [ ] Implementar dashboard Usuário Interno
- [ ] Implementar seleção de CNPJ ativo
- [ ] Adicionar validações de formulários (Zod)

### Fase 5: Refinamento (Semana 5)
- [ ] Adicionar feedback visual (toasts, loading states)
- [ ] Implementar tratamento de erros
- [ ] Melhorar UX/UI com shadcn/ui
- [ ] Adicionar paginação nas tabelas
- [ ] Implementar busca e filtros
- [ ] Testar fluxos completos

---

## 11. Objetivo Final da Fase

Ter **um sistema administrativo funcional**, onde:
- Super Admin pode criar contas, liberar módulos e autorizar CNPJs.  
- Admin da Conta pode gerenciar usuários e CNPJs internos.  
- Usuários internos podem logar, visualizar módulos liberados e selecionar CNPJs ativos.  
- Interface moderna e responsiva com shadcn/ui e Tailwind CSS.
- Backend robusto em Go com arquitetura limpa.
- Infraestrutura containerizada com Docker Compose.

> Esta fase garante que a base de administração esteja pronta para, em fases futuras, integrar a emissão de NF-e, NFC-e, CT-e e MDF-e.

---

## 12. Considerações Técnicas

### 12.1 Segurança
- Senhas hasheadas com bcrypt
- JWT com expiração configurável
- Validação de inputs em todas as rotas
- CORS configurado adequadamente
- Rate limiting (implementar futuramente)

### 12.2 Performance
- Índices no banco de dados
- Paginação em listagens
- Cache de queries frequentes (implementar futuramente)
- Lazy loading de componentes Next.js

### 12.3 Escalabilidade
- Arquitetura preparada para microserviços
- Separação clara de responsabilidades
- Multi-tenancy por empresa_id
- Possibilidade de adicionar Redis futuramente

### 12.4 Developer Experience
- Hot reload em desenvolvimento (Go Air, Next.js)
- Docker Compose para ambiente consistente
- Migrations versionadas
- Componentes reutilizáveis com shadcn/ui

