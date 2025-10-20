import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class AuxiliaresController {
  constructor(private prisma: PrismaService) {}

  @Get('estados')
  async getEstados(@Query('search') search?: string) {
    const where = search ? {
      OR: [
        { nome: { contains: search, mode: 'insensitive' as const } },
        { uf: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const estados = await this.prisma.estado.findMany({
      where,
      orderBy: { nome: 'asc' },
      take: 50,
    });

    return { data: estados };
  }

  @Get('municipios')
  async getMunicipios(
    @Query('estadoId') estadoId?: string,
    @Query('search') search?: string,
  ) {
    const where: any = {};
    
    if (estadoId) {
      where.estadoId = estadoId;
    }
    
    if (search) {
      where.nome = { contains: search, mode: 'insensitive' as const };
    }

    const municipios = await this.prisma.municipio.findMany({
      where,
      include: { estado: true },
      orderBy: { nome: 'asc' },
      take: 100,
    });

    return { data: municipios };
  }

  @Get('ncms')
  async getNcms(@Query('search') search?: string) {
    const where = search ? {
      OR: [
        { codigo: { contains: search } },
        { descricao: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const ncms = await this.prisma.nCM.findMany({
      where,
      orderBy: { codigo: 'asc' },
      take: 50,
    });

    return { data: ncms };
  }

  @Get('cfops')
  async getCfops(@Query('search') search?: string) {
    const where = search ? {
      OR: [
        { codigo: { contains: search } },
        { descricao: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const cfops = await this.prisma.cFOP.findMany({
      where,
      orderBy: { codigo: 'asc' },
      take: 50,
    });

    return { data: cfops };
  }

  @Get('csts')
  async getCsts(@Query('tipo') tipo?: string) {
    const where = tipo ? { tipo } : {};

    const csts = await this.prisma.cST.findMany({
      where,
      orderBy: { codigo: 'asc' },
    });

    return { data: csts };
  }

  @Get('csosns')
  async getCsosns() {
    const csosns = await this.prisma.cSOSN.findMany({
      orderBy: { codigo: 'asc' },
    });

    return { data: csosns };
  }
}
