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
  data_abertura: string;
  natureza_juridica: string;
  porte: string;
  capital_social: string;
  inscricao_estadual: string;
  atividade_principal: {
    code: string;
    text: string;
  };
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  telefone2?: string;
  email: string;
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

