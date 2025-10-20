const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Produto {
  id: string;
  codigo: string;
  codigoBarras?: string;
  descricao: string;
  descricaoComplementar?: string;
  ncmId: string;
  cestId?: string;
  unidade: string;
  unidadeTributavel?: string;
  valorUnitario: number;
  valorCusto?: number;
  margemLucro?: number;
  estoqueAtual: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  origem: number;
  cstIcms: string;
  aliquotaIcms?: number;
  reducaoBaseIcms?: number;
  cstIpi?: string;
  aliquotaIpi?: number;
  cstPis?: string;
  aliquotaPis?: number;
  cstCofins?: string;
  aliquotaCofins?: number;
  fornecedorId?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  ncm?: {
    id: string;
    codigo: string;
    descricao: string;
  };
  cest?: {
    id: string;
    codigo: string;
    descricao: string;
  };
  fornecedor?: {
    id: string;
    nome: string;
    documento: string;
  };
}

export interface CreateProdutoData {
  codigo: string;
  codigoBarras?: string;
  descricao: string;
  descricaoComplementar?: string;
  ncmId: string;
  cestId?: string;
  unidade: string;
  unidadeTributavel?: string;
  valorUnitario: number;
  valorCusto?: number;
  margemLucro?: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  origem: number;
  cstIcms: string;
  aliquotaIcms?: number;
  reducaoBaseIcms?: number;
  cstIpi?: string;
  aliquotaIpi?: number;
  cstPis?: string;
  aliquotaPis?: number;
  cstCofins?: string;
  aliquotaCofins?: number;
  fornecedorId?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface ProdutosResponse {
  data: Produto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ProdutoService {
  static async getAll(page = 1, limit = 10, search?: string): Promise<ProdutosResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE_URL}/produtos?${params}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }
    return response.json();
  }

  static async getById(id: string): Promise<Produto> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produto');
    }
    return response.json();
  }

  static async getByCodigo(codigo: string): Promise<Produto> {
    const response = await fetch(`${API_BASE_URL}/produtos/codigo/${codigo}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produto por código');
    }
    return response.json();
  }

  static async getForSelect(): Promise<{ id: string; codigo: string; descricao: string; valorUnitario: number }[]> {
    const response = await fetch(`${API_BASE_URL}/produtos/select`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos para seleção');
    }
    const data = await response.json();
    return data.data;
  }

  static async create(data: CreateProdutoData): Promise<Produto> {
    const response = await fetch(`${API_BASE_URL}/produtos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar produto');
    }
    
    return response.json();
  }

  static async update(id: string, data: Partial<CreateProdutoData>): Promise<Produto> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar produto');
    }
    
    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao excluir produto');
    }
  }

  static async getForSelect(): Promise<{ id: string; codigo: string; descricao: string; valorUnitario: number; unidade: string; estoqueAtual: number }[]> {
    const response = await fetch(`${API_BASE_URL}/produtos/select`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos para seleção');
    }
    const data = await response.json();
    return data.data || data;
  }

  static async updateEstoque(id: string, quantidade: number, operacao: 'ENTRADA' | 'SAIDA'): Promise<Produto> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}/estoque`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantidade, operacao }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar estoque');
    }

    return response.json();
  }
}
