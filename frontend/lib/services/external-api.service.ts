import { api } from '../api';

export interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface CNPJResponse {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  tipo_estabelecimento: string;
  data_abertura: string;
  cnae_principal: {
    codigo: number;
    descricao: string;
  };
  natureza_juridica: string;
  porte: string;
  capital_social: number;
  inscricao_estadual: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    codigo_ibge?: string;
  };
  contato: {
    telefone: string;
    telefone2: string;
    email: string;
  };
  socios: Array<{
    nome: string;
    qualificacao: string;
  }>;
  inscricoes_estaduais: Array<{
    inscricao_estadual: string;
    ativo: boolean;
    estado: string;
    estado_nome: string;
    atualizado_em: string;
  }>;
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
  estado_id: number;
}

class ExternalAPIService {
  async buscarCEP(cep: string): Promise<CEPResponse> {
    const cepLimpo = cep.replace(/\D/g, '');
    return api.get<CEPResponse>(`/cep/${cepLimpo}`);
  }

  async buscarCNPJ(cnpj: string): Promise<CNPJResponse> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    return api.get<CNPJResponse>(`/cnpj/${cnpjLimpo}`);
  }

  async listarEstados(): Promise<Estado[]> {
    return api.get<Estado[]>('/estados');
  }

  async listarCidadesPorEstado(uf: string): Promise<Cidade[]> {
    return api.get<Cidade[]>(`/estados/${uf}/cidades`);
  }

  async buscarLocalizacaoCompleta(cep: string): Promise<{
    cep: CEPResponse;
    estado: Estado;
    cidade: Cidade;
  }> {
    const cepLimpo = cep.replace(/\D/g, '');
    return api.get(`/localizacao/${cepLimpo}`);
  }
}

export const externalAPIService = new ExternalAPIService();

