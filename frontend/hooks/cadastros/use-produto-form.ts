"use client"

// ============================================
// HOOK INTEGRADO - useProdutoForm
// Combina cadastro de produtos com validações específicas
// ============================================

import { useState, useCallback, useEffect } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useProdutos } from "./use-produtos"
import type { Produto } from "@/types"

// ============================================
// SCHEMA DO FORMULÁRIO
// ============================================

export const produtoFormSchema = z.object({
  // Dados Básicos
  codigo: z.string().optional(),
  codigoBarras: z.string().optional(),
  nome: z.string().min(3, "Nome é obrigatório"),
  descricao: z.string().optional(),
  
  // Categoria e Classificação
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  marcaId: z.number().optional(),
  grupoId: z.number().optional(),
  
  // Unidades e Medidas
  unidadeMedidaId: z.number().min(1, "Unidade de medida é obrigatória"),
  peso: z.number().optional(),
  dimensoes: z.string().optional(), // Ex: "10x20x30 cm"
  
  // Preços
  precoCompra: z.number().min(0, "Preço de compra deve ser maior que zero"),
  precoVenda: z.number().min(0, "Preço de venda deve ser maior que zero"),
  margemLucro: z.number().optional(),
  
  // Estoque
  estoqueMinimo: z.number().min(0, "Estoque mínimo deve ser maior ou igual a zero"),
  estoqueMaximo: z.number().optional(),
  estoqueAtual: z.number().min(0, "Estoque atual deve ser maior ou igual a zero"),
  localizacao: z.string().optional(), // Ex: "Prateleira A1"
  
  // Fornecedor
  fornecedorId: z.number().optional(),
  
  // Status e Controle
  status: z.enum(["Ativo", "Inativo", "Descontinuado"]).default("Ativo"),
  controlaEstoque: z.boolean().default(true),
  permiteVendaSemEstoque: z.boolean().default(false),
  
  // Informações Fiscais
  ncm: z.string().optional(), // Nomenclatura Comum do Mercosul
  cest: z.string().optional(), // Código Especificador da Substituição Tributária
  origem: z.string().optional(),
  
  // Observações
  observacoes: z.string().optional(),
}).refine((data) => {
  // Validação: Preço de venda deve ser maior que preço de compra
  if (data.precoVenda <= data.precoCompra) {
    return false
  }
  return true
}, {
  message: "Preço de venda deve ser maior que preço de compra",
  path: ["precoVenda"]
}).refine((data) => {
  // Validação: Se controla estoque, estoque mínimo é obrigatório
  if (data.controlaEstoque && data.estoqueMinimo === undefined) {
    return false
  }
  return true
}, {
  message: "Estoque mínimo é obrigatório quando controla estoque",
  path: ["estoqueMinimo"]
}).refine((data) => {
  // Validação: Estoque máximo deve ser maior que mínimo (se informado)
  if (data.estoqueMaximo && data.estoqueMaximo <= data.estoqueMinimo) {
    return false
  }
  return true
}, {
  message: "Estoque máximo deve ser maior que estoque mínimo",
  path: ["estoqueMaximo"]
})

export type ProdutoFormValues = z.infer<typeof produtoFormSchema>

// ============================================
// INTERFACE DO HOOK
// ============================================

interface UseProdutoFormOptions {
  produto?: Produto | null
  onSuccess?: () => void
}

interface UseProdutoFormReturn {
  // Form
  form: UseFormReturn<ProdutoFormValues>
  
  // Loading states
  loading: boolean
  
  // Errors
  error: string | null
  
  // Actions
  onSubmit: (data: ProdutoFormValues) => Promise<void>
  calcularMargemLucro: () => void
  calcularPrecoVenda: (margem: number) => void
  
  // Flags
  isEditing: boolean
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useProdutoForm({ produto, onSuccess }: UseProdutoFormOptions): UseProdutoFormReturn {
  // Hook de produtos
  const { createProduto, updateProduto, loading, error } = useProdutos({ autoFetch: false })

  // Flag de edição
  const isEditing = !!produto

  // Configuração do formulário
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      codigo: produto?.codigo || "",
      codigoBarras: produto?.codigoBarras || "",
      nome: produto?.nome || "",
      descricao: produto?.descricao || "",
      categoriaId: produto?.categoriaId || 0,
      marcaId: produto?.marcaId || 0,
      grupoId: produto?.grupoId || 0,
      unidadeMedidaId: produto?.unidadeMedidaId || 0,
      peso: produto?.peso || 0,
      dimensoes: produto?.dimensoes || "",
      precoCompra: produto?.precoCompra || 0,
      precoVenda: produto?.precoVenda || 0,
      margemLucro: produto?.margemLucro || 0,
      estoqueMinimo: produto?.estoqueMinimo || 0,
      estoqueMaximo: produto?.estoqueMaximo || 0,
      estoqueAtual: produto?.estoqueAtual || 0,
      localizacao: produto?.localizacao || "",
      fornecedorId: produto?.fornecedorId || 0,
      status: (produto?.status as any) || "Ativo",
      controlaEstoque: produto?.controlaEstoque ?? true,
      permiteVendaSemEstoque: produto?.permiteVendaSemEstoque ?? false,
      ncm: produto?.ncm || "",
      cest: produto?.cest || "",
      origem: produto?.origem || "",
      observacoes: produto?.observacoes || "",
    },
  })

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  // Calcular margem de lucro baseada nos preços
  const calcularMargemLucro = useCallback(() => {
    const precoCompra = form.getValues('precoCompra')
    const precoVenda = form.getValues('precoVenda')
    
    if (precoCompra > 0 && precoVenda > 0) {
      const margem = ((precoVenda - precoCompra) / precoCompra) * 100
      form.setValue('margemLucro', Math.round(margem * 100) / 100)
    }
  }, [form])

  // Calcular preço de venda baseado na margem
  const calcularPrecoVenda = useCallback((margem: number) => {
    const precoCompra = form.getValues('precoCompra')
    
    if (precoCompra > 0 && margem > 0) {
      const precoVenda = precoCompra * (1 + margem / 100)
      form.setValue('precoVenda', Math.round(precoVenda * 100) / 100)
    }
  }, [form])

  // ============================================
  // SUBMIT DO FORMULÁRIO
  // ============================================

  const onSubmit = useCallback(async (data: ProdutoFormValues) => {
    try {
      if (isEditing && produto) {
        await updateProduto(produto.id, data)
      } else {
        await createProduto(data)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    }
  }, [isEditing, produto, updateProduto, createProduto, onSuccess])

  // ============================================
  // EFEITOS
  // ============================================

  // Recalcular margem quando preços mudarem
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'precoCompra' || name === 'precoVenda') {
        calcularMargemLucro()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, calcularMargemLucro])

  return {
    form,
    loading,
    error,
    onSubmit,
    calcularMargemLucro,
    calcularPrecoVenda,
    isEditing,
  }
}
