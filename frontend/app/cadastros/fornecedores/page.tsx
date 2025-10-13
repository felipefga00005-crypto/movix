"use client"

import { useState } from "react"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import { FornecedoresDataTable } from "@/components/cadastros/fornecedores/fornecedores-data-table"
import { FornecedoresFilters, type FornecedorFilters } from "@/components/cadastros/fornecedores/fornecedores-filters"
import { FornecedorFormDialog } from "@/components/cadastros/fornecedores/fornecedor-form-dialog"
import { Button } from "@/components/ui/button"
import { IconPlus, IconTruck } from "@tabler/icons-react"

import data from "./data.json"

export default function FornecedoresPage() {
  const [filters, setFilters] = useState<FornecedorFilters>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFornecedor, setSelectedFornecedor] = useState<any | null>(null)

  const handleFilter = (newFilters: FornecedorFilters) => {
    setFilters(newFilters)
    // TODO: Integrar com API quando disponível
    console.log("Filtros aplicados:", newFilters)
  }

  const handleNewFornecedor = () => {
    setSelectedFornecedor(null)
    setDialogOpen(true)
  }

  const handleEditFornecedor = (fornecedor: any) => {
    setSelectedFornecedor(fornecedor)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    // TODO: Refresh data
    console.log("Fornecedor salvo com sucesso!")
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 py-4">
        {data.length === 0 && (
          <EmptyState
            title="Nenhum fornecedor cadastrado"
            description="Comece adicionando seu primeiro fornecedor"
            actionLabel="Adicionar Fornecedor"
            onAction={handleNewFornecedor}
            icon={<IconTruck className="h-12 w-12" />}
          />
        )}

        {data.length > 0 && (
          <>
            {/* Filtros Avançados */}
            <div className="px-4 lg:px-6">
              <FornecedoresFilters onFilter={handleFilter} />
            </div>

            {/* Tabela */}
            <FornecedoresDataTable
              data={data}
              onEdit={handleEditFornecedor}
              actionButtons={
                <Button size="sm" onClick={handleNewFornecedor}>
                  <IconPlus />
                  Novo Fornecedor
                </Button>
              }
            />
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
