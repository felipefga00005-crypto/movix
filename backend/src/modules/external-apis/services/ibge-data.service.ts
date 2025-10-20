import { Injectable } from '@nestjs/common';
import { BaseExternalApiService, ApiProvider, ApiResponse } from './base-external-api.service';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface Municipio {
  id: number;
  nome: string;
  estado: {
    id: number;
    sigla: string;
    nome: string;
  };
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface RegiaoIBGE {
  id: number;
  sigla: string;
  nome: string;
}

@Injectable()
export class IbgeDataService extends BaseExternalApiService {
  private readonly providers: ApiProvider[] = [
    {
      name: 'IBGE-Oficial',
      url: 'https://servicodados.ibge.gov.br/api/v1/localidades/',
      priority: 1,
      timeout: 15000,
      retries: 3,
      features: ['dados_oficiais', 'sempre_atualizado', 'gratuito'],
    },
    {
      name: 'BrasilAPI-IBGE',
      url: 'https://brasilapi.com.br/api/ibge/',
      priority: 2,
      timeout: 10000,
      retries: 2,
      features: ['cdn_global', 'mais_rapido', 'mesmos_dados'],
    },
  ];

  /**
   * Busca todos os estados brasileiros
   */
  async getEstados(): Promise<ApiResponse<Estado[]>> {
    return this.executeWithFallback(
      this.providers,
      (provider) => this.buscarEstados(provider),
      'estados:all'
    );
  }

  /**
   * Busca estado por ID ou sigla
   */
  async getEstado(identificador: string | number): Promise<ApiResponse<Estado>> {
    return this.executeWithFallback(
      this.providers,
      (provider) => this.buscarEstado(provider, identificador),
      `estado:${identificador}`
    );
  }

  /**
   * Busca municípios por estado
   */
  async getMunicipiosByEstado(uf: string): Promise<ApiResponse<Municipio[]>> {
    if (!uf || uf.length !== 2) {
      return {
        success: false,
        error: 'UF deve ter exatamente 2 caracteres',
        timestamp: new Date(),
      };
    }

    return this.executeWithFallback(
      this.providers,
      (provider) => this.buscarMunicipiosByEstado(provider, uf.toUpperCase()),
      `municipios:${uf.toUpperCase()}`
    );
  }

  /**
   * Busca município por ID
   */
  async getMunicipio(id: number): Promise<ApiResponse<Municipio>> {
    return this.executeWithFallback(
      this.providers,
      (provider) => this.buscarMunicipio(provider, id),
      `municipio:${id}`
    );
  }

  /**
   * Busca todas as regiões do Brasil
   */
  async getRegioes(): Promise<ApiResponse<RegiaoIBGE[]>> {
    return this.executeWithFallback(
      this.providers,
      (provider) => this.buscarRegioes(provider),
      'regioes:all'
    );
  }

  /**
   * Busca municípios por nome (busca parcial)
   */
  async buscarMunicipiosPorNome(nome: string, uf?: string): Promise<ApiResponse<Municipio[]>> {
    if (!nome || nome.length < 2) {
      return {
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres',
        timestamp: new Date(),
      };
    }

    try {
      // Busca todos os municípios do estado ou do Brasil
      let municipios: Municipio[];
      
      if (uf) {
        const resultado = await this.getMunicipiosByEstado(uf);
        if (!resultado.success) {
          return resultado as ApiResponse<Municipio[]>;
        }
        municipios = resultado.data!;
      } else {
        // Busca em todos os estados (pode ser lento)
        const estados = await this.getEstados();
        if (!estados.success) {
          return {
            success: false,
            error: 'Erro ao buscar estados para filtrar municípios',
            timestamp: new Date(),
          };
        }

        municipios = [];
        for (const estado of estados.data!) {
          const municipiosEstado = await this.getMunicipiosByEstado(estado.sigla);
          if (municipiosEstado.success) {
            municipios.push(...municipiosEstado.data!);
          }
        }
      }

      // Filtra por nome (busca case-insensitive e parcial)
      const nomeNormalizado = this.normalizarTexto(nome);
      const municipiosFiltrados = municipios.filter(municipio => 
        this.normalizarTexto(municipio.nome).includes(nomeNormalizado)
      );

      return {
        success: true,
        data: municipiosFiltrados,
        provider: 'Filtro local',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro na busca por nome: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Busca estados em um provedor específico
   */
  private async buscarEstados(provider: ApiProvider): Promise<Estado[]> {
    let url: string;
    
    switch (provider.name) {
      case 'IBGE-Oficial':
        url = `${provider.url}estados?orderBy=nome`;
        break;
      case 'BrasilAPI-IBGE':
        url = `${provider.url}uf/v1`;
        break;
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Nenhum estado encontrado');
    }

    return provider.name === 'IBGE-Oficial' 
      ? this.normalizeIbgeEstados(rawData)
      : this.normalizeBrasilApiEstados(rawData);
  }

  /**
   * Busca estado específico
   */
  private async buscarEstado(provider: ApiProvider, identificador: string | number): Promise<Estado> {
    let url: string;
    
    switch (provider.name) {
      case 'IBGE-Oficial':
        url = `${provider.url}estados/${identificador}`;
        break;
      case 'BrasilAPI-IBGE':
        url = `${provider.url}uf/v1/${identificador}`;
        break;
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!this.isValidResponse(rawData)) {
      throw new Error('Estado não encontrado');
    }

    return provider.name === 'IBGE-Oficial' 
      ? this.normalizeIbgeEstado(rawData)
      : this.normalizeBrasilApiEstado(rawData);
  }

  /**
   * Busca municípios por estado
   */
  private async buscarMunicipiosByEstado(provider: ApiProvider, uf: string): Promise<Municipio[]> {
    let url: string;
    
    switch (provider.name) {
      case 'IBGE-Oficial':
        url = `${provider.url}estados/${uf}/municipios?orderBy=nome`;
        break;
      case 'BrasilAPI-IBGE':
        url = `${provider.url}municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`;
        break;
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error(`Nenhum município encontrado para ${uf}`);
    }

    return provider.name === 'IBGE-Oficial' 
      ? this.normalizeIbgeMunicipios(rawData)
      : this.normalizeBrasilApiMunicipios(rawData);
  }

  /**
   * Busca município específico
   */
  private async buscarMunicipio(provider: ApiProvider, id: number): Promise<Municipio> {
    let url: string;
    
    switch (provider.name) {
      case 'IBGE-Oficial':
        url = `${provider.url}municipios/${id}`;
        break;
      case 'BrasilAPI-IBGE':
        // BrasilAPI não suporta busca por ID específico
        throw new Error('BrasilAPI não suporta busca de município por ID');
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!this.isValidResponse(rawData)) {
      throw new Error('Município não encontrado');
    }

    return this.normalizeIbgeMunicipio(rawData);
  }

  /**
   * Busca regiões
   */
  private async buscarRegioes(provider: ApiProvider): Promise<RegiaoIBGE[]> {
    let url: string;
    
    switch (provider.name) {
      case 'IBGE-Oficial':
        url = `${provider.url}regioes?orderBy=nome`;
        break;
      case 'BrasilAPI-IBGE':
        // BrasilAPI não tem endpoint específico para regiões
        throw new Error('BrasilAPI não suporta busca de regiões');
      default:
        throw new Error(`Provedor não suportado: ${provider.name}`);
    }

    const rawData = await this.makeRequest(url, {
      timeout: provider.timeout,
    });

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Nenhuma região encontrada');
    }

    return rawData.map(item => ({
      id: item.id,
      sigla: item.sigla,
      nome: item.nome,
    }));
  }

  /**
   * Normaliza dados de estados do IBGE oficial
   */
  private normalizeIbgeEstados(data: any[]): Estado[] {
    return data.map(item => this.normalizeIbgeEstado(item));
  }

  private normalizeIbgeEstado(item: any): Estado {
    return {
      id: item.id,
      sigla: item.sigla,
      nome: item.nome,
      regiao: {
        id: item.regiao.id,
        sigla: item.regiao.sigla,
        nome: item.regiao.nome,
      },
    };
  }

  /**
   * Normaliza dados de estados do BrasilAPI
   */
  private normalizeBrasilApiEstados(data: any[]): Estado[] {
    return data.map(item => this.normalizeBrasilApiEstado(item));
  }

  private normalizeBrasilApiEstado(item: any): Estado {
    return {
      id: item.id || 0,
      sigla: item.sigla,
      nome: item.nome,
      regiao: {
        id: item.regiao?.id || 0,
        sigla: item.regiao?.sigla || '',
        nome: item.regiao?.nome || '',
      },
    };
  }

  /**
   * Normaliza dados de municípios do IBGE oficial
   */
  private normalizeIbgeMunicipios(data: any[]): Municipio[] {
    return data.map(item => this.normalizeIbgeMunicipio(item));
  }

  private normalizeIbgeMunicipio(item: any): Municipio {
    return {
      id: item.id,
      nome: item.nome,
      estado: {
        id: item.microrregiao?.mesorregiao?.UF?.id || 0,
        sigla: item.microrregiao?.mesorregiao?.UF?.sigla || '',
        nome: item.microrregiao?.mesorregiao?.UF?.nome || '',
      },
      regiao: {
        id: item.microrregiao?.mesorregiao?.UF?.regiao?.id || 0,
        sigla: item.microrregiao?.mesorregiao?.UF?.regiao?.sigla || '',
        nome: item.microrregiao?.mesorregiao?.UF?.regiao?.nome || '',
      },
    };
  }

  /**
   * Normaliza dados de municípios do BrasilAPI
   */
  private normalizeBrasilApiMunicipios(data: any[]): Municipio[] {
    return data.map(item => ({
      id: item.codigo_ibge || 0,
      nome: item.nome,
      estado: {
        id: 0, // BrasilAPI não fornece ID do estado
        sigla: item.estado || '',
        nome: '', // Seria necessário buscar separadamente
      },
      regiao: {
        id: 0,
        sigla: '',
        nome: '',
      },
    }));
  }

  /**
   * Normaliza texto para busca (remove acentos, converte para minúsculo)
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  }
}
