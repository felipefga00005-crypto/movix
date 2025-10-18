'use client'

/**
 * Página de Certificado Digital
 * Gerenciamento do certificado digital A1
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
import { CertificadoForm } from "@/components/fiscal/certificado/certificado-form"
import { CertificadoStatsComponent } from "@/components/fiscal/certificado/certificado-stats"
import { CertificadoValidationComponent } from "@/components/fiscal/certificado/certificado-validation"
import { useCertificado } from "@/hooks/useCertificado"
import { fiscalService } from "@/lib/services/fiscal"

type AlertType = 'upload' | 'validate' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function CertificadoPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  const {
    certificado,
    loading,
    error,
    refetch,
  } = useCertificado({ key: refreshKey })

  // Handlers para ações
  const handleUploadCertificado = (certificadoBase64: string, senha: string) => {
    setAlertState({
      isOpen: true,
      type: 'upload',
      title: 'Upload do Certificado',
      description: 'Deseja fazer upload do certificado digital?',
      onConfirm: () => confirmUploadCertificado(certificadoBase64, senha),
    })
  }

  const handleValidateCertificado = () => {
    setAlertState({
      isOpen: true,
      type: 'validate',
      title: 'Validar Certificado',
      description: 'Deseja validar o certificado digital atual?',
      onConfirm: () => confirmValidateCertificado(),
    })
  }

  // Confirmações das ações
  const confirmUploadCertificado = async (certificadoBase64: string, senha: string) => {
    try {
      // TODO: Implementar upload
      console.log('Upload certificado')
      showSuccessAlert('Certificado digital enviado com sucesso!')
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      showErrorAlert('Erro ao fazer upload do certificado')
    }
  }

  const confirmValidateCertificado = async () => {
    try {
      if (!certificado) {
        showErrorAlert('Nenhum certificado configurado')
        return
      }

      const result = await fiscalService.validarCertificado({
        certificadoBase64: certificado.certificadoBase64,
        senha: certificado.senha,
      })

      if (result.valido) {
        showSuccessAlert('Certificado digital válido!')
      } else {
        showErrorAlert('Certificado digital inválido: ' + result.erros.join(', '))
      }
    } catch (error) {
      showErrorAlert('Erro ao validar certificado')
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
                    <h1 className="text-2xl font-bold tracking-tight">Certificado Digital</h1>
                    <p className="text-muted-foreground">
                      Gerencie o certificado digital A1 para emissão de documentos fiscais
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-4 lg:px-6">
                <CertificadoStatsComponent certificado={certificado} />
              </div>

              {/* Validation */}
              <div className="px-4 lg:px-6">
                <CertificadoValidationComponent
                  certificado={certificado}
                  onValidate={handleValidateCertificado}
                />
              </div>

              {/* Form */}
              <div className="px-4 lg:px-6">
                <CertificadoForm
                  certificado={certificado}
                  loading={loading}
                  onUpload={handleUploadCertificado}
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
