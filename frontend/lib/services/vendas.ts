import { httpClient } from "@/lib/http-client"

export interface CreateVendaRequest {
  clienteId?: number
  naturezaOpId: number
  itens: ItemVendaRequest[]
  totalProdutos: number
  totalDesconto: number
  totalVenda: number
  formaPagamento: number
  valorPago: number
  valorTroco: number
  observacoes?: string
}

export interface ItemVendaRequest {
  produtoId: number
  quantidade: number
  valorUnit: number
  valorDesc: number
  valorTotal: number
}

export interface VendaResponse {
  id: number
  numeroVenda: string
  clienteId?: number
  usuarioId: number
  naturezaOpId: number
  totalProdutos: number
  totalDesconto: number
  totalVenda: number
  status: string
  nfceNumero?: string
  nfceChave?: string
  nfceXml?: string
  nfceStatus: string
  nfceProtocolo?: string
  nfceDataAut?: Date
  formaPagamento: number
  valorPago: number
  valorTroco: number
  observacoes?: string
  createdAt: Date
  updatedAt: Date
  cliente?: ClienteResumo
  usuario?: UsuarioResumo
  naturezaOperacao?: NaturezaOperacaoResumo
  itens: ItemVendaResponse[]
}

export interface ItemVendaResponse {
  id: number
  vendaId: number
  produtoId: number
  quantidade: number
  valorUnit: number
  valorDesc: number
  valorTotal: number
  produto?: ProdutoResumo
}

export interface ClienteResumo {
  id: number
  nome: string
  email?: string
  cpf?: string
  cnpj?: string
}

export interface UsuarioResumo {
  id: number
  nome: string
  email: string
}

export interface NaturezaOperacaoResumo {
  id: number
  codigo: string
  descricao: string
  cfopDentroEstado: string
  cfopForaEstado: string
}

export interface ProdutoResumo {
  id: number
  nome: string
  codigo: string
  preco: number
  unidade: string
}

export interface VendaFilter {
  status?: string
  nfceStatus?: string
  clienteId?: number
  usuarioId?: number
  dataInicio?: Date
  dataFim?: Date
  numeroVenda?: string
  nfceChave?: string
  limit?: number
  offset?: number
}

export interface FinalizarVendaRequest {
  formaPagamento: number
  valorPago: number
  valorTroco?: number
  observacoes?: string
}

export interface VendasListResponse {
  data: VendaResponse[]
  total: number
  limit: number
  offset: number
}

class VendasService {
  private baseURL = "/api/vendas"

  // Criar nova venda
  async createVenda(request: CreateVendaRequest): Promise<VendaResponse> {
    const response = await httpClient.post(this.baseURL, request)
    return response.data
  }

  // Listar vendas com filtros
  async getVendas(filter: VendaFilter = {}): Promise<VendasListResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString().split('T')[0])
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const response = await httpClient.get(`${this.baseURL}?${params.toString()}`)
    return response.data
  }

  // Buscar venda por ID
  async getVendaById(id: number): Promise<VendaResponse> {
    const response = await httpClient.get(`${this.baseURL}/${id}`)
    return response.data
  }

  // Finalizar venda
  async finalizarVenda(id: number, request: FinalizarVendaRequest): Promise<VendaResponse> {
    const response = await httpClient.post(`${this.baseURL}/${id}/finalizar`, request)
    return response.data
  }

  // Cancelar venda
  async cancelarVenda(id: number): Promise<VendaResponse> {
    const response = await httpClient.post(`${this.baseURL}/${id}/cancelar`)
    return response.data
  }

  // Obter vendas pendentes de NFCe
  async getVendasPendentesNFCe(): Promise<VendaResponse[]> {
    const response = await httpClient.get(`${this.baseURL}/fiscal/pendentes-nfce`)
    return response.data
  }

  // Emitir NFCe para uma venda
  async emitirNFCeVenda(id: number): Promise<any> {
    const response = await httpClient.post(`${this.baseURL}/fiscal/${id}/emitir-nfce`)
    return response.data
  }

  // Cancelar NFCe de uma venda
  async cancelarNFCeVenda(id: number, justificativa: string): Promise<any> {
    const response = await httpClient.post(`${this.baseURL}/fiscal/${id}/cancelar-nfce`, {
      justificativa,
    })
    return response.data
  }

  // Obter status fiscal de uma venda
  async getStatusFiscalVenda(id: number): Promise<any> {
    const response = await httpClient.get(`${this.baseURL}/fiscal/${id}/status-fiscal`)
    return response.data
  }

  // Relatórios
  async getRelatorioVendasPorPeriodo(dataInicio: Date, dataFim: Date): Promise<any> {
    const params = new URLSearchParams({
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: dataFim.toISOString().split('T')[0],
    })
    const response = await httpClient.get(`${this.baseURL}/relatorios/periodo?${params.toString()}`)
    return response.data
  }

  async getRelatorioVendasPorProduto(dataInicio?: Date, dataFim?: Date): Promise<any> {
    const params = new URLSearchParams()
    if (dataInicio) params.append('data_inicio', dataInicio.toISOString().split('T')[0])
    if (dataFim) params.append('data_fim', dataFim.toISOString().split('T')[0])
    
    const response = await httpClient.get(`${this.baseURL}/relatorios/produtos?${params.toString()}`)
    return response.data
  }

  async getRelatorioVendasPorCliente(dataInicio?: Date, dataFim?: Date): Promise<any> {
    const params = new URLSearchParams()
    if (dataInicio) params.append('data_inicio', dataInicio.toISOString().split('T')[0])
    if (dataFim) params.append('data_fim', dataFim.toISOString().split('T')[0])
    
    const response = await httpClient.get(`${this.baseURL}/relatorios/clientes?${params.toString()}`)
    return response.data
  }

  // Estatísticas
  async getEstatisticasHoje(): Promise<any> {
    const response = await httpClient.get(`${this.baseURL}/stats/hoje`)
    return response.data
  }

  async getEstatisticasMes(): Promise<any> {
    const response = await httpClient.get(`${this.baseURL}/stats/mes`)
    return response.data
  }

  async getEstatisticasAno(): Promise<any> {
    const response = await httpClient.get(`${this.baseURL}/stats/ano`)
    return response.data
  }

  async getDashboardVendas(): Promise<any> {
    const response = await httpClient.get(`${this.baseURL}/stats/dashboard`)
    return response.data
  }
}

export const vendasService = new VendasService()

// Utilitários para conversão de dados
export class VendasUtils {
  // Converter dados do PDV para request de criação de venda
  static pdvToCreateVendaRequest(
    itens: any[],
    cliente: any | null,
    dadosVenda: any,
    naturezaOpId: number = 1
  ): CreateVendaRequest {
    const totalProdutos = itens.reduce((sum, item) => sum + item.total, 0)
    const totalDesconto = 0 // TODO: Implementar desconto
    const totalVenda = totalProdutos - totalDesconto

    return {
      clienteId: cliente?.id,
      naturezaOpId,
      itens: itens.map(item => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        valorUnit: item.preco,
        valorDesc: 0,
        valorTotal: item.total,
      })),
      totalProdutos,
      totalDesconto,
      totalVenda,
      formaPagamento: dadosVenda.formaPagamento.codigo,
      valorPago: dadosVenda.valorPago,
      valorTroco: dadosVenda.valorTroco,
      observacoes: dadosVenda.observacoes,
    }
  }

  // Formatar status da venda
  static formatarStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pendente: "Pendente",
      finalizada: "Finalizada",
      cancelada: "Cancelada",
    }
    return statusMap[status] || status
  }

  // Formatar status NFCe
  static formatarStatusNFCe(status: string): string {
    const statusMap: { [key: string]: string } = {
      nao_emitida: "Não Emitida",
      processando: "Processando",
      autorizada: "Autorizada",
      cancelada: "Cancelada",
      rejeitada: "Rejeitada",
      erro: "Erro",
    }
    return statusMap[status] || status
  }

  // Obter cor do status
  static getCorStatus(status: string): string {
    const coresMap: { [key: string]: string } = {
      pendente: "yellow",
      finalizada: "green",
      cancelada: "red",
    }
    return coresMap[status] || "gray"
  }

  // Obter cor do status NFCe
  static getCorStatusNFCe(status: string): string {
    const coresMap: { [key: string]: string } = {
      nao_emitida: "gray",
      processando: "blue",
      autorizada: "green",
      cancelada: "red",
      rejeitada: "red",
      erro: "red",
    }
    return coresMap[status] || "gray"
  }
}
