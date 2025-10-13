"use client"

import { useState } from "react"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import { ProdutosSectionCards } from "@/components/cadastros/produtos/produtos-section-cards"
import { ProdutosDataTable } from "@/components/cadastros/produtos/produtos-data-table"
import { ProdutoFormDialog } from "@/components/cadastros/produtos/produto-form-dialog"
import { ProdutosFilters, type ProdutoFilters } from "@/components/cadastros/produtos/produtos-filters"
import { useProdutos } from "@/hooks/cadastros/use-produtos"
import { Button } from "@/components/ui/button"
import { IconRefresh, IconPlus, IconPackage } from "@tabler/icons-react"
import type { Produto } from "@/types"

export default function ProdutosPage() {
  const { produtos, stats, loading, error, refresh, fetchProdutos } = useProdutos()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [filters, setFilters] = useState<ProdutoFilters>({})

  const handleNewProduto = () => {
    setSelectedProduto(null)
    setDrawerOpen(true)
  }

  const handleEditProduto = (produto: Produto) => {
    setSelectedProduto(produto)
    setDrawerOpen(true)
  }

  const handleDrawerSuccess = () => {
    refresh()
  }

  const handleFilter = (newFilters: ProdutoFilters) => {
    setFilters(newFilters)
    fetchProdutos(newFilters)
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 py-4">

        {loading && (
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando produtos...</p>
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

        {!loading && !error && produtos.length === 0 && (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Comece adicionando seu primeiro produto"
            actionLabel="Adicionar Produto"
            onAction={handleNewProduto}
            icon={<IconPackage className="h-12 w-12" />}
          />
        )}

        {!loading && !error && produtos.length > 0 && (
          <>
            {/* Cards de Estatísticas */}
            <ProdutosSectionCards stats={stats} />

            {/* Filtros Avançados */}
            <div className="px-4 lg:px-6">
              <ProdutosFilters onFilter={handleFilter} />
            </div>

            {/* Tabela */}
            <ProdutosDataTable
              data={produtos}
              onEdit={handleEditProduto}
              actionButtons={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refresh}
                    disabled={loading}
                  >
                    <IconRefresh className={loading ? "animate-spin" : ""} />
                    Atualizar
                  </Button>
                  <Button size="sm" onClick={handleNewProduto}>
                    <IconPlus />
                    Novo Produto
                  </Button>
                </>
              }
            />
          </>
        )}

        {!loading && !error && produtos.length === 0 && (
          <div className="px-4 lg:px-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <h3 className="font-semibold mb-1">Nenhum produto cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro produto
              </p>
              <Button onClick={handleNewProduto}>
                <IconPlus />
                Adicionar Produto
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProdutoFormDialog
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        produto={selectedProduto}
        onSuccess={handleDrawerSuccess}
      />
    </AppLayout>
  )
}
