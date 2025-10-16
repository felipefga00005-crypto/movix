'use client'

/**
 * Página de Cadastro de Clientes
 * Gerenciamento completo de clientes com integração ao backend
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ClientesDataTable } from "@/components/cadastro/clientes/clientes-data-table"
import { ClienteStatsComponent } from "@/components/cadastro/clientes/cliente-stats"
import { ClienteForm } from "@/components/cadastro/clientes/cliente-form"
import { useClientes } from "@/hooks/useClientes"
import type { Cliente } from "@/types/cliente"
import { toast } from "sonner"

export default function ClientesPage() {
  const router = useRouter()
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
    router.push(`/cadastro/clientes/${cliente.id}`)
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Estatísticas */}
              <div className="px-4 lg:px-6">
                <ClienteStatsComponent key={`stats-${refreshKey}`} />
              </div>

              {/* Tabela com Filtros */}
              <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <ClientesDataTable
                  key={`table-${refreshKey}`}
                  data={clientes}
                  isLoading={isLoading}
                  onNew={handleNew}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onRefresh={refreshClientes}
                />
              </div>

              {/* Formulário Modal */}
              <ClienteForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                cliente={selectedCliente}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

