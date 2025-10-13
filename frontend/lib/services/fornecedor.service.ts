import { api } from '../api';

export interface Fornecedor {
  id: number;
  codigo: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  uf: string;
  cep: string;
  status: string;
  categoria: string;
  contato: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateFornecedorRequest {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  status?: string;
  categoria?: string;
  contato?: string;
}

export interface UpdateFornecedorRequest extends Partial<Omit<CreateFornecedorRequest, 'cnpj'>> {}

export interface FornecedorStats {
  total: number;
  ativos: number;
  inativos: number;
  por_categoria: Record<string, number>;
}

class FornecedorService {
  private readonly basePath = '/fornecedores';

  async getAll(): Promise<Fornecedor[]> {
    return api.get<Fornecedor[]>(this.basePath);
  }

  async getById(id: number): Promise<Fornecedor> {
    return api.get<Fornecedor>(`${this.basePath}/${id}`);
  }

  async create(data: CreateFornecedorRequest): Promise<Fornecedor> {
    return api.post<Fornecedor>(this.basePath, data);
  }

  async update(id: number, data: UpdateFornecedorRequest): Promise<Fornecedor> {
    return api.put<Fornecedor>(`${this.basePath}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return api.delete<void>(`${this.basePath}/${id}`);
  }

  async getByStatus(status: string): Promise<Fornecedor[]> {
    return api.get<Fornecedor[]>(`${this.basePath}/status?status=${status}`);
  }

  async getByCategoria(categoria: string): Promise<Fornecedor[]> {
    return api.get<Fornecedor[]>(`${this.basePath}/categoria?categoria=${encodeURIComponent(categoria)}`);
  }

  async search(query: string): Promise<Fornecedor[]> {
    return api.get<Fornecedor[]>(`${this.basePath}/search?q=${encodeURIComponent(query)}`);
  }

  async getStats(): Promise<FornecedorStats> {
    return api.get<FornecedorStats>(`${this.basePath}/stats`);
  }
}

export const fornecedorService = new FornecedorService();

