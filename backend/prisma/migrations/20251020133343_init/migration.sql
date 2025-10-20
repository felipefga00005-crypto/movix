-- CreateTable
CREATE TABLE "estados" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "uf" VARCHAR(2) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "regiao" VARCHAR(20) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "estadoId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ncm" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(8) NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidade" VARCHAR(10),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ncm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cfop" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(4) NOT NULL,
    "descricao" TEXT NOT NULL,
    "aplicacao" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cfop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cest" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(7) NOT NULL,
    "descricao" TEXT NOT NULL,
    "ncmId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "csosn" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "csosn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cst" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cst_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emitentes" (
    "id" TEXT NOT NULL,
    "cnpj" VARCHAR(14) NOT NULL,
    "razaoSocial" VARCHAR(200) NOT NULL,
    "nomeFantasia" VARCHAR(200),
    "inscricaoEstadual" VARCHAR(20),
    "inscricaoMunicipal" VARCHAR(20),
    "cnae" VARCHAR(10),
    "regimeTributario" INTEGER NOT NULL,
    "logradouro" VARCHAR(200) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "municipioId" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,
    "telefone" VARCHAR(20),
    "email" VARCHAR(100),
    "site" VARCHAR(100),
    "certificadoPath" VARCHAR(500),
    "certificadoPassword" VARCHAR(100),
    "ambienteNfe" INTEGER NOT NULL DEFAULT 2,
    "proximoNumeroNfe" INTEGER NOT NULL DEFAULT 1,
    "serieNfe" INTEGER NOT NULL DEFAULT 1,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emitentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "documento" VARCHAR(14) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "nomeFantasia" VARCHAR(200),
    "inscricaoEstadual" VARCHAR(20),
    "inscricaoMunicipal" VARCHAR(20),
    "logradouro" VARCHAR(200) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "municipioId" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,
    "telefone" VARCHAR(20),
    "celular" VARCHAR(20),
    "email" VARCHAR(100),
    "indicadorIE" INTEGER NOT NULL DEFAULT 9,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "documento" VARCHAR(14) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "nomeFantasia" VARCHAR(200),
    "inscricaoEstadual" VARCHAR(20),
    "inscricaoMunicipal" VARCHAR(20),
    "logradouro" VARCHAR(200) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "complemento" VARCHAR(100),
    "bairro" VARCHAR(100) NOT NULL,
    "cep" VARCHAR(8) NOT NULL,
    "municipioId" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,
    "telefone" VARCHAR(20),
    "celular" VARCHAR(20),
    "email" VARCHAR(100),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "codigoBarras" VARCHAR(50),
    "descricao" VARCHAR(500) NOT NULL,
    "descricaoComplementar" TEXT,
    "ncmId" TEXT NOT NULL,
    "cestId" TEXT,
    "unidade" VARCHAR(10) NOT NULL,
    "unidadeTributavel" VARCHAR(10),
    "valorUnitario" DECIMAL(15,4) NOT NULL,
    "valorCusto" DECIMAL(15,4),
    "margemLucro" DECIMAL(5,2),
    "estoqueAtual" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "estoqueMinimo" DECIMAL(15,4),
    "estoqueMaximo" DECIMAL(15,4),
    "peso" DECIMAL(10,4),
    "altura" DECIMAL(10,4),
    "largura" DECIMAL(10,4),
    "profundidade" DECIMAL(10,4),
    "origem" VARCHAR(1) NOT NULL,
    "fornecedorId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfes" (
    "id" TEXT NOT NULL,
    "chave" VARCHAR(44),
    "numero" INTEGER NOT NULL,
    "serie" INTEGER NOT NULL DEFAULT 1,
    "modelo" INTEGER NOT NULL DEFAULT 55,
    "naturezaOperacao" VARCHAR(200) NOT NULL,
    "tipoOperacao" INTEGER NOT NULL,
    "codigoNumerico" VARCHAR(8) NOT NULL,
    "tipoEmissao" INTEGER NOT NULL DEFAULT 1,
    "digitoVerificador" INTEGER,
    "ambiente" INTEGER NOT NULL DEFAULT 2,
    "finalidade" INTEGER NOT NULL DEFAULT 1,
    "consumidorFinal" INTEGER NOT NULL DEFAULT 0,
    "presencaComprador" INTEGER NOT NULL DEFAULT 1,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataSaida" TIMESTAMP(3),
    "emitenteId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "valorProdutos" DECIMAL(15,2) NOT NULL,
    "valorFrete" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorSeguro" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorOutros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorTotal" DECIMAL(15,2) NOT NULL,
    "baseCalculoICMS" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorICMS" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "baseCalculoICMSST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorICMSST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorIPI" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorPIS" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorCOFINS" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "modalidadeFrete" INTEGER NOT NULL DEFAULT 9,
    "status" TEXT NOT NULL DEFAULT 'DIGITACAO',
    "protocolo" VARCHAR(20),
    "dataAutorizacao" TIMESTAMP(3),
    "motivoStatus" TEXT,
    "xmlOriginal" TEXT,
    "xmlAssinado" TEXT,
    "xmlAutorizado" TEXT,
    "informacoesAdicionais" TEXT,
    "informacoesFisco" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_itens" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "numeroItem" INTEGER NOT NULL,
    "produtoId" TEXT,
    "codigo" VARCHAR(50) NOT NULL,
    "codigoBarras" VARCHAR(50),
    "descricao" VARCHAR(500) NOT NULL,
    "ncmId" TEXT NOT NULL,
    "cfopId" TEXT NOT NULL,
    "unidadeComercial" VARCHAR(10) NOT NULL,
    "quantidadeComercial" DECIMAL(15,4) NOT NULL,
    "valorUnitario" DECIMAL(15,4) NOT NULL,
    "valorTotal" DECIMAL(15,2) NOT NULL,
    "unidadeTributavel" VARCHAR(10) NOT NULL,
    "quantidadeTributavel" DECIMAL(15,4) NOT NULL,
    "valorUnitarioTrib" DECIMAL(15,4) NOT NULL,
    "valorFrete" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorSeguro" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorOutros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "origem" VARCHAR(1) NOT NULL,
    "incluiTotal" BOOLEAN NOT NULL DEFAULT true,
    "informacoesAdicionais" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_itens_icms" (
    "id" TEXT NOT NULL,
    "nfeItemId" TEXT NOT NULL,
    "origem" VARCHAR(1) NOT NULL,
    "cstId" TEXT,
    "csosnId" TEXT,
    "modalidadeBC" VARCHAR(1),
    "baseCalculo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aliquota" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "modalidadeBCST" VARCHAR(1),
    "percentualMVAST" DECIMAL(5,2),
    "percentualReducaoST" DECIMAL(5,2),
    "baseCalculoST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aliquotaST" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valorST" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "percentualReducao" DECIMAL(5,2),
    "percentualCredito" DECIMAL(5,2),
    "valorCredito" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_itens_icms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_itens_ipi" (
    "id" TEXT NOT NULL,
    "nfeItemId" TEXT NOT NULL,
    "cstId" TEXT NOT NULL,
    "baseCalculo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aliquota" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "classeEnquadramento" VARCHAR(5),
    "cnpjProdutor" VARCHAR(14),
    "codigoSeloControle" VARCHAR(60),
    "quantidadeSeloControle" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_itens_ipi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_itens_pis" (
    "id" TEXT NOT NULL,
    "nfeItemId" TEXT NOT NULL,
    "cstId" TEXT NOT NULL,
    "baseCalculo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aliquota" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "quantidadeVendida" DECIMAL(15,4),
    "aliquotaReais" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_itens_pis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_itens_cofins" (
    "id" TEXT NOT NULL,
    "nfeItemId" TEXT NOT NULL,
    "cstId" TEXT NOT NULL,
    "baseCalculo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "aliquota" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "valor" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "quantidadeVendida" DECIMAL(15,4),
    "aliquotaReais" DECIMAL(15,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_itens_cofins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_pagamentos" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "formaPagamento" VARCHAR(2) NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "tipoIntegracao" VARCHAR(1),
    "cnpjCredenciadora" VARCHAR(14),
    "bandeira" VARCHAR(2),
    "numeroAutorizacao" VARCHAR(20),
    "valorTroco" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_eventos" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "tipoEvento" VARCHAR(6) NOT NULL,
    "descricaoEvento" VARCHAR(100) NOT NULL,
    "sequenciaEvento" INTEGER NOT NULL DEFAULT 1,
    "justificativa" TEXT,
    "correcao" TEXT,
    "dataEvento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protocolo" VARCHAR(20),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "motivoStatus" TEXT,
    "xmlEvento" TEXT,
    "xmlRetorno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_acoes" (
    "id" TEXT NOT NULL,
    "usuario" VARCHAR(100),
    "ip" VARCHAR(45),
    "userAgent" TEXT,
    "acao" VARCHAR(100) NOT NULL,
    "tabela" VARCHAR(50) NOT NULL,
    "registroId" VARCHAR(50),
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "dataAcao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sucesso" BOOLEAN NOT NULL DEFAULT true,
    "erro" TEXT,

    CONSTRAINT "log_acoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_codigo_key" ON "estados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "estados_uf_key" ON "estados"("uf");

-- CreateIndex
CREATE UNIQUE INDEX "municipios_codigo_key" ON "municipios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ncm_codigo_key" ON "ncm"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cfop_codigo_key" ON "cfop"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cest_codigo_key" ON "cest"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "csosn_codigo_key" ON "csosn"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cst_codigo_key" ON "cst"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "emitentes_cnpj_key" ON "emitentes"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_documento_key" ON "fornecedores"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_codigo_key" ON "produtos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "nfes_chave_key" ON "nfes"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "nfes_emitenteId_serie_numero_key" ON "nfes"("emitenteId", "serie", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_itens_nfeId_numeroItem_key" ON "nfe_itens"("nfeId", "numeroItem");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_itens_icms_nfeItemId_key" ON "nfe_itens_icms"("nfeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_itens_ipi_nfeItemId_key" ON "nfe_itens_ipi"("nfeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_itens_pis_nfeItemId_key" ON "nfe_itens_pis"("nfeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "nfe_itens_cofins_nfeItemId_key" ON "nfe_itens_cofins"("nfeItemId");

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cest" ADD CONSTRAINT "cest_ncmId_fkey" FOREIGN KEY ("ncmId") REFERENCES "ncm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emitentes" ADD CONSTRAINT "emitentes_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emitentes" ADD CONSTRAINT "emitentes_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_ncmId_fkey" FOREIGN KEY ("ncmId") REFERENCES "ncm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_cestId_fkey" FOREIGN KEY ("cestId") REFERENCES "cest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_emitenteId_fkey" FOREIGN KEY ("emitenteId") REFERENCES "emitentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens" ADD CONSTRAINT "nfe_itens_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens" ADD CONSTRAINT "nfe_itens_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens" ADD CONSTRAINT "nfe_itens_ncmId_fkey" FOREIGN KEY ("ncmId") REFERENCES "ncm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens" ADD CONSTRAINT "nfe_itens_cfopId_fkey" FOREIGN KEY ("cfopId") REFERENCES "cfop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_icms" ADD CONSTRAINT "nfe_itens_icms_nfeItemId_fkey" FOREIGN KEY ("nfeItemId") REFERENCES "nfe_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_icms" ADD CONSTRAINT "nfe_itens_icms_cstId_fkey" FOREIGN KEY ("cstId") REFERENCES "cst"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_icms" ADD CONSTRAINT "nfe_itens_icms_csosnId_fkey" FOREIGN KEY ("csosnId") REFERENCES "csosn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_ipi" ADD CONSTRAINT "nfe_itens_ipi_nfeItemId_fkey" FOREIGN KEY ("nfeItemId") REFERENCES "nfe_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_ipi" ADD CONSTRAINT "nfe_itens_ipi_cstId_fkey" FOREIGN KEY ("cstId") REFERENCES "cst"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_pis" ADD CONSTRAINT "nfe_itens_pis_nfeItemId_fkey" FOREIGN KEY ("nfeItemId") REFERENCES "nfe_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_pis" ADD CONSTRAINT "nfe_itens_pis_cstId_fkey" FOREIGN KEY ("cstId") REFERENCES "cst"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_cofins" ADD CONSTRAINT "nfe_itens_cofins_nfeItemId_fkey" FOREIGN KEY ("nfeItemId") REFERENCES "nfe_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_itens_cofins" ADD CONSTRAINT "nfe_itens_cofins_cstId_fkey" FOREIGN KEY ("cstId") REFERENCES "cst"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_pagamentos" ADD CONSTRAINT "nfe_pagamentos_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_eventos" ADD CONSTRAINT "nfe_eventos_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
