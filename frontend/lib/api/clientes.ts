import {
  Cliente,
  CreateClienteRequest,
  UpdateClienteRequest,
  ClienteResponse,
  ClientesResponse,
  ClienteStats,
  ClienteStatsResponse,
  ClienteSearchParams,
  EnderecoViaCEP,
  EmpresaReceitaWS
} from '@/types/cliente';

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
// SERVIÇOS DE CLIENTES
// ============================================

export const clientesAPI = {
  // Listar todos os clientes
  async getAll(params?: ClienteSearchParams): Promise<Cliente[]> {
    let endpoint = '/clientes';
    
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
    
    return apiRequest<Cliente[]>(endpoint);
  },

  // Buscar cliente por ID
  async getById(id: number): Promise<Cliente> {
    return apiRequest<Cliente>(`/clientes/${id}`);
  },

  // Criar novo cliente
  async create(data: CreateClienteRequest): Promise<Cliente> {
    return apiRequest<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar cliente
  async update(id: number, data: UpdateClienteRequest): Promise<Cliente> {
    return apiRequest<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar cliente
  async delete(id: number): Promise<void> {
    await apiRequest<void>(`/clientes/${id}`, {
      method: 'DELETE',
    });
  },

  // Buscar clientes por status
  async getByStatus(status: string): Promise<Cliente[]> {
    return apiRequest<Cliente[]>(`/clientes/status?status=${encodeURIComponent(status)}`);
  },

  // Buscar clientes (com termo de busca)
  async search(query: string): Promise<Cliente[]> {
    return apiRequest<Cliente[]>(`/clientes/search?q=${encodeURIComponent(query)}`);
  },

  // Obter estatísticas dos clientes
  async getStats(): Promise<ClienteStats> {
    return apiRequest<ClienteStats>('/clientes/stats');
  },
};

// ============================================
// SERVIÇOS DE APIS EXTERNAS
// ============================================

export const externalAPI = {
  // Buscar CEP
  async buscarCEP(cep: string): Promise<EnderecoViaCEP> {
    const cepLimpo = cep.replace(/\D/g, '');
    return apiRequest<EnderecoViaCEP>(`/cep/${cepLimpo}`);
  },

  // Buscar CNPJ
  async buscarCNPJ(cnpj: string): Promise<EmpresaReceitaWS> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return apiRequest<EmpresaReceitaWS>(`/cnpj/${cnpjLimpo}`);
  },

  // Listar estados
  async listarEstados(): Promise<Array<{id: number, sigla: string, nome: string}>> {
    return apiRequest<Array<{id: number, sigla: string, nome: string}>>('/estados');
  },

  // Listar cidades por estado
  async listarCidades(uf: string): Promise<Array<{nome: string, codigoIBGE: string}>> {
    return apiRequest<Array<{nome: string, codigoIBGE: string}>>(`/estados/${uf}/cidades`);
  },

  // Buscar localização completa por CEP
  async buscarLocalizacaoCompleta(cep: string): Promise<{
    endereco: EnderecoViaCEP;
    estado: {id: number, sigla: string, nome: string};
    cidade: {nome: string, codigoIBGE: string};
  }> {
    const cepLimpo = cep.replace(/\D/g, '');
    return apiRequest(`/localizacao/${cepLimpo}`);
  },

  // Buscar dados para formulário (estados e outras informações)
  async buscarDadosFormulario(): Promise<{
    estados: Array<{id: number, sigla: string, nome: string}>;
    tiposContato: string[];
    statusOptions: string[];
  }> {
    return apiRequest('/formulario/dados');
  },
};

// ============================================
// HOOKS PERSONALIZADOS (para usar com React Query)
// ============================================

export const clientesQueryKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesQueryKeys.all, 'list'] as const,
  list: (params?: ClienteSearchParams) => [...clientesQueryKeys.lists(), params] as const,
  details: () => [...clientesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientesQueryKeys.details(), id] as const,
  stats: () => [...clientesQueryKeys.all, 'stats'] as const,
  byStatus: (status: string) => [...clientesQueryKeys.all, 'status', status] as const,
  search: (query: string) => [...clientesQueryKeys.all, 'search', query] as const,
};

// Utilitários para formatação
export const clienteUtils = {
  // Formatar CPF/CNPJ
  formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  },

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

  // Validar CPF
  isValidCPF(cpf: string): boolean {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleaned.charAt(10));
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

  // Determinar se é CPF ou CNPJ
  getDocumentType(document: string): 'CPF' | 'CNPJ' | 'INVALID' {
    const cleaned = document.replace(/\D/g, '');
    if (cleaned.length === 11 && this.isValidCPF(document)) return 'CPF';
    if (cleaned.length === 14 && this.isValidCNPJ(document)) return 'CNPJ';
    return 'INVALID';
  },
};
