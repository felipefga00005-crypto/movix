const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Fornecedor {
  id: string;
  tipo: 'FISICA' | 'JURIDICA';
  documento: string;
  nome: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipioId: string;
  estadoId: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  contato?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  municipio?: {
    id: string;
    nome: string;
    estado: {
      id: string;
      nome: string;
      uf: string;
    };
  };
  estado?: {
    id: string;
    nome: string;
    uf: string;
  };
}

export interface CreateFornecedorData {
  tipo: 'FISICA' | 'JURIDICA';
  documento: string;
  nome: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cep: string;
  municipioId: string;
  estadoId: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  contato?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface FornecedoresResponse {
  data: Fornecedor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class FornecedorService {
  static async getAll(page = 1, limit = 10, search?: string): Promise<FornecedoresResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}/fornecedores?${params}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fornecedores');
    }
    return response.json();
  }

  static async getById(id: string): Promise<Fornecedor> {
    const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fornecedor');
    }
    return response.json();
  }

  static async getByDocumento(documento: string): Promise<Fornecedor> {
    const response = await fetch(`${API_BASE_URL}/fornecedores/documento/${documento}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fornecedor por documento');
    }
    return response.json();
  }

  static async getForSelect(): Promise<{ id: string; nome: string; documento: string }[]> {
    const response = await fetch(`${API_BASE_URL}/fornecedores/select`);
    if (!response.ok) {
      throw new Error('Erro ao buscar fornecedores para seleção');
    }
    const data = await response.json();
    return data.data || data;
  }

  static async create(data: CreateFornecedorData): Promise<Fornecedor> {
    const response = await fetch(`${API_BASE_URL}/fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar fornecedor');
    }

    return response.json();
  }

  static async update(id: string, data: Partial<CreateFornecedorData>): Promise<Fornecedor> {
    const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar fornecedor');
    }

    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir fornecedor');
    }
  }
}
