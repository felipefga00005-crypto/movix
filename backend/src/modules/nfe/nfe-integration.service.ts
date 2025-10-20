import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

export interface NfeGenerationRequest {
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    inscricaoEstadual: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      municipio: string;
      uf: string;
    };
  };
  cliente: {
    tipo: 'FISICA' | 'JURIDICA';
    documento: string;
    nome: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
      municipio: string;
      uf: string;
    };
    indicadorIE: number;
    inscricaoEstadual?: string;
  };
  nfe: {
    numero: number;
    serie: number;
    naturezaOperacao: string;
    tipoOperacao: number;
    consumidorFinal: number;
    presencaComprador: number;
    dataEmissao: string;
    dataSaida?: string;
  };
  itens: Array<{
    numeroItem: number;
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    origem: string;
    tributacao: {
      icms: {
        origem: string;
        cst?: string;
        csosn?: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      ipi?: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      pis: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      cofins: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
    };
  }>;
  totais: {
    valorProdutos: number;
    valorTotal: number;
    baseCalculoICMS: number;
    valorICMS: number;
    valorIPI: number;
    valorPIS: number;
    valorCOFINS: number;
  };
  pagamentos?: Array<{
    formaPagamento: string;
    valor: number;
  }>;
  informacoesAdicionais?: string;
}

export interface NfeGenerationResponse {
  success: boolean;
  message: string;
  data?: {
    chave?: string;
    numero: number;
    serie: number;
    protocolo?: string;
    dataAutorizacao?: string;
    xml?: string;
    status: string;
  };
  errors?: string[];
}

@Injectable()
export class NfeIntegrationService {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('nfeService.url') || 'http://localhost:8080';
    this.apiKey = this.configService.get<string>('nfeService.apiKey') || 'sua_api_key_secreta_aqui';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });

    // Interceptor para tratamento de erros
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message || 'Erro na comunicação com o serviço NFe';
        throw new HttpException(message, error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
      },
    );
  }

  async checkHealth(): Promise<any> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data;
    } catch (error) {
      throw new HttpException('Serviço NFe indisponível', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async checkSefazStatus(): Promise<any> {
    try {
      const response = await this.httpClient.get('/api/v1/test/sefaz-status');
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao verificar status SEFAZ', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async generateNfe(request: NfeGenerationRequest): Promise<NfeGenerationResponse> {
    try {
      const response = await this.httpClient.post('/api/v1/nfe/generate', request);
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao gerar NFe', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async consultarNfe(chave: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/api/v1/nfe/consultar/${chave}`);
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao consultar NFe', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelarNfe(chave: string, justificativa: string): Promise<any> {
    try {
      const response = await this.httpClient.post(`/api/v1/nfe/cancelar/${chave}`, {
        justificativa,
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao cancelar NFe', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async cartaCorrecao(chave: string, correcao: string, sequencia: number = 1): Promise<any> {
    try {
      const response = await this.httpClient.post(`/api/v1/nfe/carta-correcao/${chave}`, {
        correcao,
        sequencia,
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao enviar carta de correção', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async generateNfeFromDatabase(nfeId: string): Promise<NfeGenerationResponse> {
    // Buscar NFe completa do banco de dados
    const nfe = await this.prisma.nfe.findUnique({
      where: { id: nfeId },
      include: {
        emitente: {
          include: {
            municipio: {
              include: { estado: true },
            },
            estado: true,
          },
        },
        cliente: {
          include: {
            municipio: {
              include: { estado: true },
            },
            estado: true,
          },
        },
        itens: {
          include: {
            produto: {
              include: {
                ncm: true,
                cest: true,
              },
            },
            ncm: true,
            cfop: true,
            icms: {
              include: {
                cst: true,
                csosn: true,
              },
            },
            ipi: {
              include: {
                cst: true,
              },
            },
            pis: {
              include: {
                cst: true,
              },
            },
            cofins: {
              include: {
                cst: true,
              },
            },
          },
          orderBy: { numeroItem: 'asc' },
        },
        pagamentos: true,
      },
    });

    if (!nfe) {
      throw new HttpException('NFe não encontrada', HttpStatus.NOT_FOUND);
    }

    // Converter dados do banco para formato do microserviço
    const nfeRequest: NfeGenerationRequest = {
      emitente: {
        cnpj: nfe.emitente.cnpj,
        razaoSocial: nfe.emitente.razaoSocial,
        nomeFantasia: nfe.emitente.nomeFantasia || undefined,
        inscricaoEstadual: nfe.emitente.inscricaoEstadual || '',
        endereco: {
          logradouro: nfe.emitente.logradouro,
          numero: nfe.emitente.numero,
          complemento: nfe.emitente.complemento || undefined,
          bairro: nfe.emitente.bairro,
          cep: nfe.emitente.cep,
          municipio: nfe.emitente.municipio.nome,
          uf: nfe.emitente.estado.uf,
        },
      },
      cliente: {
        tipo: nfe.cliente.tipo as 'FISICA' | 'JURIDICA',
        documento: nfe.cliente.documento,
        nome: nfe.cliente.nome,
        endereco: {
          logradouro: nfe.cliente.logradouro,
          numero: nfe.cliente.numero,
          complemento: nfe.cliente.complemento || undefined,
          bairro: nfe.cliente.bairro,
          cep: nfe.cliente.cep,
          municipio: nfe.cliente.municipio.nome,
          uf: nfe.cliente.estado.uf,
        },
        indicadorIE: nfe.cliente.indicadorIE,
        inscricaoEstadual: nfe.cliente.inscricaoEstadual || undefined,
      },
      nfe: {
        numero: nfe.numero,
        serie: nfe.serie,
        naturezaOperacao: nfe.naturezaOperacao,
        tipoOperacao: nfe.tipoOperacao,
        consumidorFinal: nfe.consumidorFinal,
        presencaComprador: nfe.presencaComprador,
        dataEmissao: nfe.dataEmissao.toISOString(),
        dataSaida: nfe.dataSaida?.toISOString(),
      },
      itens: nfe.itens.map(item => ({
        numeroItem: item.numeroItem,
        codigo: item.codigo,
        descricao: item.descricao,
        ncm: item.ncm.codigo,
        cfop: item.cfop.codigo,
        unidade: item.unidadeComercial,
        quantidade: Number(item.quantidadeComercial),
        valorUnitario: Number(item.valorUnitario),
        valorTotal: Number(item.valorTotal),
        origem: item.origem,
        tributacao: {
          icms: {
            origem: item.origem,
            cst: item.icms?.cst?.codigo,
            csosn: item.icms?.csosn?.codigo,
            baseCalculo: item.icms ? Number(item.icms.baseCalculo) : 0,
            aliquota: item.icms ? Number(item.icms.aliquota) : 0,
            valor: item.icms ? Number(item.icms.valor) : 0,
          },
          ipi: item.ipi ? {
            cst: item.ipi.cst.codigo,
            baseCalculo: Number(item.ipi.baseCalculo),
            aliquota: Number(item.ipi.aliquota),
            valor: Number(item.ipi.valor),
          } : undefined,
          pis: item.pis ? {
            cst: item.pis.cst.codigo,
            baseCalculo: Number(item.pis.baseCalculo),
            aliquota: Number(item.pis.aliquota),
            valor: Number(item.pis.valor),
          } : { cst: '01', baseCalculo: 0, aliquota: 0, valor: 0 },
          cofins: item.cofins ? {
            cst: item.cofins.cst.codigo,
            baseCalculo: Number(item.cofins.baseCalculo),
            aliquota: Number(item.cofins.aliquota),
            valor: Number(item.cofins.valor),
          } : { cst: '01', baseCalculo: 0, aliquota: 0, valor: 0 },
        },
      })),
      totais: {
        valorProdutos: Number(nfe.valorProdutos),
        valorTotal: Number(nfe.valorTotal),
        baseCalculoICMS: Number(nfe.baseCalculoICMS),
        valorICMS: Number(nfe.valorICMS),
        valorIPI: Number(nfe.valorIPI),
        valorPIS: Number(nfe.valorPIS),
        valorCOFINS: Number(nfe.valorCOFINS),
      },
      pagamentos: nfe.pagamentos?.map(pag => ({
        formaPagamento: pag.formaPagamento,
        valor: Number(pag.valor),
      })),
      informacoesAdicionais: nfe.informacoesAdicionais || undefined,
    };

    // Enviar para o microserviço
    return this.generateNfe(nfeRequest);
  }
}
