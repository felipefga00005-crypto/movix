'use client'

import { useEffect, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { IconPlus, IconDownload, IconCheck, IconX, IconFileText } from '@tabler/icons-react'
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
import { nfeService } from '@/lib/services/nfe.service'
import type { NFe } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const statusColors = {
  draft: 'bg-gray-500',
  authorized: 'bg-green-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-yellow-500',
}

const statusLabels = {
  draft: 'Rascunho',
  authorized: 'Autorizada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
}

export default function NFesPage() {
  const router = useRouter()
  const [nfes, setNfes] = useState<NFe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNFes()
  }, [])

  const loadNFes = async () => {
    try {
      setLoading(true)
      const response = await nfeService.list()
      setNfes(response.data)
    } catch (error) {
      toast.error('Erro ao carregar NFes')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthorize = async (id: string) => {
    try {
      await nfeService.authorize(id)
      toast.success('NFe autorizada com sucesso')
      loadNFes()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao autorizar NFe')
    }
  }

  const handleDownloadXML = async (id: string) => {
    try {
      await nfeService.downloadXML(id)
      toast.success('XML baixado com sucesso')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar XML')
    }
  }

  const columns: ColumnDef<NFe>[] = [
    {
      accessorKey: 'number',
      header: 'Número',
      cell: ({ row }) => `${row.original.number}/${row.original.series}`,
    },
    {
      accessorKey: 'issue_date',
      header: 'Data Emissão',
      cell: ({ row }) => new Date(row.original.issue_date).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'customer',
      header: 'Cliente',
      cell: ({ row }) => row.original.customer?.name || '-',
    },
    {
      accessorKey: 'totals.nfe_total',
      header: 'Valor Total',
      cell: ({ row }) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.totals.nfe_total),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusColors[row.original.status]}>
          {statusLabels[row.original.status]}
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/nfes/${row.original.id}`)}>
              <IconFileText className="mr-2 h-4 w-4" />
              Ver Detalhes
            </DropdownMenuItem>
            {row.original.status === 'draft' && (
              <DropdownMenuItem onClick={() => handleAuthorize(row.original.id)}>
                <IconCheck className="mr-2 h-4 w-4" />
                Autorizar
              </DropdownMenuItem>
            )}
            {row.original.status === 'authorized' && (
              <>
                <DropdownMenuItem onClick={() => handleDownloadXML(row.original.id)}>
                  <IconDownload className="mr-2 h-4 w-4" />
                  Baixar XML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/nfes/${row.original.id}/cancel`)}>
                  <IconX className="mr-2 h-4 w-4" />
                  Cancelar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notas Fiscais Eletrônicas</h1>
          <p className="text-muted-foreground">Gerencie suas NFes</p>
        </div>
        <Button onClick={() => router.push('/dashboard/nfes/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nova NFe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de NFes</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas notas fiscais</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={nfes} searchKey="number" searchPlaceholder="Buscar por número..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

