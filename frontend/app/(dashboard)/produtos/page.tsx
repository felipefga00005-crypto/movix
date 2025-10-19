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
import { productService } from '@/lib/services/product.service'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.list()
      setProducts(response.data)
    } catch (error) {
      toast.error('Erro ao carregar produtos')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      await productService.delete(id)
      toast.success('Produto excluído com sucesso')
      loadProducts()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir produto')
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
    },
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'ncm',
      header: 'NCM',
    },
    {
      accessorKey: 'unit',
      header: 'Unidade',
    },
    {
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ row }) =>
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.price),
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Estoque',
      cell: ({ row }) => row.original.stock_quantity || 0,
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/produtos/${row.original.id}/edit`)}>
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
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus produtos</p>
        </div>
        <Button onClick={() => router.push('/dashboard/produtos/new')}>
          <IconPlus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>Visualize e gerencie todos os seus produtos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Carregando...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Buscar por nome..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

