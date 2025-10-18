'use client'

/**
 * Página de Naturezas de Operação
 * Gerenciamento das naturezas de operação fiscais
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { NaturezasDataTable } from "@/components/fiscal/naturezas/naturezas-data-table"
import { NaturezaStatsComponent } from "@/components/fiscal/naturezas/natureza-stats"
import { NaturezaForm } from "@/components/fiscal/naturezas/natureza-form"
import { useNaturezas } from "@/hooks/useNaturezas"
import { naturezaService } from "@/lib/services/natureza.service"
import type { NaturezaOperacao } from "@/types/natureza"

type AlertType = 'delete' | 'activate' | 'deactivate' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function NaturezasPage() {
  const router = useRouter()
  const [selectedNatureza, setSelectedNatureza] = useState<NaturezaOperacao | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  const {
    naturezas,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refetch,
  } = useNaturezas({ key: refreshKey })

  // Handlers para ações
  const handleCreate = () => {
    setSelectedNatureza(null)
    setIsFormOpen(true)
  }

  const handleEdit = (natureza: NaturezaOperacao) => {
    setSelectedNatureza(natureza)
    setIsFormOpen(true)
  }

  const handleDelete = (natureza: NaturezaOperacao) => {
    setAlertState({
      isOpen: true,
      type: 'delete',
      title: 'Excluir Natureza de Operação',
      description: `Tem certeza que deseja excluir a natureza "${natureza.descricao}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => confirmDelete(natureza.id),
    })
  }

  const handleActivate = (natureza: NaturezaOperacao) => {
    setAlertState({
      isOpen: true,
      type: 'activate',
      title: 'Ativar Natureza de Operação',
      description: `Deseja ativar a natureza "${natureza.descricao}"?`,
      onConfirm: () => confirmActivate(natureza.id),
    })
  }

  const handleDeactivate = (natureza: NaturezaOperacao) => {
    setAlertState({
      isOpen: true,
      type: 'deactivate',
      title: 'Desativar Natureza de Operação',
      description: `Deseja desativar a natureza "${natureza.descricao}"?`,
      onConfirm: () => confirmDeactivate(natureza.id),
    })
  }

  // Confirmações das ações
  const confirmDelete = async (naturezaId: number) => {
    try {
      await naturezaService.deleteNatureza(naturezaId)
      showSuccessAlert('Natureza de operação excluída com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao excluir natureza de operação')
    }
  }

  const confirmActivate = async (naturezaId: number) => {
    try {
      await naturezaService.activateNatureza(naturezaId)
      showSuccessAlert('Natureza de operação ativada com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao ativar natureza de operação')
    }
  }

  const confirmDeactivate = async (naturezaId: number) => {
    try {
      await naturezaService.deactivateNatureza(naturezaId)
      showSuccessAlert('Natureza de operação desativada com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao desativar natureza de operação')
    }
  }

  // Handlers do formulário
  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedNatureza(null)
    setRefreshKey(prev => prev + 1)
  }

  // Helpers para alertas
  const showSuccessAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      type: 'success',
      title: 'Sucesso',
      description: message,
    })
  }

  const showErrorAlert = (message: string) => {
    setAlertState({
      isOpen: true,
      type: 'error',
      title: 'Erro',
      description: message,
    })
  }

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
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
                    <h1 className="text-2xl font-bold tracking-tight">Naturezas de Operação</h1>
                    <p className="text-muted-foreground">
                      Gerencie as naturezas de operação para documentos fiscais
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <NaturezaStatsComponent />
              </div>

              {/* Data Table */}
              <div className="px-4 lg:px-6">
                <NaturezasDataTable
                  naturezas={naturezas}
                  loading={loading}
                  pagination={pagination}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onCreate={handleCreate}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <NaturezaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        natureza={selectedNatureza}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={alertState.isOpen} onOpenChange={closeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                alertState.onConfirm?.()
                closeAlert()
              }}
              className={
                alertState.type === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
