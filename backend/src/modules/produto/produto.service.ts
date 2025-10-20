import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async create(createProdutoDto: CreateProdutoDto) {
    // Verificar se código já existe
    const existingProduto = await this.prisma.produto.findUnique({
      where: { codigo: createProdutoDto.codigo },
    });

    if (existingProduto) {
      throw new ConflictException('Código do produto já cadastrado');
    }

    // Verificar se NCM existe
    const ncm = await this.prisma.nCM.findUnique({
      where: { id: createProdutoDto.ncmId },
    });

    if (!ncm) {
      throw new NotFoundException('NCM não encontrado');
    }

    // Verificar CEST se fornecido
    if (createProdutoDto.cestId) {
      const cest = await this.prisma.cEST.findUnique({
        where: { id: createProdutoDto.cestId },
      });

      if (!cest) {
        throw new NotFoundException('CEST não encontrado');
      }
    }

    // Verificar fornecedor se fornecido
    if (createProdutoDto.fornecedorId) {
      const fornecedor = await this.prisma.fornecedor.findUnique({
        where: { id: createProdutoDto.fornecedorId },
      });

      if (!fornecedor) {
        throw new NotFoundException('Fornecedor não encontrado');
      }
    }

    return this.prisma.produto.create({
      data: createProdutoDto,
      include: {
        ncm: true,
        cest: true,
        fornecedor: true,
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      AND: [
        { ativo: true },
        {
          OR: [
            { codigo: { contains: search, mode: 'insensitive' as const } },
            { descricao: { contains: search, mode: 'insensitive' as const } },
            { codigoBarras: { contains: search } },
          ],
        },
      ],
    } : { ativo: true };

    const [produtos, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        include: {
          ncm: true,
          cest: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
              documento: true,
            },
          },
        },
        orderBy: { descricao: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.produto.count({ where }),
    ]);

    return {
      data: produtos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        ncm: true,
        cest: true,
        fornecedor: true,
        nfeItens: {
          select: {
            id: true,
            nfe: {
              select: {
                numero: true,
                serie: true,
                chave: true,
                status: true,
                dataEmissao: true,
              },
            },
            quantidadeComercial: true,
            valorUnitario: true,
            valorTotal: true,
          },
          orderBy: {
            nfe: {
              dataEmissao: 'desc',
            },
          },
          take: 10,
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async findByCodigo(codigo: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { codigo },
      include: {
        ncm: true,
        cest: true,
        fornecedor: true,
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    const produto = await this.findOne(id);

    // Se está alterando código, verificar se não existe outro com o mesmo
    if (updateProdutoDto.codigo && updateProdutoDto.codigo !== produto.codigo) {
      const existingProduto = await this.prisma.produto.findUnique({
        where: { codigo: updateProdutoDto.codigo },
      });

      if (existingProduto) {
        throw new ConflictException('Código do produto já cadastrado');
      }
    }

    // Verificar NCM se fornecido
    if (updateProdutoDto.ncmId) {
      const ncm = await this.prisma.nCM.findUnique({
        where: { id: updateProdutoDto.ncmId },
      });

      if (!ncm) {
        throw new NotFoundException('NCM não encontrado');
      }
    }

    // Verificar CEST se fornecido
    if (updateProdutoDto.cestId) {
      const cest = await this.prisma.cEST.findUnique({
        where: { id: updateProdutoDto.cestId },
      });

      if (!cest) {
        throw new NotFoundException('CEST não encontrado');
      }
    }

    // Verificar fornecedor se fornecido
    if (updateProdutoDto.fornecedorId) {
      const fornecedor = await this.prisma.fornecedor.findUnique({
        where: { id: updateProdutoDto.fornecedorId },
      });

      if (!fornecedor) {
        throw new NotFoundException('Fornecedor não encontrado');
      }
    }

    return this.prisma.produto.update({
      where: { id },
      data: updateProdutoDto,
      include: {
        ncm: true,
        cest: true,
        fornecedor: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar se produto tem itens de NFe
    const nfeItemCount = await this.prisma.nfeItem.count({
      where: { produtoId: id },
    });

    if (nfeItemCount > 0) {
      // Apenas desativar se tem itens de NFe
      return this.prisma.produto.update({
        where: { id },
        data: { ativo: false },
      });
    } else {
      // Pode deletar se não tem itens de NFe
      return this.prisma.produto.delete({
        where: { id },
      });
    }
  }

  async updateEstoque(id: string, quantidade: number, operacao: 'ENTRADA' | 'SAIDA') {
    const produto = await this.findOne(id);
    
    const novoEstoque = operacao === 'ENTRADA' 
      ? Number(produto.estoqueAtual) + quantidade
      : Number(produto.estoqueAtual) - quantidade;

    if (novoEstoque < 0) {
      throw new ConflictException('Estoque insuficiente');
    }

    return this.prisma.produto.update({
      where: { id },
      data: { estoqueAtual: novoEstoque },
    });
  }

  async getProdutosForSelect() {
    return this.prisma.produto.findMany({
      where: { ativo: true },
      select: {
        id: true,
        codigo: true,
        descricao: true,
        valorUnitario: true,
        unidade: true,
        estoqueAtual: true,
      },
      orderBy: { descricao: 'asc' },
    });
  }

  async getProdutosComEstoqueBaixo() {
    return this.prisma.produto.findMany({
      where: {
        ativo: true,
        estoqueMinimo: { not: null },
        estoqueAtual: {
          lte: this.prisma.produto.fields.estoqueMinimo,
        },
      },
      include: {
        ncm: true,
        fornecedor: {
          select: {
            id: true,
            nome: true,
            telefone: true,
            email: true,
          },
        },
      },
      orderBy: { descricao: 'asc' },
    });
  }
}
