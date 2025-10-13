"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconPlus, IconBuilding } from "@tabler/icons-react"

import { FornecedorStatsCards } from "@/components/cadastros/fornecedores/fornecedor-stats-cards"
import { FornecedorTable } from "@/components/cadastros/fornecedores/fornecedor-table"
import { FornecedorForm } from "@/components/cadastros/fornecedores/fornecedor-form"
import { Fornecedor, CreateFornecedorRequest, UpdateFornecedorRequest } from "@/types/fornecedor"
import { fornecedoresAPI } from "@/lib/api/fornecedores"

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = React.useState<Fornecedor[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingFornecedor, setEditingFornecedor] = React.useState<Fornecedor | undefined>()

  // Carregar fornecedores
  React.useEffect(() => {
    loadFornecedores()
  }, [])

  const loadFornecedores = async () => {
    setIsLoading(true)
    try {
      const data = await fornecedoresAPI.getAll()
      setFornecedores(data)
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error)
      // TODO: Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFornecedor = async (data: CreateFornecedorRequest) => {
    try {
      await fornecedoresAPI.create(data)
      await loadFornecedores()
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao criar fornecedor:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleUpdateFornecedor = async (data: UpdateFornecedorRequest) => {
    if (!editingFornecedor) return
    
    try {
      await fornecedoresAPI.update(editingFornecedor.id, data)
      await loadFornecedores()
      setEditingFornecedor(undefined)
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor)
    setShowForm(true)
  }

  const handleDeleteFornecedor = async (fornecedor: Fornecedor) => {
    if (!confirm(`Tem certeza que deseja excluir o fornecedor ${fornecedor.razaoSocial}?`)) {
      return
    }

    try {
      await fornecedoresAPI.delete(fornecedor.id)
      await loadFornecedores()
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingFornecedor(undefined)
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
                        {editingFornecedor ? "Editar Fornecedor" : "Novo Fornecedor"}
                      </h1>
                      <p className="text-muted-foreground">
                        {editingFornecedor 
                          ? "Atualize as informações do fornecedor" 
                          : "Cadastre um novo fornecedor no sistema"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <FornecedorForm
                    fornecedor={editingFornecedor}
                    onSubmit={editingFornecedor ? handleUpdateFornecedor : handleCreateFornecedor}
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
                      <IconBuilding className="h-6 w-6" />
                      Fornecedores
                    </h1>
                    <p className="text-muted-foreground">
                      Gerencie os fornecedores do seu sistema
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <FornecedorStatsCards fornecedores={fornecedores} />
              </div>

              {/* Table */}
              <FornecedorTable
                fornecedores={fornecedores}
                isLoading={isLoading}
                onEdit={handleEditFornecedor}
                onDelete={handleDeleteFornecedor}
              />
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
