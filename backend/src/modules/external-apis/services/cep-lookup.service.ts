import { Injectable } from '@nestjs/common';
import { BaseExternalApiService, ApiProvider, ApiResponse } from './base-external-api.service';

export interface CepData {
  cep: string;
  cepFormatado: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  estado?: string;
  regiao?: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  
  // Coordenadas (quando disponível)
  latitude?: number;
  longitude?: number;
  
  // Metadados
  fonte?: string;
  ultimaAtualizacao?: Date;
}

@Injectable()
export class CepLookupService extends BaseExternalApiService {
  private readonly providers: ApiProvider[] = [
    {
      name: 'ViaCEP',
      url: 'https://viacep.com.br/ws/',
      priority: 1,
      timeout: 8000,
      retries: 3,
      features: ['estavel', 'dados_oficiais', 'sem_limite'],
    },
    {
      name: 'BrasilAPI',
      url: 'https://brasilapi.com.br/api/cep/v2/',
      priority: 2,
      timeout: 10000,
      retries: 2,
      features: ['coordenadas', 'fallback_multiplo', 'cdn_global'],
    },
    {
      name: 'PostMon',
      url: 'https://api.postmon.com.br/v1/cep/',
      priority: 3,
      timeout: 12000,
      retries: 2,
      features: ['backup_solido', 'dados_extras'],
    },
  ];

  /**
   * Consulta dados de CEP com fallback automático
   */
  async consultarCep(cep: string): Promise<ApiResponse<CepData>> {
    const cleanCep = this.cleanDocument(cep);
    
    if (!this.validateCep(cleanCep)) {
      return {
        success: false,
        error: 'CEP inválido',
        timestamp: new Date(),
      };
    }

    return this.executeWithFallback(
      this.providers,
      (provider) => this.consultarPorProvider(provider, cleanCep),
      `cep:${cleanCep}`
    );
  }

  /**
   * Busca CEPs por cidade/logradouro (quando suportado)
   */
  async buscarCepsPorEndereco(uf: string, cidade: string, logradouro?: string): Promise<ApiResponse<CepData[]>> {
    if (!uf || !cidade) {
      return {
        success: false,
        error: 'UF e cidade são obrigatórios',
        timestamp: new Date(),
      };
    }

    try {
      // Apenas ViaCEP suporta busca reversa de forma confiável
      const url = logradouro 
        ? `https://viacep.com.br/ws/${uf}/${cidade}/${logradouro}/json/`
        : `https://viacep.com.br/ws/${uf}/${cidade}/json/`;

      const rawData = await this.makeRequest(url, { timeout: 10000 });

      if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
          success: false,
          error: 'Nenhum CEP encontrado para o endereço informado',
          timestamp: new Date(),
        };
      }

      const ceps = rawData.map(item => this.normalizeViaCepData(item));

      return {
        success: true,
        data: ceps,
        provider: 'ViaCEP',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro na busca por endereço: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Consulta CEP em um provedor específico
   */
  private async consultarPorProvider(provider: ApiProvider, cep: string): Promise<CepData> {
    let url: string;
    
    switch (provider.name) {
      case 'ViaCEP':
        url = `${provider.url}${cep}/json/`;
        break;
      case 'BrasilAPI':
        url = `${provider.url}${cep}`;
        break;
      case 'PostMon':
        url = `${provider.url}${cep}`;
        break;
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }
    
    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!this.isValidResponse(rawData)) {
      throw new Error('Resposta inválida do provedor');
    }

    // Verifica se o CEP foi encontrado
    if (rawData.erro || rawData.error || !rawData.cep) {
      throw new Error('CEP não encontrado');
    }

    // Normaliza dados baseado no provedor
    switch (provider.name) {
      case 'ViaCEP':
        return this.normalizeViaCepData(rawData);
      case 'BrasilAPI':
        return this.normalizeBrasilApiCepData(rawData);
      case 'PostMon':
        return this.normalizePostMonData(rawData);
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }
  }

  /**
   * Normaliza dados do ViaCEP
   */
  private normalizeViaCepData(data: any): CepData {
    return {
      cep: data.cep.replace(/[^\d]/g, ''),
      cepFormatado: data.cep,
      logradouro: data.logradouro || '',
      complemento: data.complemento || undefined,
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
      estado: this.getEstadoNome(data.uf),
      regiao: this.getRegiaoByUf(data.uf),
      ibge: data.ibge || undefined,
      gia: data.gia || undefined,
      ddd: data.ddd || undefined,
      siafi: data.siafi || undefined,
      fonte: 'ViaCEP',
      ultimaAtualizacao: new Date(),
    };
  }

  /**
   * Normaliza dados do BrasilAPI CEP
   */
  private normalizeBrasilApiCepData(data: any): CepData {
    return {
      cep: data.cep.replace(/[^\d]/g, ''),
      cepFormatado: this.formatCep(data.cep),
      logradouro: data.street || '',
      bairro: data.neighborhood || '',
      localidade: data.city || '',
      uf: data.state || '',
      estado: this.getEstadoNome(data.state),
      regiao: this.getRegiaoByUf(data.state),
      
      // Coordenadas (diferencial do BrasilAPI)
      latitude: data.location?.coordinates?.latitude || undefined,
      longitude: data.location?.coordinates?.longitude || undefined,
      
      fonte: 'BrasilAPI',
      ultimaAtualizacao: new Date(),
    };
  }

  /**
   * Normaliza dados do PostMon
   */
  private normalizePostMonData(data: any): CepData {
    return {
      cep: data.cep.replace(/[^\d]/g, ''),
      cepFormatado: this.formatCep(data.cep),
      logradouro: data.logradouro || data.address || '',
      bairro: data.bairro || data.neighborhood || '',
      localidade: data.cidade || data.city || '',
      uf: data.estado || data.state || '',
      estado: this.getEstadoNome(data.estado || data.state),
      regiao: this.getRegiaoByUf(data.estado || data.state),
      fonte: 'PostMon',
      ultimaAtualizacao: new Date(),
    };
  }

  /**
   * Converte sigla do estado para nome completo
   */
  private getEstadoNome(uf: string): string {
    const estados: Record<string, string> = {
      'AC': 'Acre',
      'AL': 'Alagoas',
      'AP': 'Amapá',
      'AM': 'Amazonas',
      'BA': 'Bahia',
      'CE': 'Ceará',
      'DF': 'Distrito Federal',
      'ES': 'Espírito Santo',
      'GO': 'Goiás',
      'MA': 'Maranhão',
      'MT': 'Mato Grosso',
      'MS': 'Mato Grosso do Sul',
      'MG': 'Minas Gerais',
      'PA': 'Pará',
      'PB': 'Paraíba',
      'PR': 'Paraná',
      'PE': 'Pernambuco',
      'PI': 'Piauí',
      'RJ': 'Rio de Janeiro',
      'RN': 'Rio Grande do Norte',
      'RS': 'Rio Grande do Sul',
      'RO': 'Rondônia',
      'RR': 'Roraima',
      'SC': 'Santa Catarina',
      'SP': 'São Paulo',
      'SE': 'Sergipe',
      'TO': 'Tocantins',
    };
    
    return estados[uf?.toUpperCase()] || uf;
  }

  /**
   * Retorna a região baseada na UF
   */
  private getRegiaoByUf(uf: string): string {
    const regioes: Record<string, string> = {
      // Norte
      'AC': 'Norte', 'AP': 'Norte', 'AM': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
      // Nordeste
      'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
      // Centro-Oeste
      'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste', 'DF': 'Centro-Oeste',
      // Sudeste
      'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
      // Sul
      'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul',
    };
    
    return regioes[uf?.toUpperCase()] || '';
  }

  /**
   * Valida se os dados de CEP estão completos
   */
  private isCompleteCepData(data: CepData): boolean {
    return !!(
      data.cep &&
      data.localidade &&
      data.uf &&
      (data.logradouro || data.bairro) // Pelo menos um deve estar presente
    );
  }

  /**
   * Busca múltiplos CEPs em lote (quando suportado)
   */
  async consultarCepsLote(ceps: string[]): Promise<ApiResponse<CepData[]>> {
    if (!ceps || ceps.length === 0) {
      return {
        success: false,
        error: 'Lista de CEPs não pode estar vazia',
        timestamp: new Date(),
      };
    }

    if (ceps.length > 10) {
      return {
        success: false,
        error: 'Máximo de 10 CEPs por consulta',
        timestamp: new Date(),
      };
    }

    const resultados: CepData[] = [];
    const erros: string[] = [];

    // Processa CEPs em paralelo com limite
    const promises = ceps.map(async (cep) => {
      try {
        const resultado = await this.consultarCep(cep);
        if (resultado.success) {
          resultados.push(resultado.data!);
        } else {
          erros.push(`${cep}: ${resultado.error}`);
        }
      } catch (error) {
        erros.push(`${cep}: ${error.message}`);
      }
    });

    await Promise.allSettled(promises);

    if (resultados.length === 0) {
      return {
        success: false,
        error: `Nenhum CEP válido encontrado. Erros: ${erros.join('; ')}`,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: resultados,
      provider: 'Múltiplos',
      timestamp: new Date(),
    };
  }
}
