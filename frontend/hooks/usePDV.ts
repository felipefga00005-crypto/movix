"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

export interface ItemVenda {
  id: number
  produtoId: number
  nome: string
  codigo: string
  preco: number
  quantidade: number
  total: number
  unidade?: string
}

// Importar tipo Cliente do sistema
import type { Cliente } from "@/types/cliente"

export interface Produto {
  id: number
  nome: string
  codigo: string
  preco: number
  estoque: number
  categoria?: string
  unidade?: string
}

export interface FormaPagamento {
  codigo: number
  descricao: string
}

export interface DadosVenda {
  formaPagamento: FormaPagamento
  valorPago: number
  valorTroco: number
  observacoes?: string
  emitirNFCe: boolean
}

export interface VendaFinalizada {
  id: number
  numeroVenda: string
  total: number
  cliente?: Cliente
  itens: ItemVenda[]
  formaPagamento: FormaPagamento
  nfceChave?: string
  nfceNumero?: string
  dataVenda: Date
}

export function usePDV() {
  const [itensVenda, setItensVenda] = useState<ItemVenda[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [vendaAtual, setVendaAtual] = useState<VendaFinalizada | null>(null)
  const [carregando, setCarregando] = useState(false)

  // Adicionar produto ao carrinho
  const adicionarProduto = useCallback((produto: Produto) => {
    setItensVenda(itens => {
      const itemExistente = itens.find(item => item.produtoId === produto.id)
      
      if (itemExistente) {
        return itens.map(item =>
          item.produtoId === produto.id
            ? { 
                ...item, 
                quantidade: item.quantidade + 1, 
                total: (item.quantidade + 1) * item.preco 
              }
            : item
        )
      } else {
        const novoItem: ItemVenda = {
          id: Date.now(),
          produtoId: produto.id,
          nome: produto.nome,
          codigo: produto.codigo,
          preco: produto.preco,
          quantidade: 1,
          total: produto.preco,
          unidade: produto.unidade,
        }
        return [...itens, novoItem]
      }
    })
    
    toast.success(`${produto.nome} adicionado ao carrinho`)
  }, [])

  // Alterar quantidade de um item
  const alterarQuantidade = useCallback((itemId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(itemId)
      return
    }

    setItensVenda(itens =>
      itens.map(item =>
        item.id === itemId
          ? { ...item, quantidade: novaQuantidade, total: novaQuantidade * item.preco }
          : item
      )
    )
  }, [])

  // Remover item do carrinho
  const removerItem = useCallback((itemId: number) => {
    setItensVenda(itens => {
      const item = itens.find(i => i.id === itemId)
      if (item) {
        toast.info(`${item.nome} removido do carrinho`)
      }
      return itens.filter(item => item.id !== itemId)
    })
  }, [])

  // Limpar carrinho
  const limparCarrinho = useCallback(() => {
    setItensVenda([])
    toast.info("Carrinho limpo")
  }, [])

  // Selecionar cliente
  const selecionarCliente = useCallback((clienteSelecionado: Cliente) => {
    setCliente(clienteSelecionado)
    toast.success(`Cliente ${clienteSelecionado.razao_social} selecionado`)
  }, [])

  // Remover cliente
  const removerCliente = useCallback(() => {
    if (cliente) {
      toast.info(`Cliente ${cliente.razao_social} removido`)
    }
    setCliente(null)
  }, [cliente])

  // Calcular total da venda
  const calcularTotal = useCallback(() => {
    return itensVenda.reduce((total, item) => total + item.total, 0)
  }, [itensVenda])

  // Calcular total de itens
  const calcularTotalItens = useCallback(() => {
    return itensVenda.reduce((total, item) => total + item.quantidade, 0)
  }, [itensVenda])

  // Finalizar venda
  const finalizarVenda = useCallback(async (dadosVenda: DadosVenda): Promise<VendaFinalizada> => {
    if (itensVenda.length === 0) {
      throw new Error("Carrinho vazio")
    }

    setCarregando(true)

    try {
      // Importar services dinamicamente para evitar problemas de SSR
      const { vendasService, VendasUtils } = await import("@/lib/services/vendas")
      const { fiscalService, FiscalUtils } = await import("@/lib/services/fiscal")

      // 1. Criar venda no backend
      const createVendaRequest = VendasUtils.pdvToCreateVendaRequest(
        itensVenda,
        cliente,
        dadosVenda,
        1 // TODO: Permitir seleção de natureza de operação
      )

      const vendaCriada = await vendasService.createVenda(createVendaRequest)

      // 2. Se deve emitir NFCe, processar emissão
      let nfceResult = null
      if (dadosVenda.emitirNFCe) {
        try {
          // TODO: Obter dados da empresa das configurações
          const empresaData = {
            razaoSocial: "EMPRESA TESTE LTDA",
            nomeFantasia: "Empresa Teste",
            cnpj: "11.222.333/0001-81",
            inscricaoEstadual: "123456789",
            logradouro: "Rua Teste",
            numero: "123",
            bairro: "Centro",
            cep: "01234-567",
            uf: "SP",
            cidadeId: 3550308,
            telefone: "(11) 1234-5678",
            email: "teste@empresa.com",
            regimeTributario: 1,
            ambienteNFe: 2, // Homologação
            serieNFe: 1,
            serieNFCe: 1,
            certificadoA1: "certificado_base64_aqui",
            senhaCertificado: "senha_certificado",
          }

          const naturezaOperacao = {
            codigo: "001",
            descricao: "Venda",
            cfopDentroEstado: "5102",
            cfopForaEstado: "6102",
            finalidadeNFe: 1,
          }

          const nfceRequest = FiscalUtils.vendaToNFCeRequest(
            vendaCriada,
            empresaData,
            naturezaOperacao
          )

          nfceResult = await fiscalService.emitirNFCe(nfceRequest)

          if (nfceResult.sucesso) {
            toast.success("NFCe emitida com sucesso!")
          } else {
            toast.warning("Venda criada, mas houve erro na emissão da NFCe")
          }
        } catch (nfceError) {
          console.error("Erro ao emitir NFCe:", nfceError)
          toast.warning("Venda criada, mas houve erro na emissão da NFCe")
        }
      }

      // 3. Criar objeto de resposta
      const vendaFinalizada: VendaFinalizada = {
        id: vendaCriada.id,
        numeroVenda: vendaCriada.numeroVenda,
        total: vendaCriada.totalVenda,
        cliente: cliente || undefined,
        itens: itensVenda,
        formaPagamento: dadosVenda.formaPagamento,
        nfceChave: nfceResult?.chaveAcesso,
        nfceNumero: nfceResult?.numero,
        dataVenda: new Date(vendaCriada.createdAt),
      }

      // Limpar dados após finalização
      setItensVenda([])
      setCliente(null)
      setVendaAtual(vendaFinalizada)

      toast.success("Venda finalizada com sucesso!")

      return vendaFinalizada
    } catch (error) {
      console.error("Erro ao finalizar venda:", error)
      toast.error("Erro ao finalizar venda")
      throw error
    } finally {
      setCarregando(false)
    }
  }, [itensVenda, cliente, calcularTotal])

  // Iniciar nova venda
  const iniciarNovaVenda = useCallback(() => {
    setItensVenda([])
    setCliente(null)
    setVendaAtual(null)
    toast.info("Nova venda iniciada")
  }, [])

  // Buscar produtos
  const buscarProdutos = useCallback(async (termo: string): Promise<Produto[]> => {
    if (termo.length < 2) return []

    try {
      // Usar API do PDV para busca otimizada
      const response = await fetch(`/api/pdv/produtos/buscar?q=${encodeURIComponent(termo)}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar produtos")
      }
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      // Fallback para produtos simulados em caso de erro
      return []
    }
  }, [])

  // Buscar produto por código
  const buscarProdutoPorCodigo = useCallback(async (codigo: string): Promise<Produto | null> => {
    if (!codigo) return null

    try {
      const response = await fetch(`/api/pdv/produtos/codigo/${encodeURIComponent(codigo)}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error("Erro ao buscar produto")
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar produto por código:", error)
      return null
    }
  }, [])

  // Buscar clientes
  const buscarClientes = useCallback(async (termo: string): Promise<Cliente[]> => {
    if (termo.length < 2) return []

    try {
      const response = await fetch(`/api/pdv/clientes/buscar?q=${encodeURIComponent(termo)}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar clientes")
      }
      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      return []
    }
  }, [])

  // Buscar cliente por CPF
  const buscarClientePorCPF = useCallback(async (cpf: string): Promise<Cliente | null> => {
    if (!cpf) return null

    try {
      const response = await fetch(`/api/pdv/clientes/cpf/${encodeURIComponent(cpf)}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error("Erro ao buscar cliente")
      }
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar cliente por CPF:", error)
      return null
    }
  }, [])

  return {
    // Estado
    itensVenda,
    cliente,
    vendaAtual,
    carregando,

    // Ações do carrinho
    adicionarProduto,
    alterarQuantidade,
    removerItem,
    limparCarrinho,

    // Ações do cliente
    selecionarCliente,
    removerCliente,

    // Cálculos
    calcularTotal,
    calcularTotalItens,

    // Venda
    finalizarVenda,
    iniciarNovaVenda,

    // Busca
    buscarProdutos,
    buscarProdutoPorCodigo,
    buscarClientes,
    buscarClientePorCPF,
  }
}
