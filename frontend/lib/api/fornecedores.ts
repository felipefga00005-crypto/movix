import {
  Fornecedor,
  CreateFornecedorRequest,
  UpdateFornecedorRequest,
  FornecedorStats,
  FornecedorStatus,
  FornecedorCategoria
} from '@/types/fornecedor';

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
// SERVIÇOS DE FORNECEDORES
// ============================================

export interface FornecedorSearchParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    status?: string;
    categoria?: string;
    cidade?: string;
    uf?: string;
    search?: string;
  };
}

export const fornecedoresAPI = {
  // Listar todos os fornecedores
  async getAll(params?: FornecedorSearchParams): Promise<Fornecedor[]> {
    let endpoint = '/fornecedores';
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
      }
      
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiRequest<Fornecedor[]>(endpoint);
  },

  // Buscar fornecedor por ID
  async getById(id: number): Promise<Fornecedor> {
    return apiRequest<Fornecedor>(`/fornecedores/${id}`);
  },

  // Criar novo fornecedor
  async create(data: CreateFornecedorRequest): Promise<Fornecedor> {
    return apiRequest<Fornecedor>('/fornecedores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar fornecedor
  async update(id: number, data: UpdateFornecedorRequest): Promise<Fornecedor> {
    return apiRequest<Fornecedor>(`/fornecedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar fornecedor
  async delete(id: number): Promise<void> {
    await apiRequest<void>(`/fornecedores/${id}`, {
      method: 'DELETE',
    });
  },

  // Buscar fornecedores por status
  async getByStatus(status: string): Promise<Fornecedor[]> {
    return apiRequest<Fornecedor[]>(`/fornecedores/status?status=${encodeURIComponent(status)}`);
  },

  // Buscar fornecedores por categoria
  async getByCategoria(categoria: string): Promise<Fornecedor[]> {
    return apiRequest<Fornecedor[]>(`/fornecedores/categoria?categoria=${encodeURIComponent(categoria)}`);
  },

  // Buscar fornecedores (com termo de busca)
  async search(query: string): Promise<Fornecedor[]> {
    return apiRequest<Fornecedor[]>(`/fornecedores/search?q=${encodeURIComponent(query)}`);
  },

  // Obter estatísticas dos fornecedores
  async getStats(): Promise<FornecedorStats> {
    return apiRequest<FornecedorStats>('/fornecedores/stats');
  },
};

// ============================================
// HOOKS PERSONALIZADOS (para usar com React Query)
// ============================================

export const fornecedoresQueryKeys = {
  all: ['fornecedores'] as const,
  lists: () => [...fornecedoresQueryKeys.all, 'list'] as const,
  list: (params?: FornecedorSearchParams) => [...fornecedoresQueryKeys.lists(), params] as const,
  details: () => [...fornecedoresQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...fornecedoresQueryKeys.details(), id] as const,
  stats: () => [...fornecedoresQueryKeys.all, 'stats'] as const,
  byStatus: (status: string) => [...fornecedoresQueryKeys.all, 'status', status] as const,
  byCategoria: (categoria: string) => [...fornecedoresQueryKeys.all, 'categoria', categoria] as const,
  search: (query: string) => [...fornecedoresQueryKeys.all, 'search', query] as const,
};

// Utilitários para formatação
export const fornecedorUtils = {
  // Formatar CNPJ
  formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  },

  // Formatar CEP
  formatCEP(cep: string): string {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep;
  },

  // Formatar telefone
  formatTelefone(telefone: string): string {
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  },

  // Validar CNPJ
  isValidCNPJ(cnpj: string): boolean {
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;

    return digit1 === parseInt(cleaned.charAt(12)) && digit2 === parseInt(cleaned.charAt(13));
  },

  // Obter status badge color
  getStatusColor(status: FornecedorStatus): string {
    switch (status) {
      case FornecedorStatus.ATIVO:
        return 'bg-green-100 text-green-800';
      case FornecedorStatus.INATIVO:
        return 'bg-red-100 text-red-800';
      case FornecedorStatus.PENDENTE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Obter categoria badge color
  getCategoriaColor(categoria: string): string {
    switch (categoria) {
      case FornecedorCategoria.DISTRIBUIDOR:
        return 'bg-blue-100 text-blue-800';
      case FornecedorCategoria.FABRICANTE:
        return 'bg-purple-100 text-purple-800';
      case FornecedorCategoria.IMPORTADOR:
        return 'bg-indigo-100 text-indigo-800';
      case FornecedorCategoria.PRESTADOR_SERVICO:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
};
