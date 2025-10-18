'use client'

/**
 * Página de Configuração da Empresa
 * Configurações fiscais e dados da empresa
 */

import { useState } from "react"
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
import { EmpresaForm } from "@/components/fiscal/empresa/empresa-form"
import { EmpresaStatsComponent } from "@/components/fiscal/empresa/empresa-stats"
import { useEmpresa } from "@/hooks/useEmpresa"
import type { Empresa } from "@/types/empresa"

type AlertType = 'save' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function EmpresaPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  const {
    empresa,
    loading,
    error,
    refetch,
  } = useEmpresa({ key: refreshKey })

  // Handlers para ações
  const handleSaveEmpresa = (empresaData: Empresa) => {
    setAlertState({
      isOpen: true,
      type: 'save',
      title: 'Salvar Configurações',
      description: 'Deseja salvar as configurações da empresa?',
      onConfirm: () => confirmSaveEmpresa(empresaData),
    })
  }

  // Confirmações das ações
  const confirmSaveEmpresa = async (empresaData: Empresa) => {
    try {
      // TODO: Implementar salvamento
      console.log('Salvando empresa:', empresaData)
      showSuccessAlert('Configurações da empresa salvas com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao salvar configurações da empresa')
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
                    <h1 className="text-2xl font-bold tracking-tight">Configuração da Empresa</h1>
                    <p className="text-muted-foreground">
                      Configure os dados fiscais e informações da empresa
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <EmpresaStatsComponent empresa={empresa} />
              </div>

              {/* Form */}
              <div className="px-4 lg:px-6">
                <EmpresaForm
                  empresa={empresa}
                  loading={loading}
                  onSave={handleSaveEmpresa}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

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
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
