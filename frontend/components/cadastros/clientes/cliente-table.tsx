"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { 
  IconDotsVertical, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconPhone,
  IconMail,
  IconMapPin
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table"
import { Cliente, ClienteStatus } from "@/types/cliente"
import { clienteUtils } from "@/lib/api/clientes"

interface ClienteTableProps {
  data: Cliente[]
  isLoading?: boolean
  onEdit?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onView?: (cliente: Cliente) => void
}

// Componente para status badge
function StatusBadge({ status }: { status: string }) {
  const variant = status === ClienteStatus.ATIVO 
    ? "default" 
    : status === ClienteStatus.INATIVO 
    ? "destructive" 
    : "secondary"
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  )
}

// Componente para ações da linha
function RowActions({ 
  cliente, 
  onEdit, 
  onDelete, 
  onView 
}: { 
  cliente: Cliente
  onEdit?: (cliente: Cliente) => void
  onDelete?: (cliente: Cliente) => void
  onView?: (cliente: Cliente) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(cliente)}>
            <IconEye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(cliente)}>
            <IconEdit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {onDelete && (
          <DropdownMenuItem 
            onClick={() => onDelete(cliente)}
            className="text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ClienteTable({ 
  data, 
  isLoading = false, 
  onEdit, 
  onDelete, 
  onView 
}: ClienteTableProps) {
  
  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "codigo",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue("codigo")}
        </div>
      ),
    },
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <div className="flex flex-col">
            <div className="font-medium">{cliente.nome}</div>
            {cliente.nomeFantasia && (
              <div className="text-sm text-muted-foreground">
                {cliente.nomeFantasia}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "cpf",
      header: "CPF/CNPJ",
      cell: ({ row }) => {
        const cpf = row.getValue("cpf") as string
        const documentType = clienteUtils.getDocumentType(cpf)
        const formatted = documentType === 'CPF' 
          ? clienteUtils.formatCPF(cpf)
          : documentType === 'CNPJ'
          ? clienteUtils.formatCNPJ(cpf)
          : cpf
        
        return (
          <div className="font-mono text-sm">
            {formatted}
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => {
        const cliente = row.original
        return (
          <div className="flex flex-col gap-1">
            {cliente.email && (
              <div className="flex items-center gap-1 text-sm">
                <IconMail className="h-3 w-3" />
                {cliente.email}
              </div>
            )}
            {cliente.telefoneFixo && (
              <div className="flex items-center gap-1 text-sm">
                <IconPhone className="h-3 w-3" />
                {clienteUtils.formatTelefone(cliente.telefoneFixo)}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "cidade",
      header: "Localização",
      cell: ({ row }) => {
        const cliente = row.original
        if (!cliente.cidade && !cliente.estado) return "-"
        
        return (
          <div className="flex items-center gap-1 text-sm">
            <IconMapPin className="h-3 w-3" />
            <span>
              {cliente.cidade}
              {cliente.cidade && cliente.estado && ", "}
              {cliente.estado}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "tipoContato",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("tipoContato") as string
        return (
          <Badge variant="outline" className="capitalize">
            {tipo || "Cliente"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return <StatusBadge status={status} />
      },
    },
    {
      accessorKey: "dataCadastro",
      header: "Cadastro",
      cell: ({ row }) => {
        const data = row.getValue("dataCadastro") as string
        return (
          <div className="text-sm">
            {new Date(data).toLocaleDateString('pt-BR')}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <RowActions
          cliente={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando clientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <DataTable 
        data={data} 
        columns={columns}
        searchKey="nome"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  )
}
