"use client"

import { useState } from "react"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import { FornecedoresSectionCards } from "@/components/cadastros/fornecedores/fornecedores-section-cards"
import { FornecedoresDataTable } from "@/components/cadastros/fornecedores/fornecedores-data-table"
import { FornecedoresFilters, type FornecedorFilters } from "@/components/cadastros/fornecedores/fornecedores-filters"
import { FornecedorFormDialog } from "@/components/cadastros/fornecedores/fornecedor-form-dialog"
import { useFornecedores } from "@/hooks/cadastros/use-fornecedores"
import { Button } from "@/components/ui/button"
import { IconRefresh, IconPlus, IconTruck } from "@tabler/icons-react"
import type { Fornecedor } from "@/types"

export default function FornecedoresPage() {
  const { fornecedores, stats, loading, error, refresh, fetchFornecedores } = useFornecedores()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null)
  const [filters, setFilters] = useState<FornecedorFilters>({})

  const handleNewFornecedor = () => {
    setSelectedFornecedor(null)
    setDialogOpen(true)
  }

  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    refresh()
    // Limpar fornecedor selecionado para garantir que o próximo formulário seja limpo
    setSelectedFornecedor(null)
  }

  const handleFilter = (newFilters: FornecedorFilters) => {
    setFilters(newFilters)
    fetchFornecedores(newFilters)
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 py-4">
        {loading && (
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando fornecedores...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 lg:px-6">
            <div className="rounded-md bg-destructive/15 p-4">
              <div className="text-sm text-destructive">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && fornecedores.length === 0 && (
          <EmptyState
            title="Nenhum fornecedor cadastrado"
            description="Comece adicionando seu primeiro fornecedor"
            actionLabel="Adicionar Fornecedor"
            onAction={handleNewFornecedor}
            icon={<IconTruck className="h-12 w-12" />}
          />
        )}

        {!loading && !error && fornecedores.length > 0 && (
          <>
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
                  <p className="text-muted-foreground">
                    Gerencie seus fornecedores e parceiros comerciais
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={refresh}>
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Atualizar
                  </Button>
                  <Button onClick={handleNewFornecedor}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Novo Fornecedor
                  </Button>
                </div>
              </div>
            </div>

            {stats && (
              <div className="px-4 lg:px-6">
                <FornecedoresSectionCards stats={stats} />
              </div>
            )}

            <div className="px-4 lg:px-6">
              <FornecedoresFilters onFilter={handleFilter} />
            </div>

            <div className="px-4 lg:px-6">
              <FornecedoresDataTable
                data={fornecedores}
                onEdit={handleEditFornecedor}
                onStatusChange={refresh}
              />
            </div>
          </>
        )}
      </div>

      <FornecedorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fornecedor={selectedFornecedor}
        onSuccess={handleDialogSuccess}
      />
    </AppLayout>
  )
}
