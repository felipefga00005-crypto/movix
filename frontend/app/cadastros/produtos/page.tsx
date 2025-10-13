"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconPlus, IconPackage } from "@tabler/icons-react"

import { ProdutoStatsCards } from "@/components/cadastros/produtos/produto-stats-cards"
import { ProdutoTable } from "@/components/cadastros/produtos/produto-table"
import { ProdutoForm } from "@/components/cadastros/produtos/produto-form"
import { Produto, CreateProdutoRequest, UpdateProdutoRequest, UpdateEstoqueRequest } from "@/types/produto"
import { produtosAPI } from "@/lib/api/produtos"

export default function ProdutosPage() {
  const [produtos, setProdutos] = React.useState<Produto[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingProduto, setEditingProduto] = React.useState<Produto | undefined>()

  // Carregar produtos
  React.useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    setIsLoading(true)
    try {
      const data = await produtosAPI.getAll()
      setProdutos(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      // TODO: Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProduto = async (data: CreateProdutoRequest) => {
    try {
      await produtosAPI.create(data)
      await loadProdutos()
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleUpdateProduto = async (data: UpdateProdutoRequest) => {
    if (!editingProduto) return
    
    try {
      await produtosAPI.update(editingProduto.id, data)
      await loadProdutos()
      setEditingProduto(undefined)
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto)
    setShowForm(true)
  }

  const handleDeleteProduto = async (produto: Produto) => {
    if (!confirm(`Tem certeza que deseja excluir o produto ${produto.nome}?`)) {
      return
    }

    try {
      await produtosAPI.delete(produto.id)
      await loadProdutos()
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleUpdateEstoque = async (produto: Produto) => {
    const operacao = prompt(
      `Produto: ${produto.nome}\nEstoque atual: ${produto.estoque} ${produto.unidade}\n\nEscolha a operação:\n1 - Adicionar\n2 - Remover\n3 - Ajustar\n\nDigite o número da operação:`
    )

    if (!operacao || !['1', '2', '3'].includes(operacao)) {
      return
    }

    const quantidade = prompt("Digite a quantidade:")
    if (!quantidade || isNaN(Number(quantidade))) {
      alert("Quantidade inválida")
      return
    }

    const operacoes = {
      '1': 'adicionar' as const,
      '2': 'remover' as const,
      '3': 'ajustar' as const
    }

    const updateData: UpdateEstoqueRequest = {
      quantidade: Number(quantidade),
      operacao: operacoes[operacao as keyof typeof operacoes]
    }

    try {
      await produtosAPI.updateEstoque(produto.id, updateData)
      await loadProdutos()
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProduto(undefined)
  }

  if (showForm) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">
                        {editingProduto ? "Editar Produto" : "Novo Produto"}
                      </h1>
                      <p className="text-muted-foreground">
                        {editingProduto 
                          ? "Atualize as informações do produto" 
                          : "Cadastre um novo produto no sistema"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <ProdutoForm
                    produto={editingProduto}
                    onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto}
                    onCancel={handleCancelForm}
                    isLoading={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              
              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <IconPackage className="h-6 w-6" />
                      Produtos
                    </h1>
                    <p className="text-muted-foreground">
                      Gerencie os produtos e controle de estoque
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <ProdutoStatsCards produtos={produtos} isLoading={isLoading} />
              </div>

              {/* Table */}
              <ProdutoTable
                produtos={produtos}
                isLoading={isLoading}
                onEdit={handleEditProduto}
                onDelete={handleDeleteProduto}
                onUpdateEstoque={handleUpdateEstoque}
              />
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
