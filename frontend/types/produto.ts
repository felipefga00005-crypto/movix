/**
 * Tipos relacionados a Produtos
 * Alinhado com backend/internal/models/produto.go
 */

export interface Produto {
  id: number

  // Identificação
  nome: string
  codigo: string
  codigo_barras?: string
  sku?: string

  // Descrição
  descricao?: string
  descricao_curta?: string
  marca?: string
  modelo?: string

  // Classificação
  categoria?: string
  subcategoria?: string
  grupo?: string
  subgrupo?: string

  // Unidades
  unidade_medida: string // UN, KG, M, L, etc.
  unidade_compra?: string
  unidade_venda?: string
  fator_conversao?: number

  // Preços
  preco: number
  preco_custo: number
  preco_promocional?: number
  margem_lucro?: number
  markup?: number

  // Estoque
  estoque: number
  estoque_minimo?: number
  estoque_maximo?: number
  ponto_reposicao?: number

  // Fornecedor
  fornecedor_principal?: string // Será melhorado para relacionamento
  codigo_fornecedor?: string

  // Dados Fiscais
  ncm?: string
  cest?: string
  cfop_entrada?: string
  cfop_saida?: string
  cst_icms?: string
  cst_pis?: string
  cst_cofins?: string
  aliquota_icms?: number
  aliquota_pis?: number
  aliquota_cofins?: number
  origem?: number // 0=Nacional, 1=Estrangeira, etc.

  // Dimensões e Peso
  peso_bruto?: number
  peso_liquido?: number
  altura?: number
  largura?: number
  profundidade?: number
  volume?: number

  // Status e Controle
  ativo: boolean
  destaque?: boolean
  promocao?: boolean
  controla_estoque: boolean
  permite_venda_estoque_zerado?: boolean

  // Datas
  data_cadastro?: string
  data_ultima_compra?: string
  data_ultima_venda?: string
  data_validade?: string
  created_at: string
  updated_at: string
  deleted_at?: string

  // Campos Personalizados
  campos_personalizados?: ProdutoCampoPersonalizado[]

  // Observações
  observacoes?: string
  observacoes_internas?: string

  // Localização no Estoque
  localizacao?: string
  corredor?: string
  prateleira?: string
  posicao?: string
}

export interface ProdutoCampoPersonalizado {
  id?: number
  produto_id: number
  nome: string
  valor: string
  ordem: number
  created_at?: string
  updated_at?: string
}

export interface CreateProdutoRequest {
  // Identificação
  nome: string
  codigo?: string
  codigoBarras?: string
  sku?: string

  // Descrição
  descricao?: string
  descricaoCurta?: string
  marca?: string
  modelo?: string

  // Classificação
  categoria?: string
  subcategoria?: string
  grupo?: string
  subgrupo?: string

  // Unidades
  unidadeMedida: string
  unidadeCompra?: string
  unidadeVenda?: string
  fatorConversao?: number

  // Preços
  preco: number
  precoCusto: number
  precoPromocional?: number
  margemLucro?: number
  markup?: number

  // Estoque
  estoque?: number
  estoqueMinimo?: number
  estoqueMaximo?: number
  pontoReposicao?: number

  // Fornecedor
  fornecedorPrincipal?: string
  codigoFornecedor?: string

  // Dados Fiscais
  ncm?: string
  cest?: string
  cfopEntrada?: string
  cfopSaida?: string
  cstIcms?: string
  cstPis?: string
  cstCofins?: string
  aliquotaIcms?: number
  aliquotaPis?: number
  aliquotaCofins?: number
  origem?: number

  // Dimensões e Peso
  pesoBruto?: number
  pesoLiquido?: number
  altura?: number
  largura?: number
  profundidade?: number
  volume?: number

  // Status e Controle
  ativo?: boolean
  destaque?: boolean
  promocao?: boolean
  controlaEstoque?: boolean
  permiteVendaEstoqueZerado?: boolean

  // Datas
  dataValidade?: string

  // Observações
  observacoes?: string
  observacoesInternas?: string

  // Localização no Estoque
  localizacao?: string
  corredor?: string
  prateleira?: string
  posicao?: string

  // Campos Personalizados
  camposPersonalizados?: ProdutoCampoPersonalizadoDTO[]
}

export interface UpdateProdutoRequest {
  // Identificação
  nome?: string
  codigo?: string
  codigoBarras?: string
  sku?: string

  // Descrição
  descricao?: string
  descricaoCurta?: string
  marca?: string
  modelo?: string

  // Classificação
  categoria?: string
  subcategoria?: string
  grupo?: string
  subgrupo?: string

  // Unidades
  unidadeMedida?: string
  unidadeCompra?: string
  unidadeVenda?: string
  fatorConversao?: number

  // Preços
  preco?: number
  precoCusto?: number
  precoPromocional?: number
  margemLucro?: number
  markup?: number

  // Estoque
  estoque?: number
  estoqueMinimo?: number
  estoqueMaximo?: number
  pontoReposicao?: number

  // Fornecedor
  fornecedorPrincipal?: string
  codigoFornecedor?: string

  // Dados Fiscais
  ncm?: string
  cest?: string
  cfopEntrada?: string
  cfopSaida?: string
  cstIcms?: string
  cstPis?: string
  cstCofins?: string
  aliquotaIcms?: number
  aliquotaPis?: number
  aliquotaCofins?: number
  origem?: number

  // Dimensões e Peso
  pesoBruto?: number
  pesoLiquido?: number
  altura?: number
  largura?: number
  profundidade?: number
  volume?: number

  // Status e Controle
  ativo?: boolean
  destaque?: boolean
  promocao?: boolean
  controlaEstoque?: boolean
  permiteVendaEstoqueZerado?: boolean

  // Datas
  dataValidade?: string

  // Observações
  observacoes?: string
  observacoesInternas?: string

  // Localização no Estoque
  localizacao?: string
  corredor?: string
  prateleira?: string
  posicao?: string

  // Campos Personalizados
  camposPersonalizados?: ProdutoCampoPersonalizadoDTO[]
}

export interface ProdutoCampoPersonalizadoDTO {
  id?: number
  nome: string
  valor: string
  ordem: number
}

export interface ProdutoStats {
  total: number
  ativos: number
  inativos: number
  emPromocao?: number
  emDestaque?: number
  baixoEstoque?: number
  semEstoque?: number
  valorTotalEstoque?: number
  valorMedioVenda?: number
  margemLucroMedia?: number
  porCategoria?: Record<string, number>
  porMarca?: Record<string, number>
  porFornecedor?: Record<string, number>
}

// Tipos auxiliares para filtros e busca
export interface ProdutoFilters {
  ativo?: boolean
  categoria?: string[]
  marca?: string[]
  fornecedor?: string[]
  promocao?: boolean
  destaque?: boolean
  baixoEstoque?: boolean
  semEstoque?: boolean
  faixaPreco?: {
    min?: number
    max?: number
  }
  faixaEstoque?: {
    min?: number
    max?: number
  }
}

export interface ProdutoSearchParams {
  query?: string
  filters?: ProdutoFilters
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Tipos para movimentação de estoque
export interface MovimentacaoEstoque {
  id: number
  produto_id: number
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'TRANSFERENCIA'
  quantidade: number
  quantidade_anterior: number
  quantidade_atual: number
  valor_unitario?: number
  valor_total?: number
  motivo?: string
  documento?: string
  usuario_id?: number
  usuario_nome?: string
  data_movimentacao: string
  observacoes?: string
}

// Tipos para relatórios
export interface RelatorioProduto {
  produto: Produto
  vendas_periodo: number
  faturamento_periodo: number
  margem_periodo: number
  giro_estoque: number
  dias_estoque: number
  ultima_movimentacao?: string
}
