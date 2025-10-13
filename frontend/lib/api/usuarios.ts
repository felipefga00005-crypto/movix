import {
  Usuario,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  ChangePasswordRequest,
  UsuarioStats,
  UsuarioStatus,
  UsuarioPerfil,
  UsuarioSearchParams
} from '@/types/usuario';

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
// SERVIÇOS DE USUÁRIOS
// ============================================



export const usuariosAPI = {
  // Listar todos os usuários
  async getAll(params?: UsuarioSearchParams): Promise<Usuario[]> {
    let endpoint = '/usuarios';
    
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
    
    return apiRequest<Usuario[]>(endpoint);
  },

  // Buscar usuário por ID
  async getById(id: number): Promise<Usuario> {
    return apiRequest<Usuario>(`/usuarios/${id}`);
  },

  // Criar novo usuário
  async create(data: CreateUsuarioRequest): Promise<Usuario> {
    return apiRequest<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Atualizar usuário
  async update(id: number, data: UpdateUsuarioRequest): Promise<Usuario> {
    return apiRequest<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Deletar usuário
  async delete(id: number): Promise<void> {
    await apiRequest<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  // Alterar senha
  async changePassword(id: number, data: ChangePasswordRequest): Promise<void> {
    await apiRequest<void>(`/usuarios/${id}/senha`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Buscar usuários por status
  async getByStatus(status: string): Promise<Usuario[]> {
    return apiRequest<Usuario[]>(`/usuarios/status?status=${encodeURIComponent(status)}`);
  },

  // Buscar usuários por perfil
  async getByPerfil(perfil: string): Promise<Usuario[]> {
    return apiRequest<Usuario[]>(`/usuarios/perfil?perfil=${encodeURIComponent(perfil)}`);
  },

  // Buscar usuários (com termo de busca)
  async search(query: string): Promise<Usuario[]> {
    return apiRequest<Usuario[]>(`/usuarios/search?q=${encodeURIComponent(query)}`);
  },

  // Obter estatísticas dos usuários
  async getStats(): Promise<UsuarioStats> {
    return apiRequest<UsuarioStats>('/usuarios/stats');
  },
};

// ============================================
// HOOKS PERSONALIZADOS (para usar com React Query)
// ============================================

export const usuariosQueryKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosQueryKeys.all, 'list'] as const,
  list: (params?: UsuarioSearchParams) => [...usuariosQueryKeys.lists(), params] as const,
  details: () => [...usuariosQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosQueryKeys.details(), id] as const,
  stats: () => [...usuariosQueryKeys.all, 'stats'] as const,
  byStatus: (status: string) => [...usuariosQueryKeys.all, 'status', status] as const,
  byPerfil: (perfil: string) => [...usuariosQueryKeys.all, 'perfil', perfil] as const,
  search: (query: string) => [...usuariosQueryKeys.all, 'search', query] as const,
};

// Utilitários para formatação
export const usuarioUtils = {
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

  // Obter status badge color
  getStatusColor(status: UsuarioStatus): string {
    switch (status) {
      case UsuarioStatus.ATIVO:
        return 'bg-green-100 text-green-800';
      case UsuarioStatus.INATIVO:
        return 'bg-red-100 text-red-800';
      case UsuarioStatus.PENDENTE:
        return 'bg-yellow-100 text-yellow-800';
      case UsuarioStatus.BLOQUEADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Obter perfil badge color
  getPerfilColor(perfil: UsuarioPerfil): string {
    switch (perfil) {
      case UsuarioPerfil.ADMIN:
        return 'bg-purple-100 text-purple-800';
      case UsuarioPerfil.GERENTE:
        return 'bg-blue-100 text-blue-800';
      case UsuarioPerfil.VENDEDOR:
        return 'bg-green-100 text-green-800';
      case UsuarioPerfil.OPERADOR:
        return 'bg-gray-100 text-gray-800';
      case UsuarioPerfil.FINANCEIRO:
        return 'bg-yellow-100 text-yellow-800';
      case UsuarioPerfil.ESTOQUE:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  // Obter nome do perfil
  getPerfilName(perfil: UsuarioPerfil): string {
    switch (perfil) {
      case UsuarioPerfil.ADMIN:
        return 'Administrador';
      case UsuarioPerfil.GERENTE:
        return 'Gerente';
      case UsuarioPerfil.VENDEDOR:
        return 'Vendedor';
      case UsuarioPerfil.OPERADOR:
        return 'Operador';
      case UsuarioPerfil.FINANCEIRO:
        return 'Financeiro';
      case UsuarioPerfil.ESTOQUE:
        return 'Estoque';
      default:
        return perfil;
    }
  },

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar senha
  isValidPassword(password: string): boolean {
    // Mínimo 8 caracteres, pelo menos 1 letra e 1 número
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Gerar avatar inicial
  generateAvatarInitials(nome: string): string {
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  // Formatar último acesso
  formatUltimoAcesso(ultimoAcesso?: string): string {
    if (!ultimoAcesso) return 'Nunca acessou';

    const date = new Date(ultimoAcesso);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';

    return date.toLocaleDateString('pt-BR');
  },

  // Verificar se usuário está online (último acesso < 5 min)
  isOnline(ultimoAcesso?: string): boolean {
    if (!ultimoAcesso) return false;

    const date = new Date(ultimoAcesso);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    return diffInMinutes < 5;
  },
};
