/**
 * Tipos TypeScript para Fornecedor
 */

export interface Fornecedor {
  id: number;
  codigo: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  status: string;
  categoria?: string;
  contato?: string;
  data_cadastro: string;
  data_atualizacao: string;
}

export interface CreateFornecedorRequest {
  razao_social: string;
  nome_fantasia?: string;
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

export interface UpdateFornecedorRequest extends Partial<CreateFornecedorRequest> {
  id: number;
}

export interface FornecedorStats {
  total: number;
  ativos: number;
  inativos: number;
  por_categoria: Record<string, number>;
}

