import { api } from '../api';

export interface Produto {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  modelo: string;
  preco: number;
  preco_custo: number;
  estoque: number;
  estoque_minimo: number;
  unidade: string;
  status: string;
  fornecedor: string;
  descricao: string;
  peso: string;
  dimensoes: string;
  garantia: string;
  data_cadastro: string;
  data_ultima_venda: string;
  data_atualizacao: string;
}

export interface CreateProdutoRequest {
  nome: string;
  codigo?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco: number;
  preco_custo?: number;
  estoque?: number;
  estoque_minimo?: number;
  unidade?: string;
  status?: string;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
}

export interface UpdateProdutoRequest extends Partial<CreateProdutoRequest> {}

export interface UpdateEstoqueRequest {
  quantidade: number;
  operacao: 'adicionar' | 'remover' | 'definir';
}

export interface ProdutoStats {
  total: number;
  ativos: number;
  estoque_baixo: number;
  valor_total_estoque: number;
}

class ProdutoService {
  private readonly basePath = '/produtos';

  async getAll(): Promise<Produto[]> {
    return api.get<Produto[]>(this.basePath);
  }

  async getById(id: number): Promise<Produto> {
    return api.get<Produto>(`${this.basePath}/${id}`);
  }

  async create(data: CreateProdutoRequest): Promise<Produto> {
    return api.post<Produto>(this.basePath, data);
  }

  async update(id: number, data: UpdateProdutoRequest): Promise<Produto> {
    return api.put<Produto>(`${this.basePath}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  async updateEstoque(id: number, data: UpdateEstoqueRequest): Promise<Produto> {
    return api.put<Produto>(`${this.basePath}/${id}/estoque`, data);
  }

  async getByStatus(status: string): Promise<Produto[]> {
    return api.get<Produto[]>(`${this.basePath}/status?status=${status}`);
  }

  async getByCategoria(categoria: string): Promise<Produto[]> {
    return api.get<Produto[]>(`${this.basePath}/categoria?categoria=${encodeURIComponent(categoria)}`);
  }

  async getEstoqueBaixo(): Promise<Produto[]> {
    return api.get<Produto[]>(`${this.basePath}/estoque-baixo`);
  }

  async search(query: string): Promise<Produto[]> {
    return api.get<Produto[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`);
  }

  async getStats(): Promise<ProdutoStats> {
    return api.get<ProdutoStats>(`${this.basePath}/stats`);
  }
}

export const produtoService = new ProdutoService();

