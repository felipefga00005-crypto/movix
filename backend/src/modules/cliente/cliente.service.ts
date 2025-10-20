import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    // Verificar se documento já existe
    const existingCliente = await this.prisma.cliente.findUnique({
      where: { documento: createClienteDto.documento },
    });

    if (existingCliente) {
      throw new ConflictException('Documento já cadastrado');
    }

    // Verificar se município e estado existem
    const municipio = await this.prisma.municipio.findUnique({
      where: { id: createClienteDto.municipioId },
      include: { estado: true },
    });

    if (!municipio) {
      throw new NotFoundException('Município não encontrado');
    }

    if (municipio.estadoId !== createClienteDto.estadoId) {
      throw new ConflictException('Município não pertence ao estado informado');
    }

    // Validar documento (CPF ou CNPJ)
    this.validateDocumento(createClienteDto.documento, createClienteDto.tipo);

    return this.prisma.cliente.create({
      data: createClienteDto,
      include: {
        municipio: {
          include: { estado: true },
        },
        estado: true,
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
            { nome: { contains: search, mode: 'insensitive' as const } },
            { documento: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      ],
    } : { ativo: true };

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        include: {
          municipio: {
            include: { estado: true },
          },
          estado: true,
        },
        orderBy: { nome: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        municipio: {
          include: { estado: true },
        },
        estado: true,
        nfes: {
          select: {
            id: true,
            numero: true,
            serie: true,
            chave: true,
            status: true,
            valorTotal: true,
            dataEmissao: true,
          },
          orderBy: { dataEmissao: 'desc' },
          take: 10,
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async findByDocumento(documento: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { documento },
      include: {
        municipio: {
          include: { estado: true },
        },
        estado: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.findOne(id);

    // Se está alterando documento, verificar se não existe outro com o mesmo
    if (updateClienteDto.documento && updateClienteDto.documento !== cliente.documento) {
      const existingCliente = await this.prisma.cliente.findUnique({
        where: { documento: updateClienteDto.documento },
      });

      if (existingCliente) {
        throw new ConflictException('Documento já cadastrado');
      }

      // Validar novo documento
      const tipo = updateClienteDto.tipo || cliente.tipo;
      this.validateDocumento(updateClienteDto.documento, tipo);
    }

    // Verificar município e estado se fornecidos
    if (updateClienteDto.municipioId || updateClienteDto.estadoId) {
      const municipioId = updateClienteDto.municipioId || cliente.municipioId;
      const estadoId = updateClienteDto.estadoId || cliente.estadoId;

      const municipio = await this.prisma.municipio.findUnique({
        where: { id: municipioId },
        include: { estado: true },
      });

      if (!municipio) {
        throw new NotFoundException('Município não encontrado');
      }

      if (municipio.estadoId !== estadoId) {
        throw new ConflictException('Município não pertence ao estado informado');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
      include: {
        municipio: {
          include: { estado: true },
        },
        estado: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Verificar se cliente tem NFes
    const nfeCount = await this.prisma.nfe.count({
      where: { clienteId: id },
    });

    if (nfeCount > 0) {
      // Apenas desativar se tem NFes
      return this.prisma.cliente.update({
        where: { id },
        data: { ativo: false },
      });
    } else {
      // Pode deletar se não tem NFes
      return this.prisma.cliente.delete({
        where: { id },
      });
    }
  }

  private validateDocumento(documento: string, tipo: string): void {
    if (tipo === 'FISICA') {
      if (documento.length !== 11) {
        throw new ConflictException('CPF deve ter 11 dígitos');
      }
      // Aqui poderia adicionar validação de CPF
    } else if (tipo === 'JURIDICA') {
      if (documento.length !== 14) {
        throw new ConflictException('CNPJ deve ter 14 dígitos');
      }
      // Aqui poderia adicionar validação de CNPJ
    }
  }

  async getClientesForSelect() {
    return this.prisma.cliente.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        documento: true,
        tipo: true,
      },
      orderBy: { nome: 'asc' },
    });
  }
}
