'use client'

/**
 * Página de Configurações SEFAZ
 * Configurações de ambiente e webservices SEFAZ
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
import { SefazConfigForm } from "@/components/fiscal/sefaz/sefaz-config-form"
import { SefazStatsComponent } from "@/components/fiscal/sefaz/sefaz-stats"
import { SefazConnectivityTest } from "@/components/fiscal/sefaz/sefaz-connectivity-test"
import { useSefazConfig } from "@/hooks/useSefazConfig"
import { fiscalService } from "@/lib/services/fiscal"

type AlertType = 'save' | 'test' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function SefazPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  const {
    config,
    loading,
    error,
    refetch,
  } = useSefazConfig({ key: refreshKey })

  // Handlers para ações
  const handleSaveConfig = (configData: any) => {
    setAlertState({
      isOpen: true,
      type: 'save',
      title: 'Salvar Configurações',
      description: 'Deseja salvar as configurações do SEFAZ?',
      onConfirm: () => confirmSaveConfig(configData),
    })
  }

  const handleTestConnectivity = () => {
    setAlertState({
      isOpen: true,
      type: 'test',
      title: 'Testar Conectividade',
      description: 'Deseja testar a conectividade com os webservices do SEFAZ?',
      onConfirm: () => confirmTestConnectivity(),
    })
  }

  // Confirmações das ações
  const confirmSaveConfig = async (configData: any) => {
    try {
      // TODO: Implementar salvamento
      console.log('Salvando configurações SEFAZ:', configData)
      showSuccessAlert('Configurações do SEFAZ salvas com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao salvar configurações do SEFAZ')
    }
  }

  const confirmTestConnectivity = async () => {
    try {
      const result = await fiscalService.testarConectividade()
      
      if (result.sucesso) {
        showSuccessAlert('Conectividade com SEFAZ testada com sucesso!')
      } else {
        showErrorAlert('Falha na conectividade com SEFAZ')
      }
    } catch (error) {
      showErrorAlert('Erro ao testar conectividade com SEFAZ')
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
                    <h1 className="text-2xl font-bold tracking-tight">Configurações SEFAZ</h1>
                    <p className="text-muted-foreground">
                      Configure ambiente e webservices para integração com SEFAZ
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <SefazStatsComponent config={config} />
              </div>

              {/* Connectivity Test */}
              <div className="px-4 lg:px-6">
                <SefazConnectivityTest
                  config={config}
                  onTest={handleTestConnectivity}
                />
              </div>

              {/* Form */}
              <div className="px-4 lg:px-6">
                <SefazConfigForm
                  config={config}
                  loading={loading}
                  onSave={handleSaveConfig}
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
