import { httpClient } from "@/lib/http-client"

export interface EmitirNFCeRequest {
  vendaId: number
  numeroVenda: string
  empresa: EmpresaData
  cliente?: ClienteData
  itens: ItemNFCe[]
  totalProdutos: number
  totalDesconto: number
  totalVenda: number
  naturezaOperacao: NaturezaOperacao
  formaPagamento: FormaPagamentoNFCe
  informacoesAdicionais?: string
}

export interface EmpresaData {
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cep: string
  uf: string
  cidadeId: number
  telefone?: string
  email?: string
  regimeTributario: number
  ambienteNFe: number
  serieNFe: number
  serieNFCe: number
  certificadoA1: string
  senhaCertificado: string
}

export interface ClienteData {
  nome: string
  email?: string
  cpf?: string
  cnpj?: string
  inscricaoEstadual?: string
  telefone?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  uf?: string
  cidadeId?: number
  indIEDest?: number
}

export interface ItemNFCe {
  produtoId: number
  nome: string
  codigo: string
  quantidade: number
  unidade: string
  valorUnitario: number
  valorDesconto: number
  valorTotal: number
  ncm?: string
  cest?: string
  origemProduto: number
  csticms?: string
  csosn?: string
  aliquotaICMS: number
  aliquotaIPI: number
  aliquotaPIS: number
  aliquotaCOFINS: number
  calculaICMS: boolean
  calculaIPI: boolean
  calculaPIS: boolean
  calculaCOFINS: boolean
}

export interface NaturezaOperacao {
  codigo: string
  descricao: string
  cfopDentroEstado: string
  cfopForaEstado: string
  cfopExterior?: string
  finalidadeNFe: number
}

export interface FormaPagamentoNFCe {
  formaPagamento: number
  valor: number
  descricao: string
}

export interface DocumentoFiscalResponse {
  sucesso: boolean
  mensagem: string
  chaveAcesso?: string
  numero?: string
  serie?: string
  xml?: string
  xmlRetorno?: string
  protocoloAutorizacao?: string
  dataAutorizacao?: Date
  status?: string
  erros: string[]
  avisos: string[]
}

export interface StatusDocumentoResponse {
  sucesso: boolean
  mensagem: string
  chaveAcesso?: string
  status?: string
  situacao?: string
  dataConsulta?: Date
  erros: string[]
}

export interface ValidarCertificadoRequest {
  certificadoBase64: string
  senha: string
}

export interface ValidarCertificadoResponse {
  valido: boolean
  subject?: string
  issuer?: string
  validoAte?: Date
  temChavePrivada?: boolean
  erros: string[]
}

export interface ConectividadeResponse {
  sucesso: boolean
  servicos: {
    [key: string]: string
  }
  urls: {
    [key: string]: string
  }
  tempo: number
}

class FiscalService {
  private baseURL = "/api/fiscal"

  // Emitir NFCe
  async emitirNFCe(request: EmitirNFCeRequest): Promise<DocumentoFiscalResponse> {
    const response = await httpClient.post(`${this.baseURL}/nfce/emitir`, request)
    return response.data
  }

  // Cancelar NFCe
  async cancelarNFCe(chaveAcesso: string, justificativa: string): Promise<DocumentoFiscalResponse> {
    const response = await httpClient.post(`${this.baseURL}/nfce/cancelar`, {
      chaveAcesso,
      justificativa,
    })
    return response.data
  }

  // Consultar status NFCe
  async consultarStatusNFCe(chaveAcesso: string): Promise<StatusDocumentoResponse> {
    const response = await httpClient.get(`${this.baseURL}/nfce/status/${chaveAcesso}`)
    return response.data
  }

  // Validar certificado digital
  async validarCertificado(request: ValidarCertificadoRequest): Promise<ValidarCertificadoResponse> {
    const response = await httpClient.post(`${this.baseURL}/validar-certificado`, request)
    return response.data
  }

  // Testar conectividade SEFAZ
  async testarConectividade(): Promise<ConectividadeResponse> {
    const response = await httpClient.get(`${this.baseURL}/conectividade`)
    return response.data
  }

  // Buscar vendas pendentes de NFCe
  async getVendasPendentesNFCe(): Promise<any[]> {
    const response = await httpClient.get(`${this.baseURL}/nfce/vendas-pendentes`)
    return response.data
  }

  // Processar lote de NFCe
  async processarLoteNFCe(vendaIds: number[]): Promise<any> {
    const response = await httpClient.post(`${this.baseURL}/nfce/processar-lote`, {
      vendaIds,
    })
    return response.data
  }

  // Obter informações do serviço fiscal
  async getInfoServico(): Promise<any> {
    const response = await httpClient.get("/api/public/fiscal/info")
    return response.data
  }

  // Obter health check do serviço fiscal
  async getHealthCheck(): Promise<any> {
    const response = await httpClient.get("/api/public/fiscal/health")
    return response.data
  }
}

export const fiscalService = new FiscalService()

// Utilitários para conversão de dados
export class FiscalUtils {
  // Converter dados da venda para request NFCe
  static vendaToNFCeRequest(
    venda: any,
    empresa: EmpresaData,
    naturezaOperacao: NaturezaOperacao
  ): EmitirNFCeRequest {
    return {
      vendaId: venda.id,
      numeroVenda: venda.numeroVenda,
      empresa,
      cliente: venda.cliente ? this.clienteToNFCeData(venda.cliente) : undefined,
      itens: venda.itens.map((item: any) => this.itemToNFCeData(item)),
      totalProdutos: venda.totalProdutos,
      totalDesconto: venda.totalDesconto || 0,
      totalVenda: venda.totalVenda,
      naturezaOperacao,
      formaPagamento: {
        formaPagamento: venda.formaPagamento,
        valor: venda.valorPago,
        descricao: this.getDescricaoFormaPagamento(venda.formaPagamento),
      },
      informacoesAdicionais: venda.observacoes,
    }
  }

  // Converter cliente para dados NFCe
  static clienteToNFCeData(cliente: any): ClienteData {
    return {
      nome: cliente.razaoSocial || cliente.nome,
      email: cliente.email,
      cpf: cliente.tipoPessoa === "PF" ? cliente.cnpjCpf : undefined,
      cnpj: cliente.tipoPessoa === "PJ" ? cliente.cnpjCpf : undefined,
      inscricaoEstadual: cliente.ie,
      telefone: cliente.fone,
      logradouro: cliente.logradouro,
      numero: cliente.numero,
      complemento: cliente.complemento,
      bairro: cliente.bairro,
      cep: cliente.cep,
      uf: cliente.uf,
      cidadeId: cliente.codigoIBGE,
      indIEDest: cliente.indIEDest || 9,
    }
  }

  // Converter item para dados NFCe
  static itemToNFCeData(item: any): ItemNFCe {
    return {
      produtoId: item.produtoId,
      nome: item.produto?.nome || item.nome,
      codigo: item.produto?.codigo || item.codigo,
      quantidade: item.quantidade,
      unidade: item.produto?.unidade || "UN",
      valorUnitario: item.valorUnit,
      valorDesconto: item.valorDesc || 0,
      valorTotal: item.valorTotal,
      ncm: item.produto?.ncm || "00000000",
      cest: item.produto?.cest,
      origemProduto: item.produto?.origemProduto || 0,
      csticms: item.produto?.cstIcms,
      csosn: item.produto?.csosn,
      aliquotaICMS: item.produto?.aliquotaIcms || 0,
      aliquotaIPI: item.produto?.aliquotaIpi || 0,
      aliquotaPIS: item.produto?.aliquotaPis || 0,
      aliquotaCOFINS: item.produto?.aliquotaCofins || 0,
      calculaICMS: item.produto?.calculaIcms ?? true,
      calculaIPI: item.produto?.calculaIpi ?? false,
      calculaPIS: item.produto?.calculaPis ?? true,
      calculaCOFINS: item.produto?.calculaCofins ?? true,
    }
  }

  // Obter descrição da forma de pagamento
  static getDescricaoFormaPagamento(codigo: number): string {
    const formas: { [key: number]: string } = {
      1: "Dinheiro",
      2: "Cheque",
      3: "Cartão de Crédito",
      4: "Cartão de Débito",
      17: "PIX",
      99: "Outros",
    }
    return formas[codigo] || "Outros"
  }
}
