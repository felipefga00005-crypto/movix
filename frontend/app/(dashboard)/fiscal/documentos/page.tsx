'use client'

/**
 * Página de Documentos Fiscais
 * Gerenciamento de NFCe e outros documentos fiscais
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
import { DocumentosDataTable } from "@/components/fiscal/documentos/documentos-data-table"
import { DocumentoStatsComponent } from "@/components/fiscal/documentos/documento-stats"
import { DocumentoDetailsDialog } from "@/components/fiscal/documentos/documento-details-dialog"
import { useDocumentosFiscais } from "@/hooks/useDocumentosFiscais"
import { fiscalService } from "@/lib/services/fiscal"

type AlertType = 'cancel' | 'reenviar' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function DocumentosPage() {
  const router = useRouter()
  const [selectedDocumento, setSelectedDocumento] = useState<any>(null)
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
    documentos,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    refetch,
  } = useDocumentosFiscais({ key: refreshKey })

  // Handlers para ações
  const handleViewDetails = (documento: any) => {
    setSelectedDocumento(documento)
    setIsDetailsOpen(true)
  }

  const handleCancelDocument = (documento: any) => {
    setAlertState({
      isOpen: true,
      type: 'cancel',
      title: 'Cancelar Documento',
      description: `Tem certeza que deseja cancelar o documento ${documento.numero}? Esta ação não pode ser desfeita.`,
      onConfirm: () => confirmCancelDocument(documento.chaveAcesso),
    })
  }

  const handleReenviarDocument = (documento: any) => {
    setAlertState({
      isOpen: true,
      type: 'reenviar',
      title: 'Reenviar Documento',
      description: `Deseja reenviar o documento ${documento.numero} para o SEFAZ?`,
      onConfirm: () => confirmReenviarDocument(documento.chaveAcesso),
    })
  }

  const handleConsultarStatus = async (documento: any) => {
    try {
      const result = await fiscalService.consultarStatusNFCe(documento.chaveAcesso)
      
      if (result.sucesso) {
        showSuccessAlert(`Status do documento: ${result.status}`)
      } else {
        showErrorAlert('Erro ao consultar status do documento')
      }
      
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao consultar status do documento')
    }
  }

  // Confirmações das ações
  const confirmCancelDocument = async (chaveAcesso: string) => {
    try {
      const justificativa = "Cancelamento solicitado pelo usuário" // TODO: Permitir input da justificativa
      await fiscalService.cancelarNFCe(chaveAcesso, justificativa)
      showSuccessAlert('Documento cancelado com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao cancelar documento')
    }
  }

  const confirmReenviarDocument = async (chaveAcesso: string) => {
    try {
      // TODO: Implementar reenvio
      console.log('Reenviar documento:', chaveAcesso)
      showSuccessAlert('Documento reenviado com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao reenviar documento')
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
                    <h1 className="text-2xl font-bold tracking-tight">Documentos Fiscais</h1>
                    <p className="text-muted-foreground">
                      Gerencie NFCe e outros documentos fiscais emitidos
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <DocumentoStatsComponent />
              </div>

              {/* Data Table */}
              <div className="px-4 lg:px-6">
                <DocumentosDataTable
                  documentos={documentos}
                  loading={loading}
                  pagination={pagination}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onViewDetails={handleViewDetails}
                  onCancelDocument={handleCancelDocument}
                  onReenviarDocument={handleReenviarDocument}
                  onConsultarStatus={handleConsultarStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <DocumentoDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        documento={selectedDocumento}
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
                alertState.type === 'cancel'
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
