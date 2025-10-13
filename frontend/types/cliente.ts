/**
 * Tipos TypeScript para Cliente
 */

export interface CampoPersonalizado {
  id?: number;
  clienteID?: number;
  nome: string;
  valor: string;
  tipo: 'texto' | 'numero' | 'data' | 'email' | 'telefone';
  ordem: number;
}

export interface Cliente {
  id: number;
  cpf: string;
  ie_rg?: string;
  inscricao_municipal?: string;
  nome: string;
  nome_fantasia?: string;
  tipo_contato: string;
  consumidor_final: boolean;
  
  // Contatos
  email?: string;
  ponto_referencia?: string;
  telefone_fixo?: string;
  telefone_alternativo?: string;
  celular?: string;
  
  // Endereço Principal
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  codigo_ibge?: string;
  
  // Endereço de Entrega
  cep_entrega?: string;
  endereco_entrega?: string;
  numero_entrega?: string;
  complemento_entrega?: string;
  bairro_entrega?: string;
  cidade_entrega?: string;
  estado_entrega?: string;
  
  // Dados Financeiros
  limite_credito?: string;
  saldo_inicial?: string;
  prazo_pagamento?: string;
  
  // Sistema
  data_nascimento?: string;
  data_abertura?: string;
  status: string;
  data_cadastro: string;
  ultima_compra?: string;
  data_atualizacao: string;
  
  // Campos Personalizados
  camposPersonalizados?: CampoPersonalizado[];
}

export interface CreateClienteRequest {
  cpf: string;
  ie_rg?: string;
  inscricao_municipal?: string;
  nome: string;
  nome_fantasia?: string;
  tipo_contato?: string;
  consumidor_final?: boolean;
  
  email?: string;
  ponto_referencia?: string;
  telefone_fixo?: string;
  telefone_alternativo?: string;
  celular?: string;
  
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  codigo_ibge?: string;
  
  cep_entrega?: string;
  endereco_entrega?: string;
  numero_entrega?: string;
  complemento_entrega?: string;
  bairro_entrega?: string;
  cidade_entrega?: string;
  estado_entrega?: string;
  
  limite_credito?: string;
  saldo_inicial?: string;
  prazo_pagamento?: string;
  
  data_nascimento?: string;
  data_abertura?: string;
  status?: string;
  
  camposPersonalizados?: CampoPersonalizado[];
}

export interface UpdateClienteRequest extends Partial<CreateClienteRequest> {
  id: number;
}

export interface ClienteStats {
  total: number;
  ativos: number;
  inativos: number;
  novos_mes: number;
}

