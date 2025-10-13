"use client"

import * as React from "react"
import { IconDotsVertical, IconEdit, IconTrash, IconEye, IconUserCheck, IconUserX, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClientes } from "@/hooks/cadastros/use-clientes"
import type { Cliente } from "@/types"
import Link from "next/link"

interface ClientesTableActionsProps {
  cliente: Cliente
  onEdit: (cliente: Cliente) => void
  onStatusChange?: () => void
}

export function ClientesTableActions({ cliente, onEdit, onStatusChange }: ClientesTableActionsProps) {
  const { deleteCliente, updateCliente } = useClientes({ autoFetch: false })
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteCliente(cliente.id)
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
      alert("Erro ao deletar cliente")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async () => {
    const newStatus = cliente.status === "Ativo" ? "Inativo" : "Ativo"
    const action = newStatus === "Ativo" ? "ativar" : "desativar"

    if (!confirm(`Tem certeza que deseja ${action} o cliente ${cliente.nome}?`)) {
      return
    }

    setIsUpdatingStatus(true)
    try {
      await updateCliente(cliente.id, { status: newStatus })
      // Chamar callback para atualizar a lista
      onStatusChange?.()
    } catch (error) {
      console.error(`Erro ao ${action} cliente:`, error)
      alert(`Erro ao ${action} cliente`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const isLoading = isDeleting || isUpdatingStatus

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
          disabled={isLoading}
        >
          <IconDotsVertical />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/cadastros/clientes/${cliente.id}`}>
            <IconEye className="mr-2 h-4 w-4" />
            Visualizar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(cliente)} disabled={isLoading}>
          <IconEdit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleToggleStatus}
          disabled={isUpdatingStatus}
          className={cliente.status === "Ativo" ? "text-orange-600 focus:text-orange-600" : "text-green-600 focus:text-green-600"}
        >
          {isUpdatingStatus ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : cliente.status === "Ativo" ? (
            <IconUserX className="mr-2 h-4 w-4" />
          ) : (
            <IconUserCheck className="mr-2 h-4 w-4" />
          )}
          {isUpdatingStatus
            ? "Atualizando..."
            : cliente.status === "Ativo"
              ? "Desativar"
              : "Ativar"
          }
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive focus:text-destructive"
        >
          {isDeleting ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconTrash className="mr-2 h-4 w-4" />
          )}
          {isDeleting ? "Excluindo..." : "Excluir"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

