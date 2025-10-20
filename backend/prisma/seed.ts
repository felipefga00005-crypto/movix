import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Estados brasileiros
  console.log('📍 Criando estados...');
  const estados = [
    { codigo: '12', uf: 'AC', nome: 'Acre', regiao: 'Norte' },
    { codigo: '27', uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste' },
    { codigo: '16', uf: 'AP', nome: 'Amapá', regiao: 'Norte' },
    { codigo: '13', uf: 'AM', nome: 'Amazonas', regiao: 'Norte' },
    { codigo: '29', uf: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
    { codigo: '23', uf: 'CE', nome: 'Ceará', regiao: 'Nordeste' },
    { codigo: '53', uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste' },
    { codigo: '32', uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste' },
    { codigo: '52', uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste' },
    { codigo: '21', uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste' },
    { codigo: '51', uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste' },
    { codigo: '50', uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste' },
    { codigo: '31', uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste' },
    { codigo: '15', uf: 'PA', nome: 'Pará', regiao: 'Norte' },
    { codigo: '25', uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste' },
    { codigo: '41', uf: 'PR', nome: 'Paraná', regiao: 'Sul' },
    { codigo: '26', uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
    { codigo: '22', uf: 'PI', nome: 'Piauí', regiao: 'Nordeste' },
    { codigo: '33', uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
    { codigo: '24', uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste' },
    { codigo: '43', uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
    { codigo: '11', uf: 'RO', nome: 'Rondônia', regiao: 'Norte' },
    { codigo: '14', uf: 'RR', nome: 'Roraima', regiao: 'Norte' },
    { codigo: '42', uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul' },
    { codigo: '35', uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste' },
    { codigo: '28', uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste' },
    { codigo: '17', uf: 'TO', nome: 'Tocantins', regiao: 'Norte' },
  ];

  for (const estado of estados) {
    await prisma.estado.upsert({
      where: { uf: estado.uf },
      update: {},
      create: estado,
    });
  }

  // Alguns municípios importantes
  console.log('🏙️ Criando municípios...');
  const estadoSP = await prisma.estado.findUnique({ where: { uf: 'SP' } });
  const estadoRJ = await prisma.estado.findUnique({ where: { uf: 'RJ' } });
  const estadoMG = await prisma.estado.findUnique({ where: { uf: 'MG' } });
  const estadoMA = await prisma.estado.findUnique({ where: { uf: 'MA' } });
  const estadoGO = await prisma.estado.findUnique({ where: { uf: 'GO' } });

  if (!estadoSP || !estadoRJ || !estadoMG || !estadoMA || !estadoGO) {
    throw new Error('Estados não encontrados');
  }

  const municipios = [
    { codigo: '3550308', nome: 'São Paulo', estadoId: estadoSP.id },
    { codigo: '3304557', nome: 'Rio de Janeiro', estadoId: estadoRJ.id },
    { codigo: '3106200', nome: 'Belo Horizonte', estadoId: estadoMG.id },
    { codigo: '2105302', nome: 'Imperatriz', estadoId: estadoMA.id },
    { codigo: '2104552', nome: 'Governador Edison Lobão', estadoId: estadoMA.id },
    { codigo: '5208707', nome: 'Goiânia', estadoId: estadoGO.id },
  ];

  for (const municipio of municipios) {
    await prisma.municipio.upsert({
      where: { codigo: municipio.codigo },
      update: {},
      create: municipio,
    });
  }

  // NCMs básicos
  console.log('📦 Criando NCMs...');
  const ncms = [
    { codigo: '44152000', descricao: 'Paletes, coleiras e outras plataformas para carga, de madeira', unidade: 'UN' },
    { codigo: '87164000', descricao: 'Reboques e semi-reboques, para qualquer veículo; outros veículos não autopropulsados', unidade: 'UN' },
    { codigo: '84716000', descricao: 'Unidades de entrada ou de saída, podendo conter, no mesmo corpo, unidades de memória', unidade: 'UN' },
    { codigo: '85171200', descricao: 'Telefones para redes celulares ou para outras redes sem fio', unidade: 'UN' },
  ];

  for (const ncm of ncms) {
    await prisma.nCM.upsert({
      where: { codigo: ncm.codigo },
      update: {},
      create: ncm,
    });
  }

  // CFOPs básicos
  console.log('🔢 Criando CFOPs...');
  const cfops = [
    { codigo: '5101', descricao: 'Venda de produção do estabelecimento', aplicacao: 'Dentro do estado', tipo: 'Saída' },
    { codigo: '5102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', aplicacao: 'Dentro do estado', tipo: 'Saída' },
    { codigo: '6101', descricao: 'Venda de produção do estabelecimento', aplicacao: 'Fora do estado', tipo: 'Saída' },
    { codigo: '6102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', aplicacao: 'Fora do estado', tipo: 'Saída' },
    { codigo: '1101', descricao: 'Compra para industrialização ou produção rural', aplicacao: 'Dentro do estado', tipo: 'Entrada' },
    { codigo: '1102', descricao: 'Compra para comercialização', aplicacao: 'Dentro do estado', tipo: 'Entrada' },
  ];

  for (const cfop of cfops) {
    await prisma.cFOP.upsert({
      where: { codigo: cfop.codigo },
      update: {},
      create: cfop,
    });
  }

  // CSOSNs do Simples Nacional
  console.log('🏛️ Criando CSOSNs...');
  const csosns = [
    { codigo: '101', descricao: 'Tributada pelo Simples Nacional com permissão de crédito' },
    { codigo: '102', descricao: 'Tributada pelo Simples Nacional sem permissão de crédito' },
    { codigo: '103', descricao: 'Isenção do ICMS no Simples Nacional para faixa de receita bruta' },
    { codigo: '201', descricao: 'Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por substituição tributária' },
    { codigo: '202', descricao: 'Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por substituição tributária' },
    { codigo: '203', descricao: 'Isenção do ICMS no Simples Nacional para faixa de receita bruta e com cobrança do ICMS por substituição tributária' },
    { codigo: '300', descricao: 'Imune' },
    { codigo: '400', descricao: 'Não tributada pelo Simples Nacional' },
    { codigo: '500', descricao: 'ICMS cobrado anteriormente por substituição tributária (substituído) ou por antecipação' },
    { codigo: '900', descricao: 'Outros' },
  ];

  for (const csosn of csosns) {
    await prisma.cSOSN.upsert({
      where: { codigo: csosn.codigo },
      update: {},
      create: csosn,
    });
  }

  // CSTs básicos
  console.log('📊 Criando CSTs...');
  // Limpar CSTs existentes
  await prisma.cST.deleteMany({});

  const csts = [
    // ICMS
    { codigo: '00', descricao: 'Tributada integralmente', tipo: 'ICMS' },
    { codigo: '10', descricao: 'Tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
    { codigo: '20', descricao: 'Com redução de base de cálculo', tipo: 'ICMS' },
    { codigo: '30', descricao: 'Isenta ou não tributada e com cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
    { codigo: '40', descricao: 'Isenta', tipo: 'ICMS' },
    { codigo: '41', descricao: 'Não tributada', tipo: 'ICMS' },
    { codigo: '50', descricao: 'Suspensão', tipo: 'ICMS' },
    { codigo: '51', descricao: 'Diferimento', tipo: 'ICMS' },
    { codigo: '60', descricao: 'ICMS cobrado anteriormente por substituição tributária', tipo: 'ICMS' },
    { codigo: '70', descricao: 'Com redução de base de cálculo e cobrança do ICMS por substituição tributária', tipo: 'ICMS' },
    { codigo: '90', descricao: 'Outras', tipo: 'ICMS' },
    
    // PIS
    { codigo: '01', descricao: 'Operação Tributável (base de cálculo = valor da operação alíquota normal)', tipo: 'PIS' },
    { codigo: '02', descricao: 'Operação Tributável (base de cálculo = valor da operação alíquota diferenciada)', tipo: 'PIS' },
    { codigo: '49', descricao: 'Outras Operações de Saída', tipo: 'PIS' },
    
    // COFINS
    { codigo: '01', descricao: 'Operação Tributável (base de cálculo = valor da operação alíquota normal)', tipo: 'COFINS' },
    { codigo: '02', descricao: 'Operação Tributável (base de cálculo = valor da operação alíquota diferenciada)', tipo: 'COFINS' },
    { codigo: '49', descricao: 'Outras Operações de Saída', tipo: 'COFINS' },
    
    // IPI
    { codigo: '00', descricao: 'Entrada com recuperação de crédito', tipo: 'IPI' },
    { codigo: '49', descricao: 'Outras entradas', tipo: 'IPI' },
    { codigo: '50', descricao: 'Saída tributada', tipo: 'IPI' },
    { codigo: '99', descricao: 'Outras saídas', tipo: 'IPI' },
  ];

  await prisma.cST.createMany({
    data: csts,
    skipDuplicates: true,
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
