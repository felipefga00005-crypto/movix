import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IbgeDataService, Estado, Municipio } from './ibge-data.service';
import { ApiResponse } from './base-external-api.service';

@Injectable()
export class IbgeCacheService {
  private readonly logger = new Logger(IbgeCacheService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ibgeService: IbgeDataService,
  ) {}

  /**
   * Busca estado por UF com cache local
   */
  async getEstado(uf: string): Promise<ApiResponse<Estado>> {
    try {
      // 1. Busca primeiro no banco local
      const estadoLocal = await this.prisma.estado.findUnique({
        where: { uf: uf.toUpperCase() }
      });

      if (estadoLocal) {
        this.logger.debug(`Estado ${uf} encontrado no cache local`);
        return {
          success: true,
          data: {
            id: parseInt(estadoLocal.codigo),
            sigla: estadoLocal.uf,
            nome: estadoLocal.nome,
            regiao: {
              id: this.getRegiaoId(estadoLocal.regiao),
              sigla: this.getRegiaoSigla(estadoLocal.regiao),
              nome: estadoLocal.regiao
            }
          },
          provider: 'Cache Local',
          timestamp: new Date(),
        };
      }

      // 2. Se não encontrou, busca na API externa
      this.logger.log(`Estado ${uf} não encontrado no cache, buscando na API externa`);
      const estadoExterno = await this.ibgeService.getEstado(uf);

      if (estadoExterno.success && estadoExterno.data) {
        // 3. Salva no banco local para próximas consultas
        await this.salvarEstadoLocal(estadoExterno.data);
        this.logger.log(`Estado ${uf} salvo no cache local`);
      }

      return estadoExterno;
    } catch (error) {
      this.logger.error(`Erro ao buscar estado ${uf}: ${error.message}`);
      return {
        success: false,
        error: `Erro ao buscar estado: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Busca todos os estados com cache local
   */
  async getEstados(): Promise<ApiResponse<Estado[]>> {
    try {
      // 1. Busca primeiro no banco local
      const estadosLocais = await this.prisma.estado.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
      });

      if (estadosLocais.length > 0) {
        this.logger.debug(`${estadosLocais.length} estados encontrados no cache local`);
        const estados = estadosLocais.map(estado => ({
          id: parseInt(estado.codigo),
          sigla: estado.uf,
          nome: estado.nome,
          regiao: {
            id: this.getRegiaoId(estado.regiao),
            sigla: this.getRegiaoSigla(estado.regiao),
            nome: estado.regiao
          }
        }));

        return {
          success: true,
          data: estados,
          provider: 'Cache Local',
          timestamp: new Date(),
        };
      }

      // 2. Se não encontrou, busca na API externa
      this.logger.log('Estados não encontrados no cache, buscando na API externa');
      const estadosExternos = await this.ibgeService.getEstados();

      if (estadosExternos.success && estadosExternos.data) {
        // 3. Salva todos no banco local
        for (const estado of estadosExternos.data) {
          await this.salvarEstadoLocal(estado);
        }
        this.logger.log(`${estadosExternos.data.length} estados salvos no cache local`);
      }

      return estadosExternos;
    } catch (error) {
      this.logger.error(`Erro ao buscar estados: ${error.message}`);
      return {
        success: false,
        error: `Erro ao buscar estados: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Busca municípios por estado com cache local
   */
  async getMunicipiosByEstado(uf: string): Promise<ApiResponse<Municipio[]>> {
    try {
      // 1. Busca o estado primeiro
      const estadoResult = await this.getEstado(uf);
      if (!estadoResult.success) {
        return {
          success: false,
          error: `Estado ${uf} não encontrado`,
          timestamp: new Date(),
        };
      }

      // 2. Busca municípios no banco local
      const estadoLocal = await this.prisma.estado.findUnique({
        where: { uf: uf.toUpperCase() },
        include: {
          municipios: {
            where: { ativo: true },
            orderBy: { nome: 'asc' }
          }
        }
      });

      if (estadoLocal && estadoLocal.municipios.length > 0) {
        this.logger.debug(`${estadoLocal.municipios.length} municípios de ${uf} encontrados no cache local`);
        const municipios = estadoLocal.municipios.map(municipio => ({
          id: parseInt(municipio.codigo),
          nome: municipio.nome,
          estado: {
            id: parseInt(estadoLocal.codigo),
            sigla: estadoLocal.uf,
            nome: estadoLocal.nome
          },
          regiao: {
            id: 0,
            sigla: '',
            nome: '',
          }
        }));

        return {
          success: true,
          data: municipios,
          provider: 'Cache Local',
          timestamp: new Date(),
        };
      }

      // 3. Se não encontrou, busca na API externa
      this.logger.log(`Municípios de ${uf} não encontrados no cache, buscando na API externa`);
      const municipiosExternos = await this.ibgeService.getMunicipiosByEstado(uf);

      if (municipiosExternos.success && municipiosExternos.data && estadoLocal) {
        // 4. Salva todos no banco local
        for (const municipio of municipiosExternos.data) {
          await this.salvarMunicipioLocal(municipio, estadoLocal.id);
        }
        this.logger.log(`${municipiosExternos.data.length} municípios de ${uf} salvos no cache local`);
      }

      return municipiosExternos;
    } catch (error) {
      this.logger.error(`Erro ao buscar municípios de ${uf}: ${error.message}`);
      return {
        success: false,
        error: `Erro ao buscar municípios: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Busca município por nome com cache local
   */
  async buscarMunicipiosPorNome(nome: string, uf?: string): Promise<ApiResponse<Municipio[]>> {
    try {
      // 1. Busca no banco local
      const whereClause: any = {
        nome: {
          contains: nome,
          mode: 'insensitive'
        },
        ativo: true
      };

      if (uf) {
        const estadoLocal = await this.prisma.estado.findUnique({
          where: { uf: uf.toUpperCase() }
        });
        if (estadoLocal) {
          whereClause.estadoId = estadoLocal.id;
        }
      }

      const municipiosLocais = await this.prisma.municipio.findMany({
        where: whereClause,
        include: {
          estado: true
        },
        orderBy: { nome: 'asc' },
        take: 50 // Limita a 50 resultados
      });

      if (municipiosLocais.length > 0) {
        this.logger.debug(`${municipiosLocais.length} municípios encontrados no cache local para "${nome}"`);
        const municipios = municipiosLocais.map(municipio => ({
          id: parseInt(municipio.codigo),
          nome: municipio.nome,
          estado: {
            id: parseInt(municipio.estado.codigo),
            sigla: municipio.estado.uf,
            nome: municipio.estado.nome
          },
          regiao: {
            id: 0,
            sigla: '',
            nome: '',
          }
        }));

        return {
          success: true,
          data: municipios,
          provider: 'Cache Local',
          timestamp: new Date(),
        };
      }

      // 2. Se não encontrou no cache, busca na API externa
      this.logger.log(`Municípios "${nome}" não encontrados no cache, buscando na API externa`);
      return await this.ibgeService.buscarMunicipiosPorNome(nome, uf);
    } catch (error) {
      this.logger.error(`Erro ao buscar municípios por nome "${nome}": ${error.message}`);
      return {
        success: false,
        error: `Erro ao buscar municípios: ${error.message}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Salva estado no banco local
   */
  private async salvarEstadoLocal(estado: Estado): Promise<void> {
    try {
      await this.prisma.estado.upsert({
        where: { uf: estado.sigla },
        update: {
          nome: estado.nome,
          regiao: estado.regiao.nome,
          updatedAt: new Date()
        },
        create: {
          codigo: estado.id.toString(),
          uf: estado.sigla,
          nome: estado.nome,
          regiao: estado.regiao.nome,
          ativo: true
        }
      });
    } catch (error) {
      this.logger.error(`Erro ao salvar estado ${estado.sigla}: ${error.message}`);
    }
  }

  /**
   * Salva município no banco local
   */
  private async salvarMunicipioLocal(municipio: Municipio, estadoId: string): Promise<void> {
    try {
      await this.prisma.municipio.upsert({
        where: { codigo: municipio.id.toString() },
        update: {
          nome: municipio.nome,
          updatedAt: new Date()
        },
        create: {
          codigo: municipio.id.toString(),
          nome: municipio.nome,
          estadoId: estadoId,
          ativo: true
        }
      });
    } catch (error) {
      this.logger.error(`Erro ao salvar município ${municipio.nome}: ${error.message}`);
    }
  }

  /**
   * Mapeia nome da região para ID
   */
  private getRegiaoId(nomeRegiao: string): number {
    const regioes = {
      'Norte': 1,
      'Nordeste': 2,
      'Sudeste': 3,
      'Sul': 4,
      'Centro-Oeste': 5
    };
    return regioes[nomeRegiao] || 0;
  }

  /**
   * Mapeia nome da região para sigla
   */
  private getRegiaoSigla(nomeRegiao: string): string {
    const regioes = {
      'Norte': 'N',
      'Nordeste': 'NE',
      'Sudeste': 'SE',
      'Sul': 'S',
      'Centro-Oeste': 'CO'
    };
    return regioes[nomeRegiao] || '';
  }
}
