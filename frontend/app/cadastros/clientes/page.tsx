"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconPlus, IconUsers } from "@tabler/icons-react"

import { ClienteStatsCards } from "@/components/cadastros/clientes/cliente-stats-cards"
import { ClienteTable } from "@/components/cadastros/clientes/cliente-table"
import { ClienteForm } from "@/components/cadastros/clientes/cliente-form"
import { Cliente, CreateClienteRequest, UpdateClienteRequest } from "@/types/cliente"

export default function ClientesPage() {
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>()

  // Carregar clientes
  React.useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar chamada para API
      // const response = await clienteAPI.listar()
      // setClientes(response.data)
      setClientes([]) // Temporário
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCliente = async (data: CreateClienteRequest) => {
    try {
      // TODO: Implementar chamada para API
      // await clienteAPI.criar(data)
      console.log("Criando cliente:", data)
      await loadClientes()
      setShowForm(false)
    } catch (error) {
      console.error("Erro ao criar cliente:", error)
      throw error
    }
  }

  const handleUpdateCliente = async (data: UpdateClienteRequest) => {
    if (!editingCliente) return
    
    try {
      // TODO: Implementar chamada para API
      // await clienteAPI.atualizar(editingCliente.id, data)
      console.log("Atualizando cliente:", data)
      await loadClientes()
      setEditingCliente(undefined)
      setShowForm(false)
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      throw error
    }
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowForm(true)
  }

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      return
    }

    try {
      // TODO: Implementar chamada para API
      // await clienteAPI.excluir(cliente.id)
      console.log("Excluindo cliente:", cliente)
      await loadClientes()
    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingCliente(undefined)
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
                        {editingCliente ? "Editar Cliente" : "Novo Cliente"}
                      </h1>
                      <p className="text-muted-foreground">
                        {editingCliente 
                          ? "Atualize as informações do cliente" 
                          : "Cadastre um novo cliente no sistema"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <ClienteForm
                    cliente={editingCliente}
                    onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
                    onCancel={handleCancelForm}
                    isLoading={isLoading}
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
                      <IconUsers className="h-6 w-6" />
                      Clientes
                    </h1>
                    <p className="text-muted-foreground">
                      Gerencie os clientes do seu sistema
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <ClienteStatsCards clientes={clientes} />
              </div>

              {/* Table */}
              <ClienteTable
                clientes={clientes}
                isLoading={isLoading}
                onEdit={handleEditCliente}
                onDelete={handleDeleteCliente}
              />
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
