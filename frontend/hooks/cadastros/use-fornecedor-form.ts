"use client"

// ============================================
// HOOK INTEGRADO - useFornecedorForm
// Combina cadastro de fornecedores com APIs externas
// ============================================

import { useState, useCallback, useEffect } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useFornecedores } from "./use-fornecedores"
import { externalApisService, type Endereco, type Estado, type Cidade } from "@/lib/api/external-apis"
import type { Fornecedor } from "@/types"

// ============================================
// SCHEMA DO FORMULÁRIO
// ============================================

export const fornecedorFormSchema = z.object({
  // Dados Básicos - Informações Gerais do Fornecedor
  codigo: z.string().optional(),
  razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ é obrigatório"),
  inscricaoEstadual: z.string().optional(),

  // Contatos
  email: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true // Se vazio, é válido
    return z.string().email().safeParse(val).success // Se preenchido, valida email
  }, {
    message: "Email inválido"
  }),
  telefone: z.string().min(10, "Telefone é obrigatório"),
  celular: z.string().optional(),
  contato: z.string().optional(), // Nome da pessoa de contato

  // Endereço
  cep: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  uf: z.string().optional(),

  // Dados Comerciais
  categoria: z.string().min(1, "Categoria é obrigatória"),
  status: z.enum(["Ativo", "Inativo", "Pendente"]).default("Ativo"),
  observacoes: z.string().optional(),
})

export type FornecedorFormValues = z.infer<typeof fornecedorFormSchema>

// ============================================
// INTERFACE DO HOOK
// ============================================

interface UseFornecedorFormOptions {
  fornecedor?: Fornecedor | null
  onSuccess?: () => void
}

interface UseFornecedorFormReturn {
  // Form
  form: UseFormReturn<FornecedorFormValues>
  
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
  onSubmit: (data: FornecedorFormValues) => Promise<void>
  limparEndereco: () => void
  
  // Flags
  isEditing: boolean
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useFornecedorForm({ fornecedor, onSuccess }: UseFornecedorFormOptions): UseFornecedorFormReturn {
  // Estados locais
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [loadingCNPJ, setLoadingCNPJ] = useState(false)
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [errorCEP, setErrorCEP] = useState<string | null>(null)
  const [errorCNPJ, setErrorCNPJ] = useState<string | null>(null)

  // Hook de fornecedores
  const { createFornecedor, updateFornecedor, loading, error } = useFornecedores({ autoFetch: false })

  // Flag de edição
  const isEditing = !!fornecedor

  // Configuração do formulário
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorFormSchema),
    defaultValues: {
      codigo: fornecedor?.codigo || "",
      razaoSocial: fornecedor?.razaoSocial || "",
      nomeFantasia: fornecedor?.nomeFantasia || "",
      cnpj: fornecedor?.cnpj || "",
      inscricaoEstadual: fornecedor?.inscricaoEstadual || "",
      email: fornecedor?.email || "",
      telefone: fornecedor?.telefone || "",
      celular: fornecedor?.celular || "",
      contato: fornecedor?.contato || "",
      cep: fornecedor?.cep || "",
      endereco: fornecedor?.endereco || "",
      cidade: fornecedor?.cidade || "",
      estado: fornecedor?.estado || "",
      uf: fornecedor?.uf || "",
      categoria: fornecedor?.categoria || "",
      status: (fornecedor?.status as any) || "Ativo",
      observacoes: fornecedor?.observacoes || "",
    },
  })

  // ============================================
  // FUNÇÕES DE API EXTERNA
  // ============================================

  // Buscar CEP
  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return

    setLoadingCEP(true)
    setErrorCEP(null)
    try {
      const enderecoData = await externalApisService.buscarCEP(cep)
      setEndereco(enderecoData)
      
      // Preencher campos automaticamente
      form.setValue('endereco', enderecoData.logradouro || '')
      form.setValue('bairro', enderecoData.bairro || '')
      form.setValue('cidade', enderecoData.localidade || '')
      form.setValue('estado', enderecoData.uf || '')
      form.setValue('uf', enderecoData.uf || '')
    } catch (error) {
      setErrorCEP('CEP não encontrado')
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoadingCEP(false)
    }
  }, [form])

  // Buscar CNPJ
  const buscarCNPJ = useCallback(async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    if (!cnpjLimpo || cnpjLimpo.length !== 14) return

    setLoadingCNPJ(true)
    setErrorCNPJ(null)
    try {
      const empresaData = await externalApisService.buscarCNPJ(cnpj)
      
      // Preencher campos automaticamente
      form.setValue('razaoSocial', empresaData.nome || '')
      form.setValue('nomeFantasia', empresaData.fantasia || '')
      
      if (empresaData.endereco) {
        form.setValue('cep', empresaData.endereco.cep || '')
        form.setValue('endereco', empresaData.endereco.logradouro || '')
        form.setValue('cidade', empresaData.endereco.municipio || '')
        form.setValue('estado', empresaData.endereco.uf || '')
        form.setValue('uf', empresaData.endereco.uf || '')
      }
    } catch (error) {
      setErrorCNPJ('CNPJ não encontrado')
      console.error('Erro ao buscar CNPJ:', error)
    } finally {
      setLoadingCNPJ(false)
    }
  }, [form])

  // Carregar estados
  const carregarEstados = useCallback(async () => {
    setLoadingEstados(true)
    try {
      const estadosData = await externalApisService.buscarEstados()
      setEstados(estadosData)
    } catch (error) {
      console.error('Erro ao carregar estados:', error)
    } finally {
      setLoadingEstados(false)
    }
  }, [])

  // Selecionar estado e carregar cidades
  const selecionarEstado = useCallback(async (uf: string) => {
    if (!uf) return

    setLoadingCidades(true)
    try {
      const cidadesData = await externalApisService.buscarCidades(uf)
      setCidades(cidadesData)
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
    } finally {
      setLoadingCidades(false)
    }
  }, [])

  // Limpar endereço
  const limparEndereco = useCallback(() => {
    setEndereco(null)
    form.setValue('cep', '')
    form.setValue('endereco', '')
    form.setValue('cidade', '')
    form.setValue('estado', '')
    form.setValue('uf', '')
  }, [form])

  // ============================================
  // SUBMIT DO FORMULÁRIO
  // ============================================

  const onSubmit = useCallback(async (data: FornecedorFormValues) => {
    try {
      if (isEditing && fornecedor) {
        await updateFornecedor(fornecedor.id, data)
      } else {
        await createFornecedor(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error)
    }
  }, [isEditing, fornecedor, updateFornecedor, createFornecedor, onSuccess])

  // ============================================
  // EFEITOS
  // ============================================

  // Carregar estados ao montar
  useEffect(() => {
    carregarEstados()
  }, [carregarEstados])

  // Carregar cidades quando estado mudar
  useEffect(() => {
    const estado = form.watch('estado')
    if (estado) {
      selecionarEstado(estado)
    }
  }, [form.watch('estado'), selecionarEstado])

  return {
    form,
    estados,
    cidades,
    endereco,
    loading,
    loadingCEP,
    loadingCNPJ,
    loadingEstados,
    loadingCidades,
    error,
    errorCEP,
    errorCNPJ,
    buscarCEP,
    buscarCNPJ,
    selecionarEstado,
    onSubmit,
    limparEndereco,
    isEditing,
  }
}
