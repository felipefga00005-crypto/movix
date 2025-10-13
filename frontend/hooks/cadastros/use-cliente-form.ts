"use client"

// ============================================
// HOOK INTEGRADO - useClienteForm
// Combina cadastro de clientes com APIs externas
// ============================================

import { useState, useCallback, useEffect } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useClientes } from "./use-clientes"
import { externalApisService, type Endereco, type Estado, type Cidade } from "@/lib/api/external-apis"
import type { Cliente, Status } from "@/types"

// ============================================
// SCHEMA DO FORMULÁRIO
// ============================================

export const clienteFormSchema = z.object({
  // Dados Básicos - Informações Gerais do Cliente
  cpfCnpj: z.string().min(11, "CPF/CNPJ é obrigatório"),
  inscricaoEstadual: z.string().optional(), // RG para PF ou IE para PJ (campo unificado)
  inscricaoMunicipal: z.string().optional(),
  nome: z.string().min(3, "Nome/Razão Social é obrigatório"),
  nomeFantasia: z.string().optional(),
  tipoCliente: z.enum(["Cliente", "Fornecedor", "Cliente/Fornecedor"]).default("Cliente"),
  consumidorFinal: z.boolean().default(false),
  dataAbertura: z.string().optional(), // Data de abertura (para PJ) ou nascimento (para PF)

  // Contatos
  email: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true // Se vazio, é válido
    return z.string().email().safeParse(val).success // Se preenchido, valida email
  }, {
    message: "Email inválido"
  }),
  telefoneFixo: z.string().optional(),
  celular: z.string().optional(),
  pontoReferencia: z.string().optional(),

  // Endereço Principal
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),

  // Endereço de Entrega (Opcional)
  enderecoEntregaDiferente: z.boolean().default(false),
  cepEntrega: z.string().optional(),
  enderecoEntrega: z.string().optional(),
  numeroEntrega: z.string().optional(),
  complementoEntrega: z.string().optional(),
  bairroEntrega: z.string().optional(),
  cidadeEntrega: z.string().optional(),
  estadoEntrega: z.string().optional(),

  // Dados Financeiros
  limiteCredito: z.string().optional(),
  saldoInicial: z.string().default("0"),
  prazoPagamento: z.string().optional(),

  // Dados Fiscais e Comerciais
  numeroImposto: z.string().optional(),
  codigoCliente: z.string().optional(),
  suframa: z.string().optional(), // Para empresas da Zona Franca

  // Campos Personalizados Dinâmicos
  camposPersonalizados: z.array(z.object({
    id: z.string(),
    nome: z.string().min(1, "Nome do campo é obrigatório"),
    valor: z.string()
  })).default([]),

  // Configurações do Sistema
  status: z.enum(["Ativo", "Inativo", "Pendente"]).default("Ativo"),
  observacoes: z.string().optional(),
})

export type ClienteFormValues = z.infer<typeof clienteFormSchema>

// ============================================
// INTERFACE DO HOOK
// ============================================

interface UseClienteFormOptions {
  cliente?: Cliente | null
  onSuccess?: () => void
}

interface UseClienteFormReturn {
  // Form
  form: UseFormReturn<ClienteFormValues>
  
  // Estados
  estados: Estado[]
  cidades: Cidade[]
  endereco: Endereco | null
  
  // Loading states
  loading: boolean
  loadingCEP: boolean
  loadingCNPJ: boolean
  loadingEstados: boolean
  loadingCidades: boolean
  
  // Errors
  error: string | null
  errorCEP: string | null
  errorCNPJ: string | null
  
  // Actions
  buscarCEP: (cep: string) => Promise<void>
  buscarCNPJ: (cnpj: string) => Promise<void>
  selecionarEstado: (uf: string) => Promise<void>
  onSubmit: (data: ClienteFormValues) => Promise<void>
  limparEndereco: () => void
  
  // Flags
  isEditing: boolean
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useClienteForm({ cliente, onSuccess }: UseClienteFormOptions = {}) {
  const { createCliente, updateCliente, loading } = useClientes({ autoFetch: false })
  const isEditing = !!cliente

  // Estados das APIs externas
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  
  // Loading states
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [loadingCNPJ, setLoadingCNPJ] = useState(false)
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingCidades, setLoadingCidades] = useState(false)
  
  // Error states
  const [error, setError] = useState<string | null>(null)
  const [errorCEP, setErrorCEP] = useState<string | null>(null)
  const [errorCNPJ, setErrorCNPJ] = useState<string | null>(null)

  // Configuração do formulário
  const form = useForm({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      cpfCnpj: cliente?.cpf || "",
      inscricaoEstadual: cliente?.rgIe || "",
      inscricaoMunicipal: cliente?.inscricaoMunicipal || "",
      nome: cliente?.nome || "",
      nomeFantasia: cliente?.nomeFantasia || "",
      tipoCliente: (cliente?.tipoContato as any) || "Cliente",
      consumidorFinal: cliente?.consumidorFinal || false,
      dataAbertura: cliente?.dataAbertura || cliente?.dataNascimento || "",
      email: cliente?.email || "",
      telefoneFixo: cliente?.telefone || cliente?.telefoneFixo || "",
      celular: cliente?.celular || "",
      pontoReferencia: cliente?.pontoReferencia || "",
      cep: cliente?.cep || "",
      endereco: cliente?.endereco || "",
      numero: cliente?.numero || "",
      complemento: cliente?.complemento || "",
      bairro: cliente?.bairro || "",
      cidade: cliente?.cidade || "",
      estado: cliente?.estado || "",
      enderecoEntregaDiferente: false,
      cepEntrega: cliente?.cepEntrega || "",
      enderecoEntrega: cliente?.enderecoEntrega || "",
      numeroEntrega: cliente?.numeroEntrega || "",
      complementoEntrega: cliente?.complementoEntrega || "",
      bairroEntrega: cliente?.bairroEntrega || "",
      cidadeEntrega: cliente?.cidadeEntrega || "",
      estadoEntrega: cliente?.estadoEntrega || "",
      limiteCredito: cliente?.limiteCredito || "",
      saldoInicial: cliente?.saldoInicial || "0",
      prazoPagamento: cliente?.prazoPagamento || "",
      numeroImposto: cliente?.numeroImposto || "",
      codigoCliente: cliente?.codigo || "",
      suframa: cliente?.suframa || "",
      camposPersonalizados: [],
      status: (cliente?.status as any) || "Ativo",
      observacoes: cliente?.observacoes || "",
    },
  })

  // ============================================
  // FUNÇÕES DAS APIS EXTERNAS
  // ============================================

  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) return

    setLoadingCEP(true)
    setErrorCEP(null)

    try {
      const enderecoData = await externalApisService.buscarCEP(cep)
      setEndereco(enderecoData)

      // Preenche automaticamente os campos do formulário
      form.setValue('endereco', enderecoData.logradouro)
      form.setValue('bairro', enderecoData.bairro)
      form.setValue('cidade', enderecoData.cidade)
      form.setValue('estado', enderecoData.estado)

      // Busca as cidades do estado automaticamente
      if (enderecoData.estado) {
        await selecionarEstado(enderecoData.estado)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar CEP'
      setErrorCEP(message)
    } finally {
      setLoadingCEP(false)
    }
  }, [form])

  const buscarCNPJ = useCallback(async (cnpj: string) => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return

    setLoadingCNPJ(true)
    setErrorCNPJ(null)

    try {
      const empresaData = await externalApisService.buscarCNPJ(cnpj)
      
      // Preenche automaticamente os campos do formulário
      form.setValue('nome', empresaData.razao_social)
      form.setValue('nomeFantasia', empresaData.nome_fantasia)
      form.setValue('email', empresaData.contato.email || '')
      form.setValue('telefoneFixo', empresaData.contato.telefone || '')
      
      // Preenche endereço da empresa
      if (empresaData.endereco) {
        form.setValue('cep', empresaData.endereco.cep)
        form.setValue('endereco', empresaData.endereco.logradouro)
        form.setValue('numero', empresaData.endereco.numero || '')
        form.setValue('complemento', empresaData.endereco.complemento || '')
        form.setValue('bairro', empresaData.endereco.bairro)
        form.setValue('cidade', empresaData.endereco.cidade)
        form.setValue('estado', empresaData.endereco.estado)
        
        setEndereco(empresaData.endereco)
        
        // Busca as cidades do estado
        if (empresaData.endereco.estado) {
          await selecionarEstado(empresaData.endereco.estado)
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar CNPJ'
      setErrorCNPJ(message)
    } finally {
      setLoadingCNPJ(false)
    }
  }, [form])

  const selecionarEstado = useCallback(async (uf: string) => {
    if (!uf) return

    setLoadingCidades(true)

    try {
      const cidadesData = await externalApisService.buscarCidades(uf)
      setCidades(cidadesData)
    } catch (err) {
      console.error('Erro ao buscar cidades:', err)
    } finally {
      setLoadingCidades(false)
    }
  }, [])

  const limparEndereco = useCallback(() => {
    setEndereco(null)
    setCidades([])
    setErrorCEP(null)
    form.setValue('endereco', '')
    form.setValue('numero', '')
    form.setValue('complemento', '')
    form.setValue('bairro', '')
    form.setValue('cidade', '')
  }, [form])

  // ============================================
  // SUBMIT DO FORMULÁRIO
  // ============================================

  const onSubmit = useCallback(async (data: ClienteFormValues) => {
    setError(null)

    // Validação customizada: Inscrição Estadual obrigatória para empresas não consumidor final
    const isCNPJ = data.cpfCnpj.replace(/\D/g, '').length === 14
    if (!data.consumidorFinal && isCNPJ && (!data.inscricaoEstadual || data.inscricaoEstadual.trim() === '')) {
      setError("Inscrição Estadual é obrigatória para empresas que não são consumidor final")
      return
    }

    try {
      const clienteData = {
        // Dados Básicos
        cpf: data.cpfCnpj.replace(/\D/g, ''), // Remove máscara
        rgIe: data.inscricaoEstadual || "", // Campo unificado RG/IE
        inscricaoEstadual: data.inscricaoEstadual || "",
        inscricaoMunicipal: data.inscricaoMunicipal || "",
        nome: data.nome,
        nomeFantasia: data.nomeFantasia || "",
        tipoContato: data.tipoCliente,
        dataNascimento: data.dataAbertura || "", // Campo unificado
        dataAbertura: data.dataAbertura || "",

        // Contatos
        email: data.email || "",
        pontoReferencia: data.pontoReferencia || "",
        telefone: data.telefoneFixo || "", // Backend espera 'telefone'
        telefoneFixo: data.telefoneFixo || "",
        celular: data.celular || "",

        // Endereço Principal
        cep: data.cep || "",
        endereco: data.endereco || "",
        numero: data.numero || "",
        complemento: data.complemento || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "",

        // Endereço de Entrega
        cepEntrega: data.cepEntrega || "",
        enderecoEntrega: data.enderecoEntrega || "",
        numeroEntrega: data.numeroEntrega || "",
        complementoEntrega: data.complementoEntrega || "",
        bairroEntrega: data.bairroEntrega || "",
        cidadeEntrega: data.cidadeEntrega || "",
        estadoEntrega: data.estadoEntrega || "",

        // Dados Financeiros
        limiteCredito: data.limiteCredito || "",
        saldoInicial: data.saldoInicial || "",
        prazoPagamento: data.prazoPagamento || "",

        // Dados Fiscais
        numeroImposto: data.numeroImposto || "",
        codigo: data.codigoCliente || "",
        suframa: data.suframa || "",
        consumidorFinal: data.consumidorFinal,

        // Campos Personalizados
        campoPersonalizado1: data.camposPersonalizados[0]?.valor || "",
        campoPersonalizado2: data.camposPersonalizados[1]?.valor || "",
        campoPersonalizado3: data.camposPersonalizados[2]?.valor || "",
        campoPersonalizado4: data.camposPersonalizados[3]?.valor || "",

        // Campos de Sistema
        status: data.status,
        observacoes: data.observacoes || "",
      }

      if (isEditing && cliente) {
        await updateCliente(cliente.id, clienteData)
      } else {
        await createCliente(clienteData)
      }

      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente'
      setError(message)
      throw err
    }
  }, [isEditing, cliente, createCliente, updateCliente, onSuccess])

  // ============================================
  // EFEITOS
  // ============================================

  // Carrega estados ao montar o componente
  useEffect(() => {
    const carregarEstados = async () => {
      setLoadingEstados(true)
      try {
        const estadosData = await externalApisService.buscarEstados()
        setEstados(estadosData)
      } catch (err) {
        console.error('Erro ao carregar estados:', err)
      } finally {
        setLoadingEstados(false)
      }
    }

    carregarEstados()
  }, [])

  // Se está editando e tem estado, carrega as cidades
  useEffect(() => {
    if (cliente?.estado) {
      selecionarEstado(cliente.estado)
    }
  }, [cliente?.estado, selecionarEstado])

  return {
    // Form
    form,
    
    // Estados
    estados,
    cidades,
    endereco,
    
    // Loading states
    loading,
    loadingCEP,
    loadingCNPJ,
    loadingEstados,
    loadingCidades,
    
    // Errors
    error,
    errorCEP,
    errorCNPJ,
    
    // Actions
    buscarCEP,
    buscarCNPJ,
    selecionarEstado,
    onSubmit,
    limparEndereco,
    
    // Flags
    isEditing,
  }
}
