import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmitenteService } from '../emitente/emitente.service';
import { NfeIntegrationService } from './nfe-integration.service';
import { FileStorageService } from '../../common/services/file-storage.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';

@Injectable()
export class NfeService {
  constructor(
    private prisma: PrismaService,
    private emitenteService: EmitenteService,
    private nfeIntegrationService: NfeIntegrationService,
    private fileStorageService: FileStorageService,
  ) {}

  async create(createNfeDto: CreateNfeDto) {
    // Verificar se emitente existe
    const emitente = await this.emitenteService.findOne(createNfeDto.emitenteId);

    // Verificar se cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: createNfeDto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Obter próximo número da NFe
    const proximoNumero = await this.emitenteService.getProximoNumeroNfe(createNfeDto.emitenteId);

    // Calcular totais
    const totais = await this.calcularTotais(createNfeDto);

    // Criar NFe no banco
    const nfe = await this.prisma.nfe.create({
      data: {
        emitenteId: createNfeDto.emitenteId,
        clienteId: createNfeDto.clienteId,
        numero: proximoNumero,
        serie: createNfeDto.serie,
        codigoNumerico: String(Math.floor(Math.random() * 100000000)).padStart(8, '0'),
        naturezaOperacao: createNfeDto.naturezaOperacao,
        tipoOperacao: createNfeDto.tipoOperacao,
        consumidorFinal: createNfeDto.consumidorFinal,
        presencaComprador: createNfeDto.presencaComprador,
        dataEmissao: createNfeDto.dataEmissao ? new Date(createNfeDto.dataEmissao) : new Date(),
        dataSaida: createNfeDto.dataSaida ? new Date(createNfeDto.dataSaida) : null,
        modalidadeFrete: createNfeDto.modalidadeFrete || 9,
        valorProdutos: totais.valorProdutos,
        valorFrete: createNfeDto.valorFrete || 0,
        valorSeguro: createNfeDto.valorSeguro || 0,
        valorDesconto: createNfeDto.valorDesconto || 0,
        valorOutros: createNfeDto.valorOutros || 0,
        valorTotal: totais.valorTotal,
        baseCalculoICMS: totais.baseCalculoICMS,
        valorICMS: totais.valorICMS,
        valorIPI: totais.valorIPI,
        valorPIS: totais.valorPIS,
        valorCOFINS: totais.valorCOFINS,
        informacoesAdicionais: createNfeDto.informacoesAdicionais,
        informacoesFisco: createNfeDto.informacoesFisco,
        status: 'DIGITACAO',
      },
    });

    // Criar itens da NFe
    for (const itemDto of createNfeDto.itens) {
      const produto = await this.prisma.produto.findUnique({
        where: { id: itemDto.produtoId },
        include: { ncm: true },
      });

      if (!produto) {
        throw new NotFoundException(`Produto não encontrado: ${itemDto.produtoId}`);
      }

      const cfop = await this.prisma.cFOP.findUnique({
        where: { id: itemDto.cfopId },
      });

      if (!cfop) {
        throw new NotFoundException(`CFOP não encontrado: ${itemDto.cfopId}`);
      }

      const valorTotal = itemDto.quantidadeComercial * itemDto.valorUnitario;

      const nfeItem = await this.prisma.nfeItem.create({
        data: {
          nfeId: nfe.id,
          numeroItem: itemDto.numeroItem,
          produtoId: itemDto.produtoId,
          codigo: produto.codigo,
          codigoBarras: produto.codigoBarras,
          descricao: produto.descricao,
          ncmId: produto.ncmId,
          cfopId: itemDto.cfopId,
          unidadeComercial: produto.unidade,
          quantidadeComercial: itemDto.quantidadeComercial,
          valorUnitario: itemDto.valorUnitario,
          valorTotal: valorTotal,
          unidadeTributavel: produto.unidadeTributavel || produto.unidade,
          quantidadeTributavel: itemDto.quantidadeComercial,
          valorUnitarioTrib: itemDto.valorUnitario,
          valorFrete: itemDto.valorFrete || 0,
          valorSeguro: itemDto.valorSeguro || 0,
          valorDesconto: itemDto.valorDesconto || 0,
          valorOutros: itemDto.valorOutros || 0,
          origem: produto.origem,
          informacoesAdicionais: itemDto.informacoesAdicionais,
        },
      });

      // Criar tributação ICMS
      if (itemDto.icmsCstId || itemDto.icmsCsosnId) {
        await this.prisma.nfeItemICMS.create({
          data: {
            nfeItemId: nfeItem.id,
            origem: produto.origem,
            cstId: itemDto.icmsCstId,
            csosnId: itemDto.icmsCsosnId,
            baseCalculo: itemDto.icmsBaseCalculo || 0,
            aliquota: itemDto.icmsAliquota || 0,
            valor: itemDto.icmsValor || 0,
          },
        });
      }

      // Criar tributação PIS
      await this.prisma.nfeItemPIS.create({
        data: {
          nfeItemId: nfeItem.id,
          cstId: itemDto.pisCstId,
          baseCalculo: itemDto.pisBaseCalculo || 0,
          aliquota: itemDto.pisAliquota || 0,
          valor: itemDto.pisValor || 0,
        },
      });

      // Criar tributação COFINS
      await this.prisma.nfeItemCOFINS.create({
        data: {
          nfeItemId: nfeItem.id,
          cstId: itemDto.cofinsCstId,
          baseCalculo: itemDto.cofinsBaseCalculo || 0,
          aliquota: itemDto.cofinsAliquota || 0,
          valor: itemDto.cofinsValor || 0,
        },
      });
    }

    // Criar pagamentos se fornecidos
    if (createNfeDto.pagamentos && createNfeDto.pagamentos.length > 0) {
      for (const pagamentoDto of createNfeDto.pagamentos) {
        await this.prisma.nfePagamento.create({
          data: {
            nfeId: nfe.id,
            formaPagamento: pagamentoDto.formaPagamento,
            valor: pagamentoDto.valor,
            tipoIntegracao: pagamentoDto.tipoIntegracao,
            cnpjCredenciadora: pagamentoDto.cnpjCredenciadora,
            bandeira: pagamentoDto.bandeira,
            numeroAutorizacao: pagamentoDto.numeroAutorizacao,
            valorTroco: pagamentoDto.valorTroco,
          },
        });
      }
    }

    return this.findOne(nfe.id);
  }

  async findAll(page: number = 1, limit: number = 10, emitenteId?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (emitenteId) where.emitenteId = emitenteId;
    if (status) where.status = status;

    const [nfes, total] = await Promise.all([
      this.prisma.nfe.findMany({
        where,
        include: {
          emitente: {
            select: {
              id: true,
              razaoSocial: true,
              cnpj: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nome: true,
              documento: true,
              tipo: true,
            },
          },
        },
        orderBy: { dataEmissao: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.nfe.count({ where }),
    ]);

    return {
      data: nfes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const nfe = await this.prisma.nfe.findUnique({
      where: { id },
      include: {
        emitente: {
          include: {
            municipio: { include: { estado: true } },
            estado: true,
          },
        },
        cliente: {
          include: {
            municipio: { include: { estado: true } },
            estado: true,
          },
        },
        itens: {
          include: {
            produto: { include: { ncm: true } },
            ncm: true,
            cfop: true,
            icms: { include: { cst: true, csosn: true } },
            ipi: { include: { cst: true } },
            pis: { include: { cst: true } },
            cofins: { include: { cst: true } },
          },
          orderBy: { numeroItem: 'asc' },
        },
        pagamentos: true,
        eventos: {
          orderBy: { dataEvento: 'desc' },
        },
      },
    });

    if (!nfe) {
      throw new NotFoundException('NFe não encontrada');
    }

    return nfe;
  }

  async update(id: string, updateNfeDto: UpdateNfeDto) {
    // Verificar se a NFe existe
    const nfeExistente = await this.prisma.nfe.findUnique({
      where: { id },
    });

    if (!nfeExistente) {
      throw new NotFoundException('NFe não encontrada');
    }

    // Verificar se a NFe pode ser editada (apenas em digitação)
    if (nfeExistente.status !== 'DIGITACAO') {
      throw new ConflictException('NFe não pode ser editada após transmissão');
    }

    // Atualizar a NFe
    const nfeAtualizada = await this.prisma.nfe.update({
      where: { id },
      data: updateNfeDto,
      include: {
        emitente: {
          include: {
            municipio: { include: { estado: true } },
            estado: true,
          },
        },
        cliente: {
          include: {
            municipio: { include: { estado: true } },
            estado: true,
          },
        },
        itens: {
          include: {
            produto: { include: { ncm: true } },
            ncm: true,
            cfop: true,
            icms: { include: { cst: true, csosn: true } },
            ipi: { include: { cst: true } },
            pis: { include: { cst: true } },
            cofins: { include: { cst: true } },
          },
          orderBy: { numeroItem: 'asc' },
        },
        pagamentos: true,
        eventos: {
          orderBy: { dataEvento: 'desc' },
        },
      },
    });

    return nfeAtualizada;
  }

  async transmitir(id: string) {
    const nfe = await this.findOne(id);

    if (nfe.status !== 'DIGITACAO') {
      throw new BadRequestException('NFe não está em status de digitação');
    }

    try {
      // Gerar e transmitir NFe usando o microserviço
      const resultado = await this.nfeIntegrationService.generateNfeFromDatabase(id);

      // Salvar XMLs no storage se disponíveis
      if (resultado.data?.chave && resultado.data?.xml) {
        const chave = resultado.data.chave;

        // Salvar XML autorizado (único XML disponível no retorno)
        await this.fileStorageService.saveXml(chave, resultado.data.xml, 'authorized');
      }

      // Atualizar NFe com resultado da transmissão
      const nfeAtualizada = await this.prisma.nfe.update({
        where: { id },
        data: {
          chave: resultado.data?.chave,
          protocolo: resultado.data?.protocolo,
          dataAutorizacao: resultado.data?.dataAutorizacao ? new Date(resultado.data.dataAutorizacao) : null,
          status: resultado.success ? 'AUTORIZADA' : 'REJEITADA',
          motivoStatus: resultado.message,
          xmlAutorizado: resultado.data?.xml,
        },
      });

      return {
        success: resultado.success,
        nfe: nfeAtualizada,
        resultado,
      };
    } catch (error) {
      // Atualizar status para erro
      await this.prisma.nfe.update({
        where: { id },
        data: {
          status: 'ERRO',
          motivoStatus: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Obter XML da NFe do storage
   */
  async getXmlFile(chave: string, type: 'generated' | 'signed' | 'authorized' = 'authorized'): Promise<string | null> {
    return this.fileStorageService.getXml(chave, type);
  }

  /**
   * Obter PDF da NFe do storage
   */
  async getPdfFile(chave: string): Promise<Buffer | null> {
    return this.fileStorageService.getPdf(chave);
  }

  /**
   * Obter informações dos arquivos da NFe
   */
  async getFileInfo(chave: string) {
    const xmlGenerated = await this.fileStorageService.getFileInfo(chave, 'xml', 'generated');
    const xmlSigned = await this.fileStorageService.getFileInfo(chave, 'xml', 'signed');
    const xmlAuthorized = await this.fileStorageService.getFileInfo(chave, 'xml', 'authorized');
    const pdf = await this.fileStorageService.getFileInfo(chave, 'pdf');

    return {
      chave,
      xml: {
        generated: xmlGenerated,
        signed: xmlSigned,
        authorized: xmlAuthorized,
      },
      pdf,
    };
  }

  /**
   * Salvar PDF da NFe
   */
  async savePdfFile(chave: string, pdf: Buffer) {
    return this.fileStorageService.savePdf(chave, pdf);
  }

  private async calcularTotais(createNfeDto: CreateNfeDto) {
    let valorProdutos = 0;
    let baseCalculoICMS = 0;
    let valorICMS = 0;
    let valorIPI = 0;
    let valorPIS = 0;
    let valorCOFINS = 0;

    for (const item of createNfeDto.itens) {
      const valorTotalItem = item.quantidadeComercial * item.valorUnitario;
      valorProdutos += valorTotalItem;
      
      baseCalculoICMS += item.icmsBaseCalculo || 0;
      valorICMS += item.icmsValor || 0;
      valorPIS += item.pisValor || 0;
      valorCOFINS += item.cofinsValor || 0;
    }

    const valorTotal = valorProdutos + 
                      (createNfeDto.valorFrete || 0) + 
                      (createNfeDto.valorSeguro || 0) + 
                      (createNfeDto.valorOutros || 0) - 
                      (createNfeDto.valorDesconto || 0);

    return {
      valorProdutos,
      valorTotal,
      baseCalculoICMS,
      valorICMS,
      valorIPI,
      valorPIS,
      valorCOFINS,
    };
  }
}
