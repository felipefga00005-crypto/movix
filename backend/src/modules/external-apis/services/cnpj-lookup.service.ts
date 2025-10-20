import { Injectable } from '@nestjs/common';
import { BaseExternalApiService, ApiProvider, ApiResponse } from './base-external-api.service';

export interface InscricaoEstadual {
  numero: string;
  uf: string;
  estado: string;
  ativo: boolean;
  atualizado?: Date;
}

export interface CnpjData {
  cnpj: string;
  cnpjFormatado: string;
  razaoSocial: string;
  nomeFantasia?: string;
  situacao: string;
  dataSituacao?: Date;
  dataAbertura?: Date;
  tipo: 'MATRIZ' | 'FILIAL';
  porte: string;
  naturezaJuridica: string;
  capitalSocial?: number;
  
  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  
  // Contato
  telefone?: string;
  telefone2?: string;
  fax?: string;
  email?: string;
  
  // Atividades
  atividadePrincipal?: {
    codigo: string;
    descricao: string;
  };
  atividadesSecundarias?: Array<{
    codigo: string;
    descricao: string;
  }>;
  
  // Sócios (QSA)
  socios?: Array<{
    nome: string;
    qualificacao: string;
    dataEntrada?: Date;
    cpfCnpj?: string;
  }>;
  
  // Inscrições Estaduais
  inscricoesEstaduais?: InscricaoEstadual[];
  
  // Simples Nacional
  simplesNacional?: {
    optante: boolean;
    dataOpcao?: Date;
    dataExclusao?: Date;
  };
  
  // MEI
  mei?: {
    optante: boolean;
    dataOpcao?: Date;
    dataExclusao?: Date;
  };
  
  // Metadados
  ultimaAtualizacao?: Date;
  fonte?: string;
}

@Injectable()
export class CnpjLookupService extends BaseExternalApiService {
  private readonly rateLimitMap = new Map<string, number[]>();
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
  private readonly activeRequests = new Map<string, Promise<ApiResponse<CnpjData>>>();

  private readonly providers: ApiProvider[] = [
    {
      name: 'CNPJ.ws',
      url: 'https://publica.cnpj.ws/cnpj/',
      priority: 1,
      timeout: 15000,
      retries: 1, // Reduzido para evitar loops
      rateLimit: '3/min',
      features: ['inscricao_estadual', 'qsa_completo', 'dados_atualizados'],
    },
    {
      name: 'BrasilAPI',
      url: 'https://brasilapi.com.br/api/cnpj/v1/',
      priority: 2,
      timeout: 10000,
      retries: 2, // Reduzido para evitar loops
      features: ['dados_completos', 'sem_rate_limit'],
    },
    {
      name: 'ReceitaWS',
      url: 'https://www.receitaws.com.br/v1/cnpj/',
      priority: 3,
      timeout: 12000,
      retries: 1, // Reduzido para evitar loops
      rateLimit: 'limitado',
      features: ['dados_basicos', 'cache_local'],
    },
  ];

  /**
   * Consulta dados de CNPJ com fallback automático
   */
  async consultarCnpj(cnpj: string): Promise<ApiResponse<CnpjData>> {
    const cleanCnpj = this.cleanDocument(cnpj);

    if (!this.validateCnpj(cleanCnpj)) {
      return {
        success: false,
        error: 'CNPJ inválido',
        timestamp: new Date(),
      };
    }

    // Evita múltiplas consultas simultâneas do mesmo CNPJ
    const activeRequest = this.activeRequests.get(cleanCnpj);
    if (activeRequest) {
      this.logger.log(`Returning active request for CNPJ: ${cleanCnpj}`);
      return activeRequest;
    }

    // Cria nova consulta
    const requestPromise = this.executeCnpjRequest(cleanCnpj);
    this.activeRequests.set(cleanCnpj, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove da lista de requisições ativas
      this.activeRequests.delete(cleanCnpj);
    }
  }

  /**
   * Executa a consulta de CNPJ com rate limiting
   */
  private async executeCnpjRequest(cleanCnpj: string): Promise<ApiResponse<CnpjData>> {
    // Verifica rate limiting para CNPJ.ws
    if (!this.canMakeRequest('CNPJ.ws')) {
      this.logger.warn('Rate limit exceeded for CNPJ.ws, skipping to next provider');
      // Remove CNPJ.ws temporariamente se rate limit foi atingido
      const filteredProviders = this.providers.filter(p => p.name !== 'CNPJ.ws');
      return this.executeWithFallback(
        filteredProviders,
        (provider) => this.consultarPorProvider(provider, cleanCnpj),
        `cnpj:${cleanCnpj}`
      );
    }

    return this.executeWithFallback(
      this.providers,
      (provider) => this.consultarPorProvider(provider, cleanCnpj),
      `cnpj:${cleanCnpj}`
    );
  }

  /**
   * Verifica se pode fazer requisição baseado no rate limit
   */
  private canMakeRequest(providerName: string): boolean {
    if (providerName !== 'CNPJ.ws') return true; // Apenas CNPJ.ws tem rate limit restritivo

    const now = Date.now();
    const requests = this.rateLimitMap.get(providerName) || [];

    // Remove requisições antigas (fora da janela de 1 minuto)
    const recentRequests = requests.filter(time => (now - time) < this.RATE_LIMIT_WINDOW);

    // Atualiza o mapa
    this.rateLimitMap.set(providerName, recentRequests);

    // Verifica se pode fazer nova requisição (máximo 2 por minuto para ser conservador)
    return recentRequests.length < 2;
  }

  /**
   * Registra uma requisição para rate limiting
   */
  private recordRequest(providerName: string): void {
    if (providerName !== 'CNPJ.ws') return;

    const requests = this.rateLimitMap.get(providerName) || [];
    requests.push(Date.now());
    this.rateLimitMap.set(providerName, requests);
  }

  /**
   * Consulta CNPJ em um provedor específico
   */
  private async consultarPorProvider(provider: ApiProvider, cnpj: string): Promise<CnpjData> {
    // Registra a requisição para rate limiting
    this.recordRequest(provider.name);

    const url = `${provider.url}${cnpj}`;

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!this.isValidResponse(rawData)) {
      throw new Error('Resposta inválida do provedor');
    }

    // Normaliza dados baseado no provedor
    switch (provider.name) {
      case 'CNPJ.ws':
        return this.normalizeCnpjWsData(rawData);
      case 'BrasilAPI':
        return this.normalizeBrasilApiData(rawData);
      case 'ReceitaWS':
        return this.normalizeReceitaWsData(rawData);
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }
  }

  /**
   * Normaliza dados do CNPJ.ws
   */
  private normalizeCnpjWsData(data: any): CnpjData {
    const estabelecimento = data.estabelecimento;
    
    return {
      cnpj: estabelecimento.cnpj,
      cnpjFormatado: this.formatCnpj(estabelecimento.cnpj),
      razaoSocial: data.razao_social,
      nomeFantasia: estabelecimento.nome_fantasia,
      situacao: estabelecimento.situacao_cadastral,
      dataSituacao: estabelecimento.data_situacao_cadastral ? new Date(estabelecimento.data_situacao_cadastral) : undefined,
      dataAbertura: estabelecimento.data_inicio_atividade ? new Date(estabelecimento.data_inicio_atividade) : undefined,
      tipo: estabelecimento.tipo === 'Matriz' ? 'MATRIZ' : 'FILIAL',
      porte: data.porte?.descricao || '',
      naturezaJuridica: data.natureza_juridica?.descricao || '',
      capitalSocial: parseFloat(data.capital_social) || undefined,
      
      // Endereço
      logradouro: `${estabelecimento.tipo_logradouro || ''} ${estabelecimento.logradouro || ''}`.trim(),
      numero: estabelecimento.numero,
      complemento: estabelecimento.complemento,
      bairro: estabelecimento.bairro,
      municipio: estabelecimento.cidade?.nome,
      uf: estabelecimento.estado?.sigla,
      cep: estabelecimento.cep,
      
      // Contato
      telefone: estabelecimento.ddd1 && estabelecimento.telefone1 ? 
        `(${estabelecimento.ddd1}) ${estabelecimento.telefone1}` : undefined,
      telefone2: estabelecimento.ddd2 && estabelecimento.telefone2 ? 
        `(${estabelecimento.ddd2}) ${estabelecimento.telefone2}` : undefined,
      fax: estabelecimento.ddd_fax && estabelecimento.fax ? 
        `(${estabelecimento.ddd_fax}) ${estabelecimento.fax}` : undefined,
      email: estabelecimento.email,
      
      // Atividades
      atividadePrincipal: estabelecimento.atividade_principal ? {
        codigo: estabelecimento.atividade_principal.id,
        descricao: estabelecimento.atividade_principal.descricao,
      } : undefined,
      atividadesSecundarias: estabelecimento.atividades_secundarias?.map((ativ: any) => ({
        codigo: ativ.id,
        descricao: ativ.descricao,
      })),
      
      // Sócios
      socios: data.socios?.map((socio: any) => ({
        nome: socio.nome,
        qualificacao: socio.qualificacao_socio?.descricao || '',
        dataEntrada: socio.data_entrada ? new Date(socio.data_entrada) : undefined,
        cpfCnpj: socio.cpf_cnpj_socio,
      })),
      
      // Inscrições Estaduais (principal diferencial!)
      inscricoesEstaduais: estabelecimento.inscricoes_estaduais?.map((ie: any) => ({
        numero: ie.inscricao_estadual,
        uf: ie.estado.sigla,
        estado: ie.estado.nome,
        ativo: ie.ativo,
        atualizado: ie.atualizado_em ? new Date(ie.atualizado_em) : undefined,
      })),
      
      // Simples Nacional
      simplesNacional: data.simples ? {
        optante: data.simples.optante || false,
        dataOpcao: data.simples.data_opcao ? new Date(data.simples.data_opcao) : undefined,
        dataExclusao: data.simples.data_exclusao ? new Date(data.simples.data_exclusao) : undefined,
      } : undefined,
      
      ultimaAtualizacao: estabelecimento.atualizado_em ? new Date(estabelecimento.atualizado_em) : new Date(),
      fonte: 'CNPJ.ws',
    };
  }

  /**
   * Normaliza dados do BrasilAPI
   */
  private normalizeBrasilApiData(data: any): CnpjData {
    return {
      cnpj: data.cnpj,
      cnpjFormatado: this.formatCnpj(data.cnpj),
      razaoSocial: data.razao_social,
      nomeFantasia: data.nome_fantasia,
      situacao: data.descricao_situacao_cadastral,
      dataSituacao: data.data_situacao_cadastral ? new Date(data.data_situacao_cadastral) : undefined,
      dataAbertura: data.data_inicio_atividade ? new Date(data.data_inicio_atividade) : undefined,
      tipo: data.identificador_matriz_filial === 1 ? 'MATRIZ' : 'FILIAL',
      porte: data.porte,
      naturezaJuridica: data.natureza_juridica,
      capitalSocial: data.capital_social,
      
      // Endereço
      logradouro: `${data.descricao_tipo_de_logradouro || ''} ${data.logradouro || ''}`.trim(),
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep,
      
      // Contato
      telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.slice(0,2)}) ${data.ddd_telefone_1.slice(2)}` : undefined,
      telefone2: data.ddd_telefone_2 ? `(${data.ddd_telefone_2.slice(0,2)}) ${data.ddd_telefone_2.slice(2)}` : undefined,
      fax: data.ddd_fax ? `(${data.ddd_fax.slice(0,2)}) ${data.ddd_fax.slice(2)}` : undefined,
      email: data.email,
      
      // Atividades
      atividadePrincipal: {
        codigo: data.cnae_fiscal?.toString(),
        descricao: data.cnae_fiscal_descricao,
      },
      atividadesSecundarias: data.cnaes_secundarios?.map((cnae: any) => ({
        codigo: cnae.codigo?.toString(),
        descricao: cnae.descricao,
      })),
      
      // Sócios
      socios: data.qsa?.map((socio: any) => ({
        nome: socio.nome_socio,
        qualificacao: socio.qualificacao_socio,
        dataEntrada: socio.data_entrada_sociedade ? new Date(socio.data_entrada_sociedade) : undefined,
        cpfCnpj: socio.cnpj_cpf_do_socio,
      })),
      
      // Simples Nacional
      simplesNacional: {
        optante: data.opcao_pelo_simples === 'Sim',
        dataOpcao: data.data_opcao_pelo_simples ? new Date(data.data_opcao_pelo_simples) : undefined,
        dataExclusao: data.data_exclusao_do_simples ? new Date(data.data_exclusao_do_simples) : undefined,
      },
      
      // MEI
      mei: {
        optante: data.opcao_pelo_mei === 'Sim',
        dataOpcao: data.data_opcao_pelo_mei ? new Date(data.data_opcao_pelo_mei) : undefined,
        dataExclusao: data.data_exclusao_do_mei ? new Date(data.data_exclusao_do_mei) : undefined,
      },
      
      ultimaAtualizacao: new Date(),
      fonte: 'BrasilAPI',
    };
  }

  /**
   * Normaliza dados do ReceitaWS
   */
  private normalizeReceitaWsData(data: any): CnpjData {
    return {
      cnpj: data.cnpj.replace(/[^\d]/g, ''),
      cnpjFormatado: data.cnpj,
      razaoSocial: data.nome,
      nomeFantasia: data.fantasia,
      situacao: data.situacao,
      dataSituacao: data.data_situacao ? new Date(data.data_situacao.split('/').reverse().join('-')) : undefined,
      dataAbertura: data.abertura ? new Date(data.abertura.split('/').reverse().join('-')) : undefined,
      tipo: data.tipo === 'MATRIZ' ? 'MATRIZ' : 'FILIAL',
      porte: data.porte,
      naturezaJuridica: data.natureza_juridica,
      capitalSocial: parseFloat(data.capital_social) || undefined,
      
      // Endereço
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      municipio: data.municipio,
      uf: data.uf,
      cep: data.cep,
      
      // Contato
      telefone: data.telefone,
      email: data.email,
      
      // Atividades
      atividadePrincipal: data.atividade_principal?.[0] ? {
        codigo: data.atividade_principal[0].code,
        descricao: data.atividade_principal[0].text,
      } : undefined,
      atividadesSecundarias: data.atividades_secundarias?.map((ativ: any) => ({
        codigo: ativ.code,
        descricao: ativ.text,
      })),
      
      // Sócios
      socios: data.qsa?.map((socio: any) => ({
        nome: socio.nome,
        qualificacao: socio.qual,
      })),
      
      // Simples Nacional
      simplesNacional: data.simples ? {
        optante: data.simples.optante,
        dataOpcao: data.simples.data_opcao ? new Date(data.simples.data_opcao) : undefined,
        dataExclusao: data.simples.data_exclusao ? new Date(data.simples.data_exclusao) : undefined,
      } : undefined,
      
      // MEI
      mei: data.simei ? {
        optante: data.simei.optante,
        dataOpcao: data.simei.data_opcao ? new Date(data.simei.data_opcao) : undefined,
        dataExclusao: data.simei.data_exclusao ? new Date(data.simei.data_exclusao) : undefined,
      } : undefined,
      
      ultimaAtualizacao: data.ultima_atualizacao ? new Date(data.ultima_atualizacao) : new Date(),
      fonte: 'ReceitaWS',
    };
  }
}
