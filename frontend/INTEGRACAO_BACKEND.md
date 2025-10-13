# Integração Frontend-Backend - Sistema Movix

## 📋 Visão Geral

Este documento explica como o frontend Next.js está integrado com o backend Go (Gin + GORM).

## 🏗️ Arquitetura

```
frontend/
├── lib/
│   ├── api.ts                          # Cliente HTTP base
│   └── services/                       # Serviços de API
│       ├── cliente.service.ts          # CRUD de clientes
│       ├── fornecedor.service.ts       # CRUD de fornecedores
│       ├── produto.service.ts          # CRUD de produtos
│       └── external-api.service.ts     # APIs externas (CEP, CNPJ)
├── hooks/
│   ├── use-clientes.ts                 # Hook para gerenciar clientes
│   ├── use-fornecedores.ts             # Hook para gerenciar fornecedores
│   └── use-produtos.ts                 # Hook para gerenciar produtos
├── components/
│   ├── clientes/
│   │   ├── clientes-table.tsx          # Tabela de clientes
│   │   ├── cliente-form.tsx            # Formulário de cliente
│   │   └── cliente-form-dialog.tsx     # Modal do formulário
│   ├── fornecedores/                   # (a criar)
│   └── produtos/                       # (a criar)
└── app/
    └── cadastros/
        ├── clientes/page.tsx           # Página de clientes
        ├── fornecedores/page.tsx       # Página de fornecedores
        └── produtos/page.tsx           # Página de produtos
```

## 🔌 Endpoints da API

### Base URL
```
http://localhost:8080/api/v1
```

### Clientes
- `GET /clientes` - Lista todos os clientes
- `GET /clientes/:id` - Busca cliente por ID
- `POST /clientes` - Cria novo cliente
- `PUT /clientes/:id` - Atualiza cliente
- `DELETE /clientes/:id` - Deleta cliente
- `GET /clientes/status?status=Ativo` - Filtra por status
- `GET /clientes/search?q=termo` - Busca clientes
- `GET /clientes/stats` - Estatísticas

### Produtos
- `GET /produtos` - Lista todos os produtos
- `GET /produtos/:id` - Busca produto por ID
- `POST /produtos` - Cria novo produto
- `PUT /produtos/:id` - Atualiza produto
- `DELETE /produtos/:id` - Deleta produto
- `PUT /produtos/:id/estoque` - Atualiza estoque
- `GET /produtos/status?status=Ativo` - Filtra por status
- `GET /produtos/categoria?categoria=X` - Filtra por categoria
- `GET /produtos/estoque-baixo` - Produtos com estoque baixo
- `GET /produtos/search?q=termo` - Busca produtos
- `GET /produtos/stats` - Estatísticas

### Fornecedores
- `GET /fornecedores` - Lista todos os fornecedores
- `GET /fornecedores/:id` - Busca fornecedor por ID
- `POST /fornecedores` - Cria novo fornecedor
- `PUT /fornecedores/:id` - Atualiza fornecedor
- `DELETE /fornecedores/:id` - Deleta fornecedor
- `GET /fornecedores/status?status=Ativo` - Filtra por status
- `GET /fornecedores/categoria?categoria=X` - Filtra por categoria
- `GET /fornecedores/search?q=termo` - Busca fornecedores
- `GET /fornecedores/stats` - Estatísticas

### APIs Externas
- `GET /cep/:cep` - Busca CEP (ViaCEP)
- `GET /cnpj/:cnpj` - Busca CNPJ (ReceitaWS)
- `GET /estados` - Lista estados (IBGE)
- `GET /estados/:uf/cidades` - Lista cidades por estado

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 2. Iniciar o Backend

```bash
cd backend
make run
# ou
go run cmd/server/main.go
```

O backend estará rodando em `http://localhost:8080`

### 3. Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📝 Exemplo de Uso

### Usando o Hook de Clientes

```tsx
'use client';

import { useClientes } from '@/hooks/use-clientes';

export default function MinhaPage() {
  const { 
    clientes, 
    loading, 
    createCliente, 
    updateCliente, 
    deleteCliente 
  } = useClientes();

  const handleCreate = async () => {
    await createCliente({
      cpf: '12345678900',
      nome: 'João Silva',
      email: 'joao@example.com',
      status: 'Ativo'
    });
  };

  return (
    <div>
      {loading ? 'Carregando...' : (
        <ul>
          {clientes.map(cliente => (
            <li key={cliente.id}>{cliente.nome}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Usando o Serviço Diretamente

```tsx
import { clienteService } from '@/lib/services/cliente.service';

// Buscar todos os clientes
const clientes = await clienteService.getAll();

// Buscar por ID
const cliente = await clienteService.getById(1);

// Criar cliente
const novoCliente = await clienteService.create({
  cpf: '12345678900',
  nome: 'João Silva',
  email: 'joao@example.com'
});

// Atualizar cliente
const clienteAtualizado = await clienteService.update(1, {
  nome: 'João Silva Santos'
});

// Deletar cliente
await clienteService.delete(1);

// Buscar
const resultados = await clienteService.search('João');

// Estatísticas
const stats = await clienteService.getStats();
```

### Buscar CEP

```tsx
import { externalAPIService } from '@/lib/services/external-api.service';

const handleBuscarCEP = async (cep: string) => {
  try {
    const dados = await externalAPIService.buscarCEP(cep);
    console.log(dados.logradouro);
    console.log(dados.bairro);
    console.log(dados.localidade);
    console.log(dados.uf);
  } catch (error) {
    console.error('CEP não encontrado');
  }
};
```

## 🔄 Mapeamento de Campos

### Cliente (Backend → Frontend)

| Backend (Go)          | Frontend (TypeScript) |
|-----------------------|-----------------------|
| `cpf`                 | `cpf`                 |
| `ie_rg`               | `ie_rg`               |
| `inscricao_municipal` | `inscricao_municipal` |
| `nome`                | `nome`                |
| `nome_fantasia`       | `nome_fantasia`       |
| `telefone_fixo`       | `telefone_fixo`       |
| `celular`             | `celular`             |
| `cep`                 | `cep`                 |
| `endereco`            | `endereco`            |
| `cidade`              | `cidade`              |
| `estado`              | `estado`              |

### Produto (Backend → Frontend)

| Backend (Go)      | Frontend (TypeScript) |
|-------------------|-----------------------|
| `nome`            | `nome`                |
| `codigo`          | `codigo`              |
| `categoria`       | `categoria`           |
| `preco`           | `preco`               |
| `preco_custo`     | `preco_custo`         |
| `estoque`         | `estoque`             |
| `estoque_minimo`  | `estoque_minimo`      |

### Fornecedor (Backend → Frontend)

| Backend (Go)      | Frontend (TypeScript) |
|-------------------|-----------------------|
| `razao_social`    | `razao_social`        |
| `nome_fantasia`   | `nome_fantasia`       |
| `cnpj`            | `cnpj`                |
| `email`           | `email`               |
| `telefone`        | `telefone`            |

## 🎨 Componentes Disponíveis

### ClientesTable
Tabela com busca, edição e exclusão de clientes.

```tsx
<ClientesTable
  clientes={clientes}
  onEdit={(cliente) => console.log('Editar', cliente)}
  onDelete={(id) => console.log('Deletar', id)}
  loading={loading}
/>
```

### ClienteForm
Formulário completo com abas para dados básicos, endereço, entrega e financeiro.

```tsx
<ClienteForm
  cliente={clienteSelecionado}
  onSubmit={async (data) => await createCliente(data)}
  onCancel={() => setDialogOpen(false)}
/>
```

### ClienteFormDialog
Modal com formulário de cliente.

```tsx
<ClienteFormDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  cliente={cliente}
  onSubmit={async (data) => await updateCliente(cliente.id, data)}
/>
```

## 🔧 Tratamento de Erros

Todos os serviços e hooks incluem tratamento de erros com notificações toast:

```tsx
try {
  await clienteService.create(data);
  toast.success('Cliente criado com sucesso!');
} catch (error) {
  toast.error('Erro ao criar cliente');
}
```

## 📦 Próximos Passos

1. ✅ Clientes - Implementado
2. ⏳ Fornecedores - Criar componentes
3. ⏳ Produtos - Criar componentes
4. ⏳ Autenticação - Implementar JWT
5. ⏳ Paginação - Adicionar aos endpoints
6. ⏳ Filtros avançados - Implementar
7. ⏳ Upload de imagens - Produtos
8. ⏳ Relatórios - Dashboard

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se de que o backend está com CORS habilitado:
```go
router.Use(middleware.CORS())
```

### Erro 404
Verifique se a `NEXT_PUBLIC_API_URL` está correta no `.env.local`

### Dados não aparecem
1. Verifique se o backend está rodando
2. Abra o DevTools → Network para ver as requisições
3. Verifique os logs do backend

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Gin Framework](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)

