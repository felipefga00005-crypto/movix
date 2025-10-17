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
import { ClientesDataTable } from "@/components/cadastro/clientes/clientes-data-table"
import { ClienteStatsComponent } from "@/components/cadastro/clientes/cliente-stats"
import { ClienteForm } from "@/components/cadastro/clientes/cliente-form"
import { useClientes } from "@/hooks/useClientes"
import { clienteService } from "@/lib/services/cliente.service"
import type { Cliente } from "@/types/cliente"
import * as XLSX from 'xlsx'

type AlertType = 'delete' | 'activate' | 'deactivate' | 'bulkActivate' | 'bulkDeactivate' | 'bulkDelete' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function ClientesPage() {
  const router = useRouter()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  // Hook para gerenciar dados dos clientes
  const { clientes, isLoading, deleteCliente, refreshClientes } = useClientes()

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

  const handleDelete = (cliente: Cliente) => {
    showAlert(
      'delete',
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o cliente ${cliente.razao_social}?`,
      async () => {
        try {
          await deleteCliente(cliente.id!)
          showAlert('success', 'Sucesso', `Cliente ${cliente.razao_social} excluído com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir cliente')
        }
      }
    )
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    refreshClientes()
  }

  const handleActivate = (cliente: Cliente) => {
    showAlert(
      'activate',
      'Confirmar Ativação',
      `Deseja ativar o cliente ${cliente.razao_social}?`,
      async () => {
        try {
          await clienteService.update(cliente.id, { ...cliente, status: 'Ativo' })
          showAlert('success', 'Sucesso', `Cliente ${cliente.razao_social} ativado com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar cliente')
        }
      }
    )
  }

  const handleDeactivate = (cliente: Cliente) => {
    showAlert(
      'deactivate',
      'Confirmar Inativação',
      `Deseja inativar o cliente ${cliente.razao_social}?`,
      async () => {
        try {
          await clienteService.update(cliente.id, { ...cliente, status: 'Inativo' })
          showAlert('success', 'Sucesso', `Cliente ${cliente.razao_social} inativado com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar cliente')
        }
      }
    )
  }

  const handleBulkActivate = (clientes: Cliente[]) => {
    showAlert(
      'bulkActivate',
      'Confirmar Ativação em Massa',
      `Deseja ativar ${clientes.length} cliente(s) selecionado(s)?`,
      async () => {
        try {
          await Promise.all(
            clientes.map(cliente =>
              clienteService.update(cliente.id, { ...cliente, status: 'Ativo' })
            )
          )
          showAlert('success', 'Sucesso', `${clientes.length} cliente(s) ativado(s) com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar clientes')
        }
      }
    )
  }

  const handleBulkDeactivate = (clientes: Cliente[]) => {
    showAlert(
      'bulkDeactivate',
      'Confirmar Inativação em Massa',
      `Deseja inativar ${clientes.length} cliente(s) selecionado(s)?`,
      async () => {
        try {
          await Promise.all(
            clientes.map(cliente =>
              clienteService.update(cliente.id, { ...cliente, status: 'Inativo' })
            )
          )
          showAlert('success', 'Sucesso', `${clientes.length} cliente(s) inativado(s) com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar clientes')
        }
      }
    )
  }

  const handleBulkDelete = (clientes: Cliente[]) => {
    showAlert(
      'bulkDelete',
      'Confirmar Exclusão em Massa',
      `Tem certeza que deseja excluir ${clientes.length} cliente(s)? Esta ação não pode ser desfeita!`,
      async () => {
        try {
          await Promise.all(
            clientes.map(cliente => clienteService.delete(cliente.id))
          )
          showAlert('success', 'Sucesso', `${clientes.length} cliente(s) excluído(s) com sucesso!`)
          refreshClientes()
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir clientes')
        }
      }
    )
  }

  const handleExportSelected = (exportData: any[], fileName: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

      const fullFileName = `${fileName}.xlsx`
      XLSX.writeFile(wb, fullFileName)

      showAlert('success', 'Exportação Concluída', `${exportData.length} cliente(s) exportado(s) com sucesso!`)
    } catch (error: any) {
      showAlert('error', 'Erro na Exportação', error.message || 'Erro ao exportar clientes')
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
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onBulkActivate={handleBulkActivate}
                  onBulkDeactivate={handleBulkDeactivate}
                  onBulkDelete={handleBulkDelete}
                  onExportSelected={handleExportSelected}
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

