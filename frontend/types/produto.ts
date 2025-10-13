/**
 * Tipos TypeScript para Produto
 */

export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco: number;
  preco_custo: number;
  estoque: number;
  estoque_minimo: number;
  unidade: string;
  status: string;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
  data_cadastro: string;
  data_ultima_venda?: string;
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

export interface UpdateProdutoRequest extends Partial<CreateProdutoRequest> {
  id: number;
}

export interface ProdutoStats {
  total: number;
  ativos: number;
  inativos: number;
  estoque_baixo: number;
  valor_total_estoque: number;
}

