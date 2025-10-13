// Tipos baseados no modelo User do backend Go

export interface Usuario {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil: UsuarioPerfil;
  status: UsuarioStatus;
  avatar?: string;
  ultimoAcesso?: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export enum UsuarioStatus {
  ATIVO = "Ativo",
  INATIVO = "Inativo",
  PENDENTE = "Pendente",
  BLOQUEADO = "Bloqueado"
}

export enum UsuarioPerfil {
  ADMIN = "admin",
  GERENTE = "gerente",
  VENDEDOR = "vendedor",
  OPERADOR = "operador",
  FINANCEIRO = "financeiro",
  ESTOQUE = "estoque",
  SUPORTE = "suporte"
}

export enum UsuarioDepartamento {
  VENDAS = "Vendas",
  FINANCEIRO = "Financeiro",
  ESTOQUE = "Estoque",
  COMPRAS = "Compras",
  MARKETING = "Marketing",
  TI = "TI",
  RH = "RH",
  DIRETORIA = "Diretoria",
  OUTROS = "Outros"
}

export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil?: string;
  status?: string;
  avatar?: string;
}

export interface UpdateUsuarioRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil?: string;
  status?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  senhaAtual?: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface UsuarioStats {
  total: number;
  ativos: number;
  inativos: number;
  pendentes: number;
  bloqueados: number;
  porPerfil: Record<string, number>;
  porDepartamento: Record<string, number>;
  ultimosAcessos: Array<{
    id: number;
    nome: string;
    ultimoAcesso: string;
  }>;
  usuariosOnline: number;
  novosCadastros: {
    hoje: number;
    semana: number;
    mes: number;
  };
}

// Tipos para respostas da API
export interface UsuarioResponse {
  data: Usuario;
  message?: string;
}

export interface UsuariosResponse {
  data: Usuario[];
  message?: string;
}

export interface UsuarioStatsResponse {
  data: UsuarioStats;
  message?: string;
}

// Tipos para filtros e busca
export interface UsuarioFilters {
  status?: string;
  perfil?: string;
  departamento?: string;
  cargo?: string;
  search?: string;
}

export interface UsuarioSearchParams {
  page?: number;
  limit?: number;
  filters?: UsuarioFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Tipos para formulários
export interface UsuarioFormData extends Omit<CreateUsuarioRequest, 'senha'> {
  senha?: string;
  confirmarSenha?: string;
}

// Tipos para validação
export interface UsuarioValidationErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmarSenha?: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil?: string;
  [key: string]: string | undefined;
}

// Tipos para permissões
export interface UsuarioPermissao {
  id: number;
  nome: string;
  descricao: string;
  modulo: string;
  acao: 'criar' | 'ler' | 'atualizar' | 'deletar' | 'todos';
}

export interface PerfilPermissoes {
  perfil: UsuarioPerfil;
  permissoes: UsuarioPermissao[];
}

// Tipos para sessão e autenticação
export interface UsuarioSessao {
  id: number;
  usuarioId: number;
  token: string;
  dispositivo?: string;
  ip?: string;
  userAgent?: string;
  dataLogin: string;
  dataExpiracao: string;
  ativo: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
  lembrarMe?: boolean;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

// Tipos para auditoria
export interface UsuarioAuditoria {
  id: number;
  usuarioId: number;
  usuario?: Usuario;
  acao: string;
  modulo: string;
  detalhes?: string;
  ip?: string;
  userAgent?: string;
  dataAcao: string;
}

export interface CreateAuditoriaRequest {
  usuarioId: number;
  acao: string;
  modulo: string;
  detalhes?: string;
}

// Tipos para notificações
export interface UsuarioNotificacao {
  id: number;
  usuarioId: number;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  lida: boolean;
  dataEnvio: string;
  dataLeitura?: string;
}

export interface CreateNotificacaoRequest {
  usuarioId: number;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
}

// Tipos para configurações do usuário
export interface UsuarioConfiguracao {
  id: number;
  usuarioId: number;
  chave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  descricao?: string;
  dataAtualizacao: string;
}

export interface UpdateConfiguracaoRequest {
  configuracoes: Array<{
    chave: string;
    valor: string;
    tipo: 'string' | 'number' | 'boolean' | 'json';
  }>;
}

// Tipos para relatórios de usuários
export interface UsuarioRelatorio {
  usuario: Usuario;
  estatisticas: {
    totalLogins: number;
    ultimoLogin: string;
    tempoSessaoMedio: number;
    acoesRealizadas: number;
  };
  atividades: Array<{
    data: string;
    acao: string;
    modulo: string;
    detalhes?: string;
  }>;
}

// Tipos para importação/exportação
export interface UsuarioImportData {
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  departamento?: string;
  perfil: string;
  status?: string;
}

export interface UsuarioExportData extends Usuario {
  totalLogins?: number;
  ultimoLoginFormatado?: string;
  statusFormatado?: string;
  perfilFormatado?: string;
}

// Tipos para recuperação de senha
export interface RecuperarSenhaRequest {
  email: string;
}

export interface ResetarSenhaRequest {
  token: string;
  novaSenha: string;
  confirmarSenha: string;
}

// Tipos para verificação de email
export interface VerificarEmailRequest {
  token: string;
}

export interface ReenviarVerificacaoRequest {
  email: string;
}

// Tipos para preferências do usuário
export interface UsuarioPreferencias {
  tema: 'claro' | 'escuro' | 'auto';
  idioma: 'pt-BR' | 'en-US' | 'es-ES';
  timezone: string;
  notificacoes: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'grid' | 'list';
  };
}

export interface UpdatePreferenciasRequest {
  preferencias: Partial<UsuarioPreferencias>;
}
