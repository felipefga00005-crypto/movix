import {
  Produto,
  CreateProdutoRequest,
  UpdateProdutoRequest,
  UpdateEstoqueRequest,
  ProdutoStats,
  ProdutoStatus,
  ProdutoCategoria,
  ProdutoSearchParams
} from '@/types/produto';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

// Classe para gerenciar erros da API
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Função auxiliar para fazer requisições HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${API_VERSION}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Erro desconhecido',
      0
    );
  }
}

// ============================================
// SERVIÇOS DE PRODUTOS
// ============================================



export const produtosAPI = {
  // Listar todos os produtos
  async getAll(params?: ProdutoSearchParams): Promise<Produto[]> {
    let endpoint = '/produtos';
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });
      }
      
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiRequest<Produto[]>(endpoint);
  },

  // Buscar produto por ID
  async getById(id: number): Promise<Produto> {
    return apiRequest<Produto>(`/produtos/${id}`);
  },

  // Criar novo produto
  async create(data: CreateProdutoRequest): Promise<Produto> {
    return apiRequest<Produto>('/produtos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar produto
  async update(id: number, data: UpdateProdutoRequest): Promise<Produto> {
    return apiRequest<Produto>(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar produto
  async delete(id: number): Promise<void> {
    await apiRequest<void>(`/produtos/${id}`, {
      method: 'DELETE',
    });
  },

  // Atualizar estoque
  async updateEstoque(id: number, data: UpdateEstoqueRequest): Promise<Produto> {
    return apiRequest<Produto>(`/produtos/${id}/estoque`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Buscar produtos por status
  async getByStatus(status: string): Promise<Produto[]> {
    return apiRequest<Produto[]>(`/produtos/status?status=${encodeURIComponent(status)}`);
  },

  // Buscar produtos por categoria
  async getByCategoria(categoria: string): Promise<Produto[]> {
    return apiRequest<Produto[]>(`/produtos/categoria?categoria=${encodeURIComponent(categoria)}`);
  },

  // Buscar produtos com estoque baixo
  async getEstoqueBaixo(): Promise<Produto[]> {
    return apiRequest<Produto[]>('/produtos/estoque-baixo');
  },

  // Buscar produtos (com termo de busca)
  async search(query: string): Promise<Produto[]> {
    return apiRequest<Produto[]>(`/produtos/search?q=${encodeURIComponent(query)}`);
  },

  // Obter estatísticas dos produtos
  async getStats(): Promise<ProdutoStats> {
    return apiRequest<ProdutoStats>('/produtos/stats');
  },
};

// ============================================
// HOOKS PERSONALIZADOS (para usar com React Query)
// ============================================

export const produtosQueryKeys = {
  all: ['produtos'] as const,
  lists: () => [...produtosQueryKeys.all, 'list'] as const,
  list: (params?: ProdutoSearchParams) => [...produtosQueryKeys.lists(), params] as const,
  details: () => [...produtosQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...produtosQueryKeys.details(), id] as const,
  stats: () => [...produtosQueryKeys.all, 'stats'] as const,
  byStatus: (status: string) => [...produtosQueryKeys.all, 'status', status] as const,
  byCategoria: (categoria: string) => [...produtosQueryKeys.all, 'categoria', categoria] as const,
  estoqueBaixo: () => [...produtosQueryKeys.all, 'estoque-baixo'] as const,
  search: (query: string) => [...produtosQueryKeys.all, 'search', query] as const,
};

// Utilitários para formatação
export const produtoUtils = {
  // Formatar preço
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  },

  // Formatar código do produto
  formatCodigo(codigo: string): string {
    return codigo.toUpperCase();
  },

  // Obter status badge color
  getStatusColor(status: ProdutoStatus): string {
    switch (status) {
      case ProdutoStatus.ATIVO:
        return 'bg-green-100 text-green-800';
      case ProdutoStatus.INATIVO:
        return 'bg-red-100 text-red-800';
      case ProdutoStatus.DESCONTINUADO:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Obter categoria badge color
  getCategoriaColor(categoria: string): string {
    switch (categoria) {
      case ProdutoCategoria.INFORMATICA:
        return 'bg-blue-100 text-blue-800';
      case ProdutoCategoria.ELETRONICOS:
        return 'bg-purple-100 text-purple-800';
      case ProdutoCategoria.CASA_JARDIM:
        return 'bg-green-100 text-green-800';
      case ProdutoCategoria.ROUPAS_ACESSORIOS:
        return 'bg-pink-100 text-pink-800';
      case ProdutoCategoria.LIVROS:
        return 'bg-yellow-100 text-yellow-800';
      case ProdutoCategoria.ESPORTES:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Verificar se estoque está baixo
  isEstoqueBaixo(produto: Produto): boolean {
    return produto.estoque <= produto.estoqueMinimo;
  },

  // Obter cor do indicador de estoque
  getEstoqueColor(produto: Produto): string {
    if (produto.estoque === 0) {
      return 'bg-red-100 text-red-800';
    } else if (this.isEstoqueBaixo(produto)) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  },

  // Calcular margem de lucro
  calcularMargem(produto: Produto): number {
    if (!produto.precoCusto || produto.precoCusto === 0) return 0;
    return ((produto.preco - produto.precoCusto) / produto.precoCusto) * 100;
  },

  // Formatar margem de lucro
  formatMargem(produto: Produto): string {
    const margem = this.calcularMargem(produto);
    return `${margem.toFixed(1)}%`;
  },

  // Validar código do produto
  isValidCodigo(codigo: string): boolean {
    return codigo.length >= 3 && /^[A-Z0-9]+$/.test(codigo.toUpperCase());
  },

  // Gerar sugestão de código
  generateCodigoSuggestion(nome: string, categoria?: string): string {
    const nomeClean = nome.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const categoriaPrefix = categoria ? categoria.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-4);

    return `${categoriaPrefix}${nomeClean.substring(0, 4)}${timestamp}`;
  },
};
