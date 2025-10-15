'use client'

/**
 * Página de Cadastro de Clientes
 * Gerenciamento completo de clientes com integração ao backend
 */

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ClientesTableAdvanced } from "@/components/cadastro/clientes/clientes-table-advanced"
import { ClienteStatsComponent } from "@/components/cadastro/clientes/cliente-stats"
import { ClienteForm } from "@/components/cadastro/clientes/cliente-form"
import { useClientes } from "@/hooks/useClientes"
import type { Cliente } from "@/types/cliente"
import { toast } from "sonner"

export default function ClientesPage() {
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Hook para gerenciar dados dos clientes
  const { clientes, isLoading, deleteCliente, refreshClientes } = useClientes()

  const handleNew = () => {
    setSelectedCliente(null)
    setIsFormOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsFormOpen(true)
  }

  const handleView = (cliente: Cliente) => {
    // TODO: Implementar modal de visualização
    console.log('Visualizar cliente:', cliente)
  }

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.razao_social}?`)) {
      await deleteCliente(cliente.id!)
    }
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    refreshClientes()
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
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Estatísticas */}
          <ClienteStatsComponent key={`stats-${refreshKey}`} />

          {/* Tabela com Filtros */}
          <ClientesTableAdvanced
            key={`table-${refreshKey}`}
            data={clientes}
            isLoading={isLoading}
            onNew={handleNew}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onRefresh={refreshClientes}
          />

          {/* Formulário Modal */}
          <ClienteForm
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            cliente={selectedCliente}
            onSuccess={handleFormSuccess}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

