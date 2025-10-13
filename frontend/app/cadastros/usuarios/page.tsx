"use client"

import { useState } from "react"
import { AppLayout } from "@/components/shared/app-layout"
import { EmptyState } from "@/components/shared/empty-state"
import { UsuariosDataTable } from "@/components/cadastros/usuarios/usuarios-data-table"
import { UsuariosFilters, type UsuarioFilters } from "@/components/cadastros/usuarios/usuarios-filters"
import { UsuarioFormDialog } from "@/components/cadastros/usuarios/usuario-form-dialog"
import { Button } from "@/components/ui/button"
import { IconPlus, IconUserPlus } from "@tabler/icons-react"

import data from "./data.json"

export default function UsuariosPage() {
  const [filters, setFilters] = useState<UsuarioFilters>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<any | null>(null)

  const handleFilter = (newFilters: UsuarioFilters) => {
    setFilters(newFilters)
    // TODO: Integrar com API quando disponível
    console.log("Filtros aplicados:", newFilters)
  }

  const handleNewUsuario = () => {
    setSelectedUsuario(null)
    setDialogOpen(true)
  }

  const handleEditUsuario = (usuario: any) => {
    setSelectedUsuario(usuario)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    // TODO: Refresh data
    console.log("Usuário salvo com sucesso!")
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-3 py-4">
        {data.length === 0 && (
          <EmptyState
            title="Nenhum usuário cadastrado"
            description="Comece adicionando seu primeiro usuário"
            actionLabel="Adicionar Usuário"
            onAction={handleNewUsuario}
            icon={<IconUserPlus className="h-12 w-12" />}
          />
        )}

        {data.length > 0 && (
          <>
            {/* Filtros Avançados */}
            <div className="px-4 lg:px-6">
              <UsuariosFilters onFilter={handleFilter} />
            </div>

            {/* Tabela */}
            <UsuariosDataTable
              data={data}
              onEdit={handleEditUsuario}
              actionButtons={
                <Button size="sm" onClick={handleNewUsuario}>
                  <IconPlus />
                  Novo Usuário
                </Button>
              }
            />
          </>
        )}
      </div>

      <UsuarioFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        usuario={selectedUsuario}
        onSuccess={handleDialogSuccess}
      />
    </AppLayout>
  )
}
