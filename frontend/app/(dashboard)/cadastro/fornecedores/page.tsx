'use client'

/**
 * Página de Cadastro de Fornecedores
 * Gerenciamento completo de fornecedores com integração ao backend
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
import { FornecedoresDataTable } from "@/components/cadastro/fornecedores/fornecedores-data-table"
import { FornecedorStatsComponent } from "@/components/cadastro/fornecedores/fornecedor-stats"
import { FornecedorForm } from "@/components/cadastro/fornecedores/fornecedor-form"
import { useFornecedores } from "@/hooks/useFornecedores"
import { fornecedorService } from "@/lib/services/fornecedor.service"
import type { Fornecedor } from "@/types/fornecedor"
import * as XLSX from 'xlsx'

type AlertType = 'delete' | 'activate' | 'deactivate' | 'block' | 'unblock' | 'bulkActivate' | 'bulkDeactivate' | 'bulkBlock' | 'bulkDelete' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function FornecedoresPage() {
  const router = useRouter()
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  // Hook para gerenciar dados dos fornecedores
  const {
    fornecedores,
    stats,
    isLoading,
    deleteFornecedor,
    activateFornecedor,
    deactivateFornecedor,
    blockFornecedor,
    unblockFornecedor,
    bulkActivate,
    bulkDeactivate,
    bulkBlock,
    bulkDelete,
    refreshFornecedores
  } = useFornecedores()

  // Função auxiliar para mostrar alert
  const showAlert = (type: AlertType, title: string, description: string, onConfirm?: () => void) => {
    setAlertState({
      isOpen: true,
      type,
      title,
      description,
      onConfirm,
    })
  }

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }

  const handleNew = () => {
    setSelectedFornecedor(null)
    setIsFormOpen(true)
  }

  const handleEdit = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor)
    setIsFormOpen(true)
  }

  const handleView = (fornecedor: Fornecedor) => {
    router.push(`/cadastro/fornecedores/${fornecedor.id}`)
  }

  const handleDelete = (fornecedor: Fornecedor) => {
    showAlert(
      'delete',
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o fornecedor ${fornecedor.razao_social}?`,
      async () => {
        try {
          await deleteFornecedor(fornecedor.id!)
          showAlert('success', 'Sucesso', `Fornecedor ${fornecedor.razao_social} excluído com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir fornecedor')
        }
      }
    )
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    refreshFornecedores()
  }

  const handleActivate = (fornecedor: Fornecedor) => {
    showAlert(
      'activate',
      'Confirmar Ativação',
      `Deseja ativar o fornecedor ${fornecedor.razao_social}?`,
      async () => {
        try {
          await activateFornecedor(fornecedor.id)
          showAlert('success', 'Sucesso', `Fornecedor ${fornecedor.razao_social} ativado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar fornecedor')
        }
      }
    )
  }

  const handleDeactivate = (fornecedor: Fornecedor) => {
    showAlert(
      'deactivate',
      'Confirmar Inativação',
      `Deseja inativar o fornecedor ${fornecedor.razao_social}?`,
      async () => {
        try {
          await deactivateFornecedor(fornecedor.id)
          showAlert('success', 'Sucesso', `Fornecedor ${fornecedor.razao_social} inativado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar fornecedor')
        }
      }
    )
  }

  const handleBlock = (fornecedor: Fornecedor) => {
    showAlert(
      'block',
      'Confirmar Bloqueio',
      `Deseja bloquear o fornecedor ${fornecedor.razao_social}?`,
      async () => {
        try {
          await blockFornecedor(fornecedor.id)
          showAlert('success', 'Sucesso', `Fornecedor ${fornecedor.razao_social} bloqueado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao bloquear fornecedor')
        }
      }
    )
  }

  const handleUnblock = (fornecedor: Fornecedor) => {
    showAlert(
      'unblock',
      'Confirmar Desbloqueio',
      `Deseja desbloquear o fornecedor ${fornecedor.razao_social}?`,
      async () => {
        try {
          await unblockFornecedor(fornecedor.id)
          showAlert('success', 'Sucesso', `Fornecedor ${fornecedor.razao_social} desbloqueado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao desbloquear fornecedor')
        }
      }
    )
  }

  const handleBulkActivate = (fornecedores: Fornecedor[]) => {
    showAlert(
      'bulkActivate',
      'Confirmar Ativação em Massa',
      `Deseja ativar ${fornecedores.length} fornecedor(es) selecionado(s)?`,
      async () => {
        try {
          const ids = fornecedores.map(f => f.id)
          await bulkActivate(ids)
          showAlert('success', 'Sucesso', `${fornecedores.length} fornecedor(es) ativado(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar fornecedores')
        }
      }
    )
  }

  const handleBulkDeactivate = (fornecedores: Fornecedor[]) => {
    showAlert(
      'bulkDeactivate',
      'Confirmar Inativação em Massa',
      `Deseja inativar ${fornecedores.length} fornecedor(es) selecionado(s)?`,
      async () => {
        try {
          const ids = fornecedores.map(f => f.id)
          await bulkDeactivate(ids)
          showAlert('success', 'Sucesso', `${fornecedores.length} fornecedor(es) inativado(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar fornecedores')
        }
      }
    )
  }

  const handleBulkBlock = (fornecedores: Fornecedor[]) => {
    showAlert(
      'bulkBlock',
      'Confirmar Bloqueio em Massa',
      `Deseja bloquear ${fornecedores.length} fornecedor(es) selecionado(s)?`,
      async () => {
        try {
          const ids = fornecedores.map(f => f.id)
          await bulkBlock(ids)
          showAlert('success', 'Sucesso', `${fornecedores.length} fornecedor(es) bloqueado(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao bloquear fornecedores')
        }
      }
    )
  }

  const handleBulkDelete = (fornecedores: Fornecedor[]) => {
    showAlert(
      'bulkDelete',
      'Confirmar Exclusão em Massa',
      `Tem certeza que deseja excluir ${fornecedores.length} fornecedor(es)? Esta ação não pode ser desfeita!`,
      async () => {
        try {
          const ids = fornecedores.map(f => f.id)
          await bulkDelete(ids)
          showAlert('success', 'Sucesso', `${fornecedores.length} fornecedor(es) excluído(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir fornecedores')
        }
      }
    )
  }

  const handleExportSelected = (exportData: any[], fileName: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Fornecedores')

      const fullFileName = `${fileName}.xlsx`
      XLSX.writeFile(wb, fullFileName)

      showAlert('success', 'Exportação Concluída', `${exportData.length} fornecedor(es) exportado(s) com sucesso!`)
    } catch (error: any) {
      showAlert('error', 'Erro na Exportação', error.message || 'Erro ao exportar fornecedores')
    }
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
                <FornecedorStatsComponent
                  key={`stats-${refreshKey}`}
                  stats={stats}
                  isLoading={isLoading}
                  onRefresh={refreshFornecedores}
                />
              </div>

              {/* Tabela com Filtros */}
              <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <FornecedoresDataTable
                  key={`table-${refreshKey}`}
                  data={fornecedores}
                  isLoading={isLoading}
                  onNew={handleNew}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onRefresh={refreshFornecedores}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  onBulkActivate={handleBulkActivate}
                  onBulkDeactivate={handleBulkDeactivate}
                  onBulkBlock={handleBulkBlock}
                  onBulkDelete={handleBulkDelete}
                  onExportSelected={handleExportSelected}
                />
              </div>

              {/* Formulário Modal */}
              <FornecedorForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                fornecedor={selectedFornecedor}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* AlertDialog Global */}
      <AlertDialog open={alertState.isOpen} onOpenChange={closeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertState.type === 'success' || alertState.type === 'error' ? (
              <AlertDialogAction onClick={closeAlert}>
                OK
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (alertState.onConfirm) {
                      alertState.onConfirm()
                    }
                    closeAlert()
                  }}
                >
                  Confirmar
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
