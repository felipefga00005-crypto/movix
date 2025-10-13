// ============================================
// TIPOS BASEADOS NOS MODELS DO BACKEND GO
// ============================================

// Tipos base
export type Status = "Ativo" | "Inativo" | "Pendente"
export type Perfil = "Admin" | "Gerente" | "Vendedor" | "Operador"
export type CategoriaProduto = string
export type CategoriaFornecedor = "Fabricante" | "Distribuidor" | "Importador" | "Prestador de Serviço"

// ============================================
// USUÁRIO
// ============================================
export interface Usuario {
  id: number
  codigo?: string  // Adicionado campo do schema
  nome: string
  email: string
  senha?: string // Apenas para criação/atualização
  telefone?: string
  cargo?: string  // Adicionado campo do schema
  departamento?: string  // Adicionado campo do schema
  perfil: string  // Mudado de Perfil para string
  status: string  // Mudado de Status para string
  avatar?: string
  ultimoAcesso?: string
  dataCadastro?: string  // Mudado de createdAt
}

export interface CreateUsuarioDTO {
  nome: string
  email: string
  senha: string
  telefone?: string
  cargo?: string
  departamento?: string
  perfil: string
  status?: string
  avatar?: string
}

export interface UpdateUsuarioDTO {
  nome?: string
  email?: string
  telefone?: string
  cargo?: string
  departamento?: string
  perfil?: string
  status?: string
  avatar?: string
}

export interface UpdateSenhaDTO {
  senhaAtual: string
  novaSenha: string
}

export interface UsuarioStats {
  total: number
  ativos: number
  inativos: number
  pendentes: number
  porPerfil: Array<{
    Perfil: string
    Count: number
  }>
}

// ============================================
// CLIENTE
// ============================================
// Tipo para campos personalizados dinâmicos
export interface CampoPersonalizado {
  id?: number
  nome: string
  valor: string
  ordem?: number
}

export interface Cliente {
  id: number
  // Dados Básicos
  cpf: string
  ieRg?: string // Campo unificado RG/IE (renomeado de rgIe)
  inscricaoMunicipal?: string
  nome: string
  nomeFantasia?: string
  tipoContato?: string
  consumidorFinal?: boolean

  // Contatos
  email?: string
  pontoReferencia?: string
  telefoneFixo?: string // Telefone principal (unificado)
  telefoneAlternativo?: string
  celular?: string

  // Endereço Principal
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  codigoIbge?: string

  // Endereço de Entrega
  cepEntrega?: string
  enderecoEntrega?: string
  numeroEntrega?: string
  complementoEntrega?: string
  bairroEntrega?: string
  cidadeEntrega?: string
  estadoEntrega?: string

  // Dados Financeiros
  limiteCredito?: string
  saldoInicial?: string
  prazoPagamento?: string

  // Campos Personalizados Dinâmicos
  camposPersonalizados?: CampoPersonalizado[]

  // Campos de Sistema
  dataNascimento?: string
  dataAbertura?: string
  status?: string
  dataCadastro?: string
  ultimaCompra?: string
  dataAtualizacao?: string
  observacoes?: string

  // Campos para compatibilidade com frontend existente
  rgIe?: string // Alias para ieRg
  inscricaoEstadual?: string // Alias para ieRg
  telefone?: string // Alias para telefoneFixo
}

export interface CreateClienteDTO {
  // Dados Básicos
  cpf: string
  ieRg?: string // Campo unificado RG/IE
  inscricaoMunicipal?: string
  nome: string
  nomeFantasia?: string
  tipoContato?: string
  consumidorFinal?: boolean

  // Contatos
  email?: string
  pontoReferencia?: string
  telefoneFixo?: string // Telefone principal (unificado)
  telefoneAlternativo?: string
  celular?: string

  // Endereço Principal
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  codigoIbge?: string

  // Endereço de Entrega
  cepEntrega?: string
  enderecoEntrega?: string
  numeroEntrega?: string
  complementoEntrega?: string
  bairroEntrega?: string
  cidadeEntrega?: string
  estadoEntrega?: string

  // Dados Financeiros
  limiteCredito?: string
  saldoInicial?: string
  prazoPagamento?: string

  // Campos Personalizados Dinâmicos
  camposPersonalizados?: CampoPersonalizado[]

  // Campos de Sistema
  dataNascimento?: string
  dataAbertura?: string
  status?: string
  observacoes?: string
}

export interface UpdateClienteDTO {
  // Dados Básicos
  cpf?: string
  ieRg?: string // Campo unificado RG/IE
  inscricaoMunicipal?: string
  nome?: string
  nomeFantasia?: string
  tipoContato?: string
  consumidorFinal?: boolean

  // Contatos
  email?: string
  pontoReferencia?: string
  telefoneFixo?: string // Telefone principal (unificado)
  telefoneAlternativo?: string
  celular?: string

  // Endereço Principal
  cep?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  codigoIbge?: string

  // Endereço de Entrega
  cepEntrega?: string
  enderecoEntrega?: string
  numeroEntrega?: string
  complementoEntrega?: string
  bairroEntrega?: string
  cidadeEntrega?: string
  estadoEntrega?: string

  // Dados Financeiros
  limiteCredito?: string
  saldoInicial?: string
  prazoPagamento?: string

  // Campos Personalizados Dinâmicos
  camposPersonalizados?: CampoPersonalizado[]

  // Campos de Sistema
  dataNascimento?: string
  dataAbertura?: string
  status?: string
  dataCadastro?: string
  ultimaCompra?: string
  dataAtualizacao?: string
  observacoes?: string
}

export interface ClienteStats {
  total: number
  ativos: number
  inativos: number
}

// ============================================
// PRODUTO
// ============================================
export interface Produto {
  id: number
  codigo: string
  nome: string
  descricao?: string
  categoria: string  // Mudado de CategoriaProduto para string
  subcategoria?: string  // Adicionado campo do schema
  marca?: string
  modelo?: string  // Adicionado campo do schema
  unidade?: string
  preco: number
  precoCusto?: number
  estoque: number
  estoqueMinimo: number
  status: string  // Mudado de Status para string
  fornecedor?: string  // Adicionado campo do schema
  peso?: string  // Adicionado campo do schema
  dimensoes?: string  // Adicionado campo do schema
  garantia?: string  // Adicionado campo do schema
  codigoBarras?: string
  ncm?: string
  imagem?: string
  observacoes?: string
  dataCadastro?: string  // Mudado de createdAt
  dataUltimaVenda?: string  // Adicionado campo do schema
}

export interface CreateProdutoDTO {
  nome: string
  codigo?: string
  descricao?: string
  categoria: string
  subcategoria?: string
  marca?: string
  modelo?: string
  unidade?: string
  preco: number
  precoCusto?: number
  estoque?: number
  estoqueMinimo?: number
  status?: string
  fornecedor?: string
  peso?: string
  dimensoes?: string
  garantia?: string
  codigoBarras?: string
  ncm?: string
  imagem?: string
  observacoes?: string
}

export interface UpdateProdutoDTO {
  nome?: string
  codigo?: string
  descricao?: string
  categoria?: string
  subcategoria?: string
  marca?: string
  modelo?: string
  unidade?: string
  preco?: number
  precoCusto?: number
  estoqueMinimo?: number
  status?: string
  fornecedor?: string
  peso?: string
  dimensoes?: string
  garantia?: string
  codigoBarras?: string
  ncm?: string
  imagem?: string
  observacoes?: string
}

export interface UpdateEstoqueDTO {
  quantidade: number
  operacao: "adicionar" | "remover" | "ajustar"
}

export interface ProdutoStats {
  total: number
  ativos: number
  inativos: number
  estoqueBaixo: number
  valorTotalEstoque: number
  porCategoria: Array<{
    Categoria: string
    Count: number
  }>
}

// ============================================
// FORNECEDOR
// ============================================
export interface Fornecedor {
  id: number
  codigo: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  email: string
  telefone: string
  celular?: string
  endereco?: string
  cidade?: string
  estado?: string  // Mudado para estado
  uf?: string  // Adicionado campo do schema
  cep?: string
  categoria: string  // Mudado de CategoriaFornecedor para string
  status: string  // Mudado de Status para string
  contato?: string
  observacoes?: string
  dataCadastro?: string  // Mudado de createdAt
}

export interface CreateFornecedorDTO {
  codigo?: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  email: string
  telefone: string
  celular?: string
  endereco?: string
  cidade?: string
  estado?: string
  uf?: string
  cep?: string
  categoria: string
  status?: string
  contato?: string
  observacoes?: string
}

export interface UpdateFornecedorDTO {
  codigo?: string
  razaoSocial?: string
  nomeFantasia?: string
  cnpj?: string
  inscricaoEstadual?: string
  email?: string
  telefone?: string
  celular?: string
  endereco?: string
  cidade?: string
  estado?: string
  uf?: string
  cep?: string
  categoria?: string
  status?: string
  contato?: string
  observacoes?: string
}

export interface FornecedorStats {
  total: number
  ativos: number
  inativos: number
  pendentes: number
  porCategoria: Array<{
    Categoria: string
    Count: number
  }>
}

// ============================================
// CADASTROS AUXILIARES
// ============================================

// CATEGORIA
export interface Categoria {
  id: number
  nome: string
  descricao?: string
  status: string
  dataCadastro?: string
}

export interface CreateCategoriaDTO {
  nome: string
  descricao?: string
  status?: string
}

export interface UpdateCategoriaDTO {
  nome?: string
  descricao?: string
  status?: string
}

export interface CategoriaStats {
  total: number
  ativas: number
  inativas: number
}

// MARCA
export interface Marca {
  id: number
  nome: string
  descricao?: string
  status: string
  dataCadastro?: string
}

export interface CreateMarcaDTO {
  nome: string
  descricao?: string
  status?: string
}

export interface UpdateMarcaDTO {
  nome?: string
  descricao?: string
  status?: string
}

export interface MarcaStats {
  total: number
  ativas: number
  inativas: number
}

// UNIDADE DE MEDIDA
export interface UnidadeMedida {
  id: number
  nome: string
  sigla: string
  descricao?: string
  status: string
  dataCadastro?: string
}

export interface CreateUnidadeMedidaDTO {
  nome: string
  sigla: string
  descricao?: string
  status?: string
}

export interface UpdateUnidadeMedidaDTO {
  nome?: string
  sigla?: string
  descricao?: string
  status?: string
}

export interface UnidadeMedidaStats {
  total: number
  ativas: number
  inativas: number
}

// GRUPO DE PRODUTOS
export interface GrupoProduto {
  id: number
  nome: string
  descricao?: string
  status: string
  dataCadastro?: string
}

export interface CreateGrupoProdutoDTO {
  nome: string
  descricao?: string
  status?: string
}

export interface UpdateGrupoProdutoDTO {
  nome?: string
  descricao?: string
  status?: string
}

export interface GrupoProdutoStats {
  total: number
  ativos: number
  inativos: number
}

// ============================================
// TIPOS DE RESPOSTA DA API
// ============================================
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// FILTROS E QUERIES
// ============================================
export interface QueryParams {
  search?: string
  status?: string  // Usar string em vez de Status enum para compatibilidade
  categoria?: string
  perfil?: string  // Usar string em vez de Perfil enum para compatibilidade
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

