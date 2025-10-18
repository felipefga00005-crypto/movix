'use client'

/**
 * Página de Vendas do PDV
 * Listagem e gerenciamento de vendas realizadas
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
import { VendasDataTable } from "@/components/pdv/vendas/vendas-data-table"
import { VendaStatsComponent } from "@/components/pdv/vendas/venda-stats"
import { VendaDetailsDialog } from "@/components/pdv/vendas/venda-details-dialog"
import { useVendas } from "@/hooks/useVendas"
import { vendasService } from "@/lib/services/vendas"
import type { VendaResponse } from "@/lib/services/vendas"

type AlertType = 'cancel' | 'emitirNFCe' | 'cancelarNFCe' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function VendasPage() {
  const router = useRouter()
  const [selectedVenda, setSelectedVenda] = useState<VendaResponse | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  const {
    vendas,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refetch,
  } = useVendas({ key: refreshKey })

  // Handlers para ações
  const handleViewDetails = (venda: VendaResponse) => {
    setSelectedVenda(venda)
    setIsDetailsOpen(true)
  }

  const handleCancelVenda = (venda: VendaResponse) => {
    setAlertState({
      isOpen: true,
      type: 'cancel',
      title: 'Cancelar Venda',
      description: `Tem certeza que deseja cancelar a venda ${venda.numeroVenda}? Esta ação não pode ser desfeita.`,
      onConfirm: () => confirmCancelVenda(venda.id),
    })
  }

  const handleEmitirNFCe = (venda: VendaResponse) => {
    setAlertState({
      isOpen: true,
      type: 'emitirNFCe',
      title: 'Emitir NFCe',
      description: `Deseja emitir NFCe para a venda ${venda.numeroVenda}?`,
      onConfirm: () => confirmEmitirNFCe(venda.id),
    })
  }

  const handleCancelarNFCe = (venda: VendaResponse) => {
    setAlertState({
      isOpen: true,
      type: 'cancelarNFCe',
      title: 'Cancelar NFCe',
      description: `Deseja cancelar a NFCe da venda ${venda.numeroVenda}? Informe a justificativa.`,
      onConfirm: () => confirmCancelarNFCe(venda.id),
    })
  }

  // Confirmações das ações
  const confirmCancelVenda = async (vendaId: number) => {
    try {
      await vendasService.cancelarVenda(vendaId)
      showSuccessAlert('Venda cancelada com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao cancelar venda')
    }
  }

  const confirmEmitirNFCe = async (vendaId: number) => {
    try {
      await vendasService.emitirNFCeVenda(vendaId)
      showSuccessAlert('NFCe emitida com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao emitir NFCe')
    }
  }

  const confirmCancelarNFCe = async (vendaId: number) => {
    try {
      const justificativa = "Cancelamento solicitado pelo usuário" // TODO: Permitir input da justificativa
      await vendasService.cancelarNFCeVenda(vendaId, justificativa)
      showSuccessAlert('NFCe cancelada com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao cancelar NFCe')
    }
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
                    <h1 className="text-2xl font-bold tracking-tight">Vendas</h1>
                    <p className="text-muted-foreground">
                      Gerencie as vendas realizadas no PDV
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <VendaStatsComponent />
              </div>

              {/* Data Table */}
              <div className="px-4 lg:px-6">
                <VendasDataTable
                  vendas={vendas}
                  loading={loading}
                  pagination={pagination}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onViewDetails={handleViewDetails}
                  onCancelVenda={handleCancelVenda}
                  onEmitirNFCe={handleEmitirNFCe}
                  onCancelarNFCe={handleCancelarNFCe}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <VendaDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        venda={selectedVenda}
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
                alertState.type === 'cancel' || alertState.type === 'cancelarNFCe'
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
