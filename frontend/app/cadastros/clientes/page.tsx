"use client"

import { useState } from "react"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import { ClientesSectionCards } from "@/components/cadastros/clientes/clientes-section-cards"
import { ClientesDataTable } from "@/components/cadastros/clientes/clientes-data-table"
import { ClienteFormDialog } from "@/components/cadastros/clientes/cliente-form-dialog"
import { ClientesFilters, type ClienteFilters } from "@/components/cadastros/clientes/clientes-filters"
import { useClientes } from "@/hooks/cadastros/use-clientes"
import { Button } from "@/components/ui/button"
import { IconRefresh, IconPlus, IconUsers } from "@tabler/icons-react"
import type { Cliente } from "@/types"

export default function ClientesPage() {
  const { clientes, stats, loading, error, refresh, fetchClientes } = useClientes()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [filters, setFilters] = useState<ClienteFilters>({})

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setDialogOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    refresh()
    // Limpar cliente selecionado para garantir que o próximo formulário seja limpo
    setSelectedCliente(null)
  }

  const handleFilter = (newFilters: ClienteFilters) => {
    setFilters(newFilters)
    fetchClientes(newFilters)
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 py-4">

        {loading && (
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando clientes...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 lg:px-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-semibold text-destructive mb-1">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="mt-3"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && clientes.length === 0 && (
          <EmptyState
            title="Nenhum cliente cadastrado"
            description="Comece adicionando seu primeiro cliente"
            actionLabel="Adicionar Cliente"
            onAction={handleNewCliente}
            icon={<IconUsers className="h-12 w-12" />}
          />
        )}

        {!loading && !error && clientes.length > 0 && (
          <>
            {/* Cards de Estatísticas */}
            <ClientesSectionCards stats={stats} />

            {/* Filtros Avançados */}
            <div className="px-4 lg:px-6">
              <ClientesFilters onFilter={handleFilter} />
            </div>

            {/* Tabela */}
            <ClientesDataTable
              data={clientes}
              onEdit={handleEditCliente}
              onStatusChange={refresh}
              actionButtons={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refresh}
                    disabled={loading}
                  >
                    <IconRefresh className={loading ? "animate-spin" : ""} />
                    <span className="hidden lg:inline">Atualizar</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNewCliente}
                  >
                    <IconPlus />
                    <span className="hidden lg:inline">Novo Cliente</span>
                    <span className="lg:hidden">Novo</span>
                  </Button>
                </div>
              }
            />
          </>
        )}


      </div>

      <ClienteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cliente={selectedCliente}
        onSuccess={handleDialogSuccess}
      />
    </AppLayout>
  )
}
