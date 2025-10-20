export class CreateNfeDto {
  // Dados do Emitente
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigoMunicipio: string;
      nomeMunicipio: string;
      uf: string;
      cep: string;
      codigoPais: string;
      nomePais: string;
      telefone?: string;
    };
  };

  // Dados do Destinatário
  destinatario: {
    cnpjCpf: string;
    razaoSocial: string;
    inscricaoEstadual?: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigoMunicipio: string;
      nomeMunicipio: string;
      uf: string;
      cep: string;
      codigoPais: string;
      nomePais: string;
      telefone?: string;
    };
    email?: string;
  };

  // Produtos/Serviços
  itens: Array<{
    numero: number;
    codigoProduto: string;
    ean?: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidadeComercial: string;
    quantidadeComercial: number;
    valorUnitario: number;
    valorTotal: number;
    eanTributavel?: string;
    unidadeTributavel: string;
    quantidadeTributavel: number;
    valorUnitarioTributavel: number;
    indicadorTotal: number;
    
    // Impostos
    impostos: {
      icms: {
        origem: string;
        cst: string;
        modalidadeBC?: string;
        valorBC?: number;
        aliquota?: number;
        valor?: number;
      };
      ipi?: {
        cst: string;
        valorBC?: number;
        aliquota?: number;
        valor?: number;
      };
      pis: {
        cst: string;
        valorBC?: number;
        aliquota?: number;
        valor?: number;
      };
      cofins: {
        cst: string;
        valorBC?: number;
        aliquota?: number;
        valor?: number;
      };
    };
  }>;

  // Totais
  totais: {
    valorProdutos: number;
    valorFrete?: number;
    valorSeguro?: number;
    valorDesconto?: number;
    valorII?: number;
    valorIPI?: number;
    valorPIS?: number;
    valorCOFINS?: number;
    valorOutros?: number;
    valorNota: number;
    
    icms: {
      baseCalculo: number;
      valor: number;
      baseCalculoST?: number;
      valorST?: number;
    };
  };

  // Transporte
  transporte?: {
    modalidadeFrete: number;
    transportadora?: {
      cnpjCpf?: string;
      razaoSocial?: string;
      inscricaoEstadual?: string;
      endereco?: string;
      municipio?: string;
      uf?: string;
    };
    veiculo?: {
      placa?: string;
      uf?: string;
    };
    volumes?: Array<{
      quantidade?: number;
      especie?: string;
      marca?: string;
      numeracao?: string;
      pesoLiquido?: number;
      pesoBruto?: number;
    }>;
  };

  // Cobrança
  cobranca?: {
    fatura?: {
      numero: string;
      valorOriginal: number;
      valorDesconto?: number;
      valorLiquido: number;
    };
    duplicatas?: Array<{
      numero: string;
      dataVencimento: string;
      valor: number;
    }>;
  };

  // Informações Adicionais
  informacoesAdicionais?: {
    informacoesComplementares?: string;
    informacoesFisco?: string;
  };

  // Dados da NFe
  naturezaOperacao: string;
  tipoOperacao: number; // 0=Entrada, 1=Saída
  finalidadeEmissao: number; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  consumidorFinal: number; // 0=Normal, 1=Consumidor Final
  presencaComprador: number; // 0=Não se aplica, 1=Presencial, 2=Internet, etc
  ambiente: number; // 1=Produção, 2=Homologação
}

