"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconPlus, IconUsers } from "@tabler/icons-react"

import { UsuarioStatsCards } from "@/components/cadastros/usuarios/usuario-stats-cards"
import { UsuarioTable } from "@/components/cadastros/usuarios/usuario-table"
import { UsuarioForm } from "@/components/cadastros/usuarios/usuario-form"
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest, ChangePasswordRequest } from "@/types/usuario"
import { usuariosAPI } from "@/lib/api/usuarios"

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showForm, setShowForm] = React.useState(false)
  const [editingUsuario, setEditingUsuario] = React.useState<Usuario | undefined>()

  // Carregar usuários
  React.useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    setIsLoading(true)
    try {
      const data = await usuariosAPI.getAll()
      setUsuarios(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      // TODO: Mostrar toast de erro
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUsuario = async (data: CreateUsuarioRequest) => {
    try {
      await usuariosAPI.create(data)
      await loadUsuarios()
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleUpdateUsuario = async (data: UpdateUsuarioRequest) => {
    if (!editingUsuario) return
    
    try {
      await usuariosAPI.update(editingUsuario.id, data)
      await loadUsuarios()
      setEditingUsuario(undefined)
      setShowForm(false)
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      // TODO: Mostrar toast de erro
      throw error
    }
  }

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setShowForm(true)
  }

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      return
    }

    try {
      await usuariosAPI.delete(usuario.id)
      await loadUsuarios()
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
      // TODO: Mostrar toast de erro
    }
  }

  const handleChangePassword = async (usuario: Usuario) => {
    const novaSenha = prompt(`Alterar senha do usuário: ${usuario.nome}\n\nDigite a nova senha:`)
    if (!novaSenha) return

    const confirmarSenha = prompt("Confirme a nova senha:")
    if (!confirmarSenha) return

    if (novaSenha !== confirmarSenha) {
      alert("Senhas não coincidem!")
      return
    }

    if (novaSenha.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres!")
      return
    }

    const changePasswordData: ChangePasswordRequest = {
      novaSenha,
      confirmarSenha
    }

    try {
      await usuariosAPI.changePassword(usuario.id, changePasswordData)
      alert("Senha alterada com sucesso!")
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      alert("Erro ao alterar senha. Tente novamente.")
      // TODO: Mostrar toast de erro
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingUsuario(undefined)
  }

  if (showForm) {
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
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">
                        {editingUsuario ? "Editar Usuário" : "Novo Usuário"}
                      </h1>
                      <p className="text-muted-foreground">
                        {editingUsuario 
                          ? "Atualize as informações do usuário" 
                          : "Cadastre um novo usuário no sistema"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <UsuarioForm
                    usuario={editingUsuario}
                    onSubmit={editingUsuario ? handleUpdateUsuario : handleCreateUsuario}
                    onCancel={handleCancelForm}
                    isLoading={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <IconUsers className="h-6 w-6" />
                      Usuários
                    </h1>
                    <p className="text-muted-foreground">
                      Gerencie os usuários e permissões do sistema
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Novo Usuário
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="px-4 lg:px-6">
                <UsuarioStatsCards usuarios={usuarios} isLoading={isLoading} />
              </div>

              {/* Table */}
              <UsuarioTable
                usuarios={usuarios}
                isLoading={isLoading}
                onEdit={handleEditUsuario}
                onDelete={handleDeleteUsuario}
                onChangePassword={handleChangePassword}
              />
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
