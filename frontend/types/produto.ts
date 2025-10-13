// Tipos baseados no modelo Produto do backend Go

export interface Produto {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco: number;
  precoCusto?: number;
  estoque: number;
  estoqueMinimo: number;
  unidade: string;
  status: ProdutoStatus;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
  dataCadastro: string;
  dataUltimaVenda?: string;
  dataAtualizacao: string;
}

export enum ProdutoStatus {
  ATIVO = "Ativo",
  INATIVO = "Inativo",
  DESCONTINUADO = "Descontinuado"
}

export enum ProdutoCategoria {
  INFORMATICA = "Informática",
  ELETRONICOS = "Eletrônicos",
  CASA_JARDIM = "Casa e Jardim",
  ROUPAS_ACESSORIOS = "Roupas e Acessórios",
  LIVROS = "Livros",
  ESPORTES = "Esportes",
  BELEZA_SAUDE = "Beleza e Saúde",
  AUTOMOTIVO = "Automotivo",
  BRINQUEDOS = "Brinquedos",
  OUTROS = "Outros"
}

export enum ProdutoUnidade {
  UN = "UN",
  KG = "KG",
  L = "L",
  M = "M",
  M2 = "M²",
  M3 = "M³",
  CX = "CX",
  PC = "PC",
  PAR = "PAR",
  DZIA = "DZIA"
}

export interface CreateProdutoRequest {
  nome: string;
  codigo?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco: number;
  precoCusto?: number;
  estoque?: number;
  estoqueMinimo?: number;
  unidade?: string;
  status?: string;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
}

export interface UpdateProdutoRequest {
  nome?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco?: number;
  precoCusto?: number;
  estoque?: number;
  estoqueMinimo?: number;
  unidade?: string;
  status?: string;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
}

export interface UpdateEstoqueRequest {
  quantidade: number;
  operacao: 'adicionar' | 'remover' | 'ajustar';
}

export interface ProdutoStats {
  total: number;
  ativos: number;
  inativos: number;
  descontinuados: number;
  estoqueBaixo: number;
  valorTotalEstoque: number;
  porCategoria: Record<string, number>;
  porMarca: Record<string, number>;
  porFornecedor: Record<string, number>;
}

// Tipos para respostas da API
export interface ProdutoResponse {
  data: Produto;
  message?: string;
}

export interface ProdutosResponse {
  data: Produto[];
  message?: string;
}

export interface ProdutoStatsResponse {
  data: ProdutoStats;
  message?: string;
}

// Tipos para filtros e busca
export interface ProdutoFilters {
  status?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  fornecedor?: string;
  estoqueBaixo?: boolean;
  precoMin?: number;
  precoMax?: number;
  search?: string;
}

export interface ProdutoSearchParams {
  page?: number;
  limit?: number;
  filters?: ProdutoFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para formulários
export interface ProdutoFormData extends Omit<CreateProdutoRequest, 'preco' | 'precoCusto'> {
  preco: string; // Para facilitar input de formulário
  precoCusto?: string;
}

// Tipos para validação
export interface ProdutoValidationErrors {
  nome?: string;
  codigo?: string;
  categoria?: string;
  preco?: string;
  precoCusto?: string;
  estoque?: string;
  estoqueMinimo?: string;
  unidade?: string;
  fornecedor?: string;
  [key: string]: string | undefined;
}

// Tipos para relatórios
export interface ProdutoRelatorio {
  produto: Produto;
  vendas: {
    quantidade: number;
    valor: number;
    periodo: string;
  };
  movimentacoes: Array<{
    tipo: 'entrada' | 'saida' | 'ajuste';
    quantidade: number;
    data: string;
    observacao?: string;
  }>;
}

// Tipos para importação/exportação
export interface ProdutoImportData {
  nome: string;
  codigo?: string;
  categoria?: string;
  subcategoria?: string;
  marca?: string;
  modelo?: string;
  preco: number;
  precoCusto?: number;
  estoque?: number;
  estoqueMinimo?: number;
  unidade?: string;
  fornecedor?: string;
  descricao?: string;
  peso?: string;
  dimensoes?: string;
  garantia?: string;
}

export interface ProdutoExportData extends Produto {
  margemLucro?: number;
  valorEstoque?: number;
  statusEstoque?: 'Normal' | 'Baixo' | 'Zerado';
}

// Tipos para movimentação de estoque
export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produto?: Produto;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'inventario';
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  motivo?: string;
  observacao?: string;
  usuarioId?: number;
  usuario?: string;
  dataMovimentacao: string;
}

export interface CreateMovimentacaoRequest {
  produtoId: number;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'inventario';
  quantidade: number;
  motivo?: string;
  observacao?: string;
}

// Tipos para alertas de estoque
export interface AlertaEstoque {
  produto: Produto;
  tipo: 'estoque_baixo' | 'estoque_zerado' | 'estoque_negativo';
  mensagem: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  dataAlerta: string;
}

// Tipos para preços e promoções
export interface ProdutoPreco {
  id: number;
  produtoId: number;
  tipoPreco: 'venda' | 'promocional' | 'atacado' | 'custo';
  valor: number;
  dataInicio?: string;
  dataFim?: string;
  ativo: boolean;
  observacao?: string;
}

export interface CreatePrecoRequest {
  produtoId: number;
  tipoPreco: 'venda' | 'promocional' | 'atacado' | 'custo';
  valor: number;
  dataInicio?: string;
  dataFim?: string;
  observacao?: string;
}

// Tipos para códigos de barras
export interface CodigoBarras {
  id: number;
  produtoId: number;
  codigo: string;
  tipo: 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'INTERNO';
  principal: boolean;
  ativo: boolean;
  dataCadastro: string;
}

export interface CreateCodigoBarrasRequest {
  produtoId: number;
  codigo: string;
  tipo: 'EAN13' | 'EAN8' | 'CODE128' | 'CODE39' | 'INTERNO';
  principal?: boolean;
}

// Tipos para imagens do produto
export interface ProdutoImagem {
  id: number;
  produtoId: number;
  url: string;
  nome: string;
  tamanho: number;
  tipo: string;
  principal: boolean;
  ordem: number;
  dataCadastro: string;
}

export interface UploadImagemRequest {
  produtoId: number;
  arquivo: File;
  principal?: boolean;
  ordem?: number;
}
