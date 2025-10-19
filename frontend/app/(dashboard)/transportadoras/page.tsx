'use client'

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { carrierService } from '@/lib/services/carrier.service'
import type { Carrier } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CarriersPage() {
  const router = useRouter()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCarriers()
  }, [])

  const loadCarriers = async () => {
    try {
      setLoading(true)
      const response = await carrierService.list()
      setCarriers(response.data)
    } catch (error) {
      toast.error('Erro ao carregar transportadoras')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transportadora?')) return

    try {
      await carrierService.delete(id)
      toast.success('Transportadora excluída com sucesso')
      loadCarriers()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir transportadora')
    }
  }

  const columns: ColumnDef<Carrier>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'document',
      header: 'CNPJ',
      cell: ({ row }) => {
        const doc = row.original.document
        return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
      },
    },
    {
      accessorKey: 'state_registration',
      header: 'Inscrição Estadual',
      cell: ({ row }) => row.original.state_registration || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/transportadoras/${row.original.id}/edit`)}>
              <IconPencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transportadoras</h1>
          <p className="text-muted-foreground">Gerencie suas transportadoras</p>
        </div>
        <Button onClick={() => router.push('/dashboard/transportadoras/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nova Transportadora
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transportadoras</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas transportadoras</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={carriers} searchKey="name" searchPlaceholder="Buscar por nome..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

