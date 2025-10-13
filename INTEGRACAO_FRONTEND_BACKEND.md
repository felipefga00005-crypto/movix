# 🔗 Guia de Integração Frontend-Backend - Movix ERP

## 📋 Visão Geral

Este documento descreve como o frontend Next.js está integrado com o backend Go através de uma API REST.

## 🏗️ Arquitetura da Integração

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Páginas    │ ───> │    Hooks     │ ───> │  API Lib  │ │
│  │  (pages)     │      │ (use-*.ts)   │      │           │ │
│  └──────────────┘      └──────────────┘      └─────┬─────┘ │
│                                                      │       │
└──────────────────────────────────────────────────────┼───────┘
                                                       │
                                                       │ HTTP
                                                       │
┌──────────────────────────────────────────────────────┼───────┐
│                       BACKEND (Go)                   │       │
├──────────────────────────────────────────────────────┴───────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Routers    │ ───> │   Handlers   │ ───> │ Services  │ │
│  │              │      │              │      │           │ │
│  └──────────────┘      └──────────────┘      └─────┬─────┘ │
│                                                      │       │
│                                              ┌───────┴─────┐ │
│                                              │   Models    │ │
│                                              │   (GORM)    │ │
│                                              └─────┬───────┘ │
│                                                    │         │
└────────────────────────────────────────────────────┼─────────┘
                                                     │
                                              ┌──────┴──────┐
                                              │  PostgreSQL │
                                              └─────────────┘
```

## 📁 Estrutura de Arquivos Criados

### Frontend

```
frontend/
├── types/
│   └── index.ts                    # ✅ Tipos TypeScript (baseados nos models Go)
├── lib/
│   └── api/
│       ├── client.ts               # ✅ Cliente HTTP base
│       ├── clientes.ts             # ✅ API de Clientes
│       ├── produtos.ts             # ✅ API de Produtos
│       ├── fornecedores.ts         # ✅ API de Fornecedores
│       ├── usuarios.ts             # ✅ API de Usuários
│       └── index.ts                # ✅ Exportações centralizadas
├── hooks/
│   └── cadastros/
│       ├── use-clientes.ts         # ✅ Hook para Clientes
│       ├── use-produtos.ts         # ✅ Hook para Produtos
│       ├── use-fornecedores.ts     # ✅ Hook para Fornecedores
│       └── use-usuarios.ts         # ✅ Hook para Usuários
├── .env.local                      # ✅ Variáveis de ambiente
└── .env.example                    # ✅ Exemplo de configuração
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do frontend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Iniciar o Backend

```bash
cd backend
docker-compose up -d  # Subir PostgreSQL
make run              # Iniciar servidor Go
```

O backend estará disponível em: `http://localhost:8080`

### 3. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 📊 Endpoints da API

### Base URL
```
http://localhost:8080/api/v1
```

### Clientes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/clientes` | Lista todos os clientes |
| GET | `/clientes/:id` | Busca cliente por ID |
| POST | `/clientes` | Cria novo cliente |
| PUT | `/clientes/:id` | Atualiza cliente |
| DELETE | `/clientes/:id` | Remove cliente (soft delete) |
| GET | `/clientes/stats` | Estatísticas de clientes |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/produtos` | Lista todos os produtos |
| GET | `/produtos/:id` | Busca produto por ID |
| POST | `/produtos` | Cria novo produto |
| PUT | `/produtos/:id` | Atualiza produto |
| DELETE | `/produtos/:id` | Remove produto (soft delete) |
| PUT | `/produtos/:id/estoque` | Atualiza estoque |
| GET | `/produtos/estoque-baixo` | Produtos com estoque baixo |
| GET | `/produtos/stats` | Estatísticas de produtos |

### Fornecedores
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/fornecedores` | Lista todos os fornecedores |
| GET | `/fornecedores/:id` | Busca fornecedor por ID |
| POST | `/fornecedores` | Cria novo fornecedor |
| PUT | `/fornecedores/:id` | Atualiza fornecedor |
| DELETE | `/fornecedores/:id` | Remove fornecedor (soft delete) |
| GET | `/fornecedores/stats` | Estatísticas de fornecedores |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/usuarios` | Lista todos os usuários |
| GET | `/usuarios/:id` | Busca usuário por ID |
| POST | `/usuarios` | Cria novo usuário |
| PUT | `/usuarios/:id` | Atualiza usuário |
| DELETE | `/usuarios/:id` | Remove usuário (soft delete) |
| PUT | `/usuarios/:id/senha` | Atualiza senha |
| GET | `/usuarios/stats` | Estatísticas de usuários |

## 💻 Como Usar nos Componentes

### Exemplo 1: Listar Clientes

```tsx
"use client"

import { useClientes } from "@/hooks/cadastros/use-clientes"

export function ClientesPage() {
  const { clientes, loading, error, refresh } = useClientes()

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      <button onClick={refresh}>Atualizar</button>
      <ul>
        {clientes.map((cliente) => (
          <li key={cliente.id}>{cliente.nome}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Exemplo 2: Criar Cliente

```tsx
"use client"

import { useClientes } from "@/hooks/cadastros/use-clientes"
import { useState } from "react"

export function NovoClienteForm() {
  const { createCliente, loading } = useClientes({ autoFetch: false })
  const [nome, setNome] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createCliente({
        nome,
        email: "cliente@email.com",
        telefone: "(11) 99999-9999",
        cpf: "123.456.789-00",
      })
      alert("Cliente criado com sucesso!")
    } catch (error) {
      alert("Erro ao criar cliente")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do cliente"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  )
}
```

### Exemplo 3: Filtrar e Buscar

```tsx
"use client"

import { useClientes } from "@/hooks/cadastros/use-clientes"
import { useState } from "react"

export function ClientesFiltrados() {
  const { clientes, fetchClientes, loading } = useClientes({ autoFetch: false })
  const [busca, setBusca] = useState("")

  const handleBuscar = () => {
    fetchClientes({ search: busca, status: "Ativo" })
  }

  return (
    <div>
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar cliente..."
      />
      <button onClick={handleBuscar}>Buscar</button>
      
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ul>
          {clientes.map((cliente) => (
            <li key={cliente.id}>{cliente.nome}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Exemplo 4: Atualizar Estoque de Produto

```tsx
"use client"

import { useProdutos } from "@/hooks/cadastros/use-produtos"

export function AtualizarEstoque({ produtoId }: { produtoId: number }) {
  const { updateEstoque, loading } = useProdutos({ autoFetch: false })

  const handleAdicionar = async () => {
    try {
      await updateEstoque(produtoId, {
        quantidade: 10,
        operacao: "adicionar"
      })
      alert("Estoque atualizado!")
    } catch (error) {
      alert("Erro ao atualizar estoque")
    }
  }

  return (
    <button onClick={handleAdicionar} disabled={loading}>
      Adicionar 10 unidades
    </button>
  )
}
```

## 🎯 Próximos Passos para Integração

### 1. Atualizar Página de Clientes

Edite `frontend/app/cadastros/clientes/page.tsx`:

```tsx
"use client"

import { AppLayout } from "@/components/shared/app-layout"
import { ClientesSectionCards } from "@/components/cadastros/clientes/clientes-section-cards"
import { ClientesDataTable } from "@/components/cadastros/clientes/clientes-data-table"
import { useClientes } from "@/hooks/cadastros/use-clientes"

export default function ClientesPage() {
  const { clientes, stats, loading, error } = useClientes()

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Cadastro de Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes da sua empresa
            </p>
          </div>
        </div>
        
        {loading && <div>Carregando...</div>}
        {error && <div>Erro: {error}</div>}
        
        {!loading && !error && (
          <>
            <ClientesSectionCards stats={stats} />
            <ClientesDataTable data={clientes} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
```

### 2. Atualizar Cards de Estatísticas

Edite `frontend/components/cadastros/clientes/clientes-section-cards.tsx` para receber `stats` como prop.

### 3. Adicionar Formulários de Criação/Edição

Crie componentes de formulário que usem os hooks para criar e editar registros.

### 4. Adicionar Tratamento de Erros

Implemente toasts ou notificações para feedback ao usuário.

## 🔍 Testando a Integração

### 1. Teste Manual via cURL

```bash
# Criar um cliente
curl -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 98888-3333",
    "cpf": "123.456.789-00"
  }'

# Listar clientes
curl http://localhost:8080/api/v1/clientes

# Buscar estatísticas
curl http://localhost:8080/api/v1/clientes/stats
```

### 2. Teste no Frontend

1. Acesse `http://localhost:3000/cadastros/clientes`
2. Abra o DevTools (F12) > Console
3. Verifique se há erros de CORS ou conexão
4. Verifique as requisições na aba Network

## ⚠️ Troubleshooting

### Erro de CORS

Se aparecer erro de CORS, verifique se o middleware CORS está habilitado no backend:

```go
// backend/internal/middleware/cors.go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Origin", "Content-Type"},
    AllowCredentials: true,
}))
```

### Backend não responde

1. Verifique se o backend está rodando: `curl http://localhost:8080/health`
2. Verifique se o PostgreSQL está rodando: `docker ps`
3. Verifique os logs do backend

### Frontend não conecta

1. Verifique se a variável `NEXT_PUBLIC_API_URL` está definida
2. Reinicie o servidor Next.js após alterar `.env.local`
3. Verifique o console do navegador para erros

## 📚 Recursos Adicionais

- [Documentação do Backend](./backend/API_SUMMARY.md)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Gin (Go)](https://gin-gonic.com/docs/)
- [Documentação GORM](https://gorm.io/docs/)

## ✅ Checklist de Integração

- [x] Tipos TypeScript criados
- [x] Cliente HTTP configurado
- [x] APIs de todos os módulos criadas
- [x] Hooks customizados criados
- [x] Variáveis de ambiente configuradas
- [ ] Páginas atualizadas para usar hooks
- [ ] Componentes de formulário criados
- [ ] Tratamento de erros implementado
- [ ] Loading states implementados
- [ ] Testes de integração

---

**Desenvolvido para Movix ERP** 🚀

