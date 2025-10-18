'use client'

/**
 * Página de Cadastro de Produtos
 * Gerenciamento completo de produtos com integração ao backend
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
import { ProdutosDataTable } from "@/components/cadastro/produtos/produtos-data-table"
import { ProdutoStatsComponent } from "@/components/cadastro/produtos/produto-stats"
import { ProdutoForm } from "@/components/cadastro/produtos/produto-form"
import { useProdutos } from "@/hooks/useProdutos"
import { produtoService } from "@/lib/services/produto.service"
import type { Produto } from "@/types/produto"
import * as XLSX from 'xlsx'

type AlertType = 'delete' | 'activate' | 'deactivate' | 'bulkActivate' | 'bulkDeactivate' | 'bulkDelete' | 'bulkUpdatePrecos' | 'success' | 'error'

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  description: string
  onConfirm?: () => void
}

export default function ProdutosPage() {
  const router = useRouter()
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Estado para AlertDialog
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'success',
    title: '',
    description: '',
  })

  // Hook para gerenciar dados dos produtos
  const {
    produtos,
    isLoading,
    deleteProduto,
    activateProduto,
    deactivateProduto,
    setDestaque,
    setPromocao,
    updateEstoque,
    updatePrecos,
    duplicarProduto,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
    bulkUpdatePrecos,
    refreshProdutos
  } = useProdutos()

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
    setSelectedProduto(null)
    setIsFormOpen(true)
  }

  const handleEdit = (produto: Produto) => {
    setSelectedProduto(produto)
    setIsFormOpen(true)
  }

  const handleView = (produto: Produto) => {
    router.push(`/cadastro/produtos/${produto.id}`)
  }

  const handleDelete = (produto: Produto) => {
    showAlert(
      'delete',
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o produto ${produto.nome}?`,
      async () => {
        try {
          await deleteProduto(produto.id!)
          showAlert('success', 'Sucesso', `Produto ${produto.nome} excluído com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir produto')
        }
      }
    )
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    refreshProdutos()
  }

  const handleActivate = (produto: Produto) => {
    showAlert(
      'activate',
      'Confirmar Ativação',
      `Deseja ativar o produto ${produto.nome}?`,
      async () => {
        try {
          await activateProduto(produto.id)
          showAlert('success', 'Sucesso', `Produto ${produto.nome} ativado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar produto')
        }
      }
    )
  }

  const handleDeactivate = (produto: Produto) => {
    showAlert(
      'deactivate',
      'Confirmar Inativação',
      `Deseja inativar o produto ${produto.nome}?`,
      async () => {
        try {
          await deactivateProduto(produto.id)
          showAlert('success', 'Sucesso', `Produto ${produto.nome} inativado com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar produto')
        }
      }
    )
  }

  const handleSetDestaque = async (produto: Produto, destaque: boolean) => {
    try {
      await setDestaque(produto.id, destaque)
      showAlert('success', 'Sucesso', `Produto ${destaque ? 'marcado como' : 'removido do'} destaque!`)
    } catch (error: any) {
      showAlert('error', 'Erro', error.message || 'Erro ao alterar destaque')
    }
  }

  const handleSetPromocao = async (produto: Produto, promocao: boolean) => {
    try {
      await setPromocao(produto.id, promocao)
      showAlert('success', 'Sucesso', `Produto ${promocao ? 'colocado em' : 'removido da'} promoção!`)
    } catch (error: any) {
      showAlert('error', 'Erro', error.message || 'Erro ao alterar promoção')
    }
  }

  const handleUpdateEstoque = async (produto: Produto) => {
    // Aqui você pode abrir um modal específico para atualizar estoque
    // Por simplicidade, vou apenas mostrar um alert
    showAlert('success', 'Info', 'Funcionalidade de atualização de estoque será implementada em breve')
  }

  const handleUpdatePrecos = async (produto: Produto) => {
    // Aqui você pode abrir um modal específico para atualizar preços
    // Por simplicidade, vou apenas mostrar um alert
    showAlert('success', 'Info', 'Funcionalidade de atualização de preços será implementada em breve')
  }

  const handleDuplicar = async (produto: Produto) => {
    try {
      await duplicarProduto(produto.id, {
        nome: `${produto.nome} (Cópia)`,
        codigo: undefined // Será gerado automaticamente
      })
      showAlert('success', 'Sucesso', `Produto ${produto.nome} duplicado com sucesso!`)
    } catch (error: any) {
      showAlert('error', 'Erro', error.message || 'Erro ao duplicar produto')
    }
  }

  const handleBulkActivate = (produtos: Produto[]) => {
    showAlert(
      'bulkActivate',
      'Confirmar Ativação em Massa',
      `Deseja ativar ${produtos.length} produto(s) selecionado(s)?`,
      async () => {
        try {
          const ids = produtos.map(p => p.id)
          await bulkActivate(ids)
          showAlert('success', 'Sucesso', `${produtos.length} produto(s) ativado(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao ativar produtos')
        }
      }
    )
  }

  const handleBulkDeactivate = (produtos: Produto[]) => {
    showAlert(
      'bulkDeactivate',
      'Confirmar Inativação em Massa',
      `Deseja inativar ${produtos.length} produto(s) selecionado(s)?`,
      async () => {
        try {
          const ids = produtos.map(p => p.id)
          await bulkDeactivate(ids)
          showAlert('success', 'Sucesso', `${produtos.length} produto(s) inativado(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao inativar produtos')
        }
      }
    )
  }

  const handleBulkDelete = (produtos: Produto[]) => {
    showAlert(
      'bulkDelete',
      'Confirmar Exclusão em Massa',
      `Tem certeza que deseja excluir ${produtos.length} produto(s)? Esta ação não pode ser desfeita!`,
      async () => {
        try {
          const ids = produtos.map(p => p.id)
          await bulkDelete(ids)
          showAlert('success', 'Sucesso', `${produtos.length} produto(s) excluído(s) com sucesso!`)
        } catch (error: any) {
          showAlert('error', 'Erro', error.message || 'Erro ao excluir produtos')
        }
      }
    )
  }

  const handleBulkUpdatePrecos = (produtos: Produto[]) => {
    showAlert(
      'bulkUpdatePrecos',
      'Atualizar Preços em Massa',
      `Funcionalidade de atualização de preços em massa será implementada em breve para ${produtos.length} produto(s).`,
      () => {
        // Implementar modal de atualização de preços em massa
      }
    )
  }

  const handleExportSelected = (exportData: any[], fileName: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Produtos')

      const fullFileName = `${fileName}.xlsx`
      XLSX.writeFile(wb, fullFileName)

      showAlert('success', 'Exportação Concluída', `${exportData.length} produto(s) exportado(s) com sucesso!`)
    } catch (error: any) {
      showAlert('error', 'Erro na Exportação', error.message || 'Erro ao exportar produtos')
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
                <ProdutoStatsComponent key={`stats-${refreshKey}`} />
              </div>

              {/* Tabela com Filtros */}
              <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <ProdutosDataTable
                  key={`table-${refreshKey}`}
                  data={produtos}
                  isLoading={isLoading}
                  onNew={handleNew}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                  onRefresh={refreshProdutos}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onSetDestaque={handleSetDestaque}
                  onSetPromocao={handleSetPromocao}
                  onUpdateEstoque={handleUpdateEstoque}
                  onUpdatePrecos={handleUpdatePrecos}
                  onDuplicar={handleDuplicar}
                  onBulkActivate={handleBulkActivate}
                  onBulkDeactivate={handleBulkDeactivate}
                  onBulkDelete={handleBulkDelete}
                  onBulkUpdatePrecos={handleBulkUpdatePrecos}
                  onExportSelected={handleExportSelected}
                />
              </div>

              {/* Formulário Modal */}
              <ProdutoForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                produto={selectedProduto}
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
