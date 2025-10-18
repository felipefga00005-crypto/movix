'use client'

/**
 * Página de Detalhes do Produto
 * Visualização detalhada de um produto específico com histórico de movimentações
 */

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconEdit, IconTrash, IconPackage, IconTrendingUp, IconTrendingDown, IconStar, IconTag, IconCalculator, IconHistory } from "@tabler/icons-react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { produtoService } from "@/lib/services/produto.service"
import { useProdutos } from "@/hooks/useProdutos"
import type { Produto, MovimentacaoEstoque } from "@/types/produto"
import { toast } from "sonner"

export default function ProdutoDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMovimentacoes, setIsLoadingMovimentacoes] = useState(false)
  const { getMovimentacoes } = useProdutos()

  const produtoId = params.id as string

  useEffect(() => {
    if (produtoId) {
      loadProduto()
      loadMovimentacoes()
    }
  }, [produtoId])

  const loadProduto = async () => {
    try {
      setIsLoading(true)
      const data = await produtoService.getById(parseInt(produtoId))
      setProduto(data)
    } catch (error: any) {
      console.error('Erro ao carregar produto:', error)
      toast.error('Erro ao carregar dados do produto')
      router.push('/cadastro/produtos')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMovimentacoes = async () => {
    try {
      setIsLoadingMovimentacoes(true)
      const data = await getMovimentacoes(parseInt(produtoId))
      setMovimentacoes(data)
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error)
    } finally {
      setIsLoadingMovimentacoes(false)
    }
  }

  const handleEdit = () => {
    router.push(`/cadastro/produtos?edit=${produtoId}`)
  }

  const handleDelete = async () => {
    if (!produto) return
    
    if (confirm(`Tem certeza que deseja excluir o produto ${produto.nome}?`)) {
      try {
        await produtoService.delete(produto.id)
        toast.success('Produto excluído com sucesso')
        router.push('/cadastro/produtos')
      } catch (error: any) {
        toast.error('Erro ao excluir produto')
      }
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusColor = (ativo: boolean): "default" | "secondary" => {
    return ativo ? 'default' : 'secondary'
  }

  const getEstoqueStatus = (produto: Produto): { status: string, color: string } => {
    if (produto.estoque <= 0) {
      return { status: 'Sem Estoque', color: 'text-red-600' }
    } else if (produto.estoque_minimo && produto.estoque <= produto.estoque_minimo) {
      return { status: 'Baixo Estoque', color: 'text-yellow-600' }
    } else {
      return { status: 'Normal', color: 'text-green-600' }
    }
  }

  const getTipoMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return <IconTrendingUp className="h-4 w-4 text-green-600" />
      case 'SAIDA':
        return <IconTrendingDown className="h-4 w-4 text-red-600" />
      case 'AJUSTE':
        return <IconCalculator className="h-4 w-4 text-blue-600" />
      default:
        return <IconHistory className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
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
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados do produto...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!produto) {
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
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
              <p className="text-muted-foreground mb-4">O produto solicitado não foi encontrado.</p>
              <Button onClick={() => router.push('/cadastro/produtos')}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Produtos
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const estoqueStatus = getEstoqueStatus(produto)

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
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/cadastro/produtos')}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {produto.nome}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusColor(produto.ativo)}>
                    {produto.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {produto.categoria && (
                    <Badge variant="outline">
                      {produto.categoria}
                    </Badge>
                  )}
                  {produto.marca && (
                    <Badge variant="secondary">
                      {produto.marca}
                    </Badge>
                  )}
                  {produto.destaque && (
                    <Badge variant="outline">
                      <IconStar className="h-3 w-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  {produto.promocao && (
                    <Badge variant="outline">
                      <IconTag className="h-3 w-3 mr-1" />
                      Promoção
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid gap-6">
            {/* Informações Básicas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Dados Gerais */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconPackage className="h-5 w-5" />
                    Dados Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Código</p>
                    <p className="font-mono">{produto.codigo}</p>
                  </div>
                  {produto.codigo_barras && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Código de Barras</p>
                      <p className="font-mono">{produto.codigo_barras}</p>
                    </div>
                  )}
                  {produto.sku && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p className="font-mono">{produto.sku}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unidade</p>
                    <p>{produto.unidade_medida}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Preços */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconCalculator className="h-5 w-5" />
                    Preços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preço de Custo</p>
                    <p className="font-medium">{formatCurrency(produto.preco_custo)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preço de Venda</p>
                    <p className="font-medium text-green-600">{formatCurrency(produto.preco)}</p>
                  </div>
                  {produto.preco_promocional && produto.preco_promocional > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Preço Promocional</p>
                      <p className="font-medium text-orange-600">{formatCurrency(produto.preco_promocional)}</p>
                    </div>
                  )}
                  {produto.margem_lucro && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Margem de Lucro</p>
                      <p className="font-medium">{produto.margem_lucro.toFixed(1)}%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estoque */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconPackage className="h-5 w-5" />
                    Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estoque Atual</p>
                    <p className={`font-medium ${estoqueStatus.color}`}>
                      {produto.estoque} {produto.unidade_medida}
                    </p>
                    <p className="text-xs text-muted-foreground">{estoqueStatus.status}</p>
                  </div>
                  {produto.estoque_minimo && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estoque Mínimo</p>
                      <p>{produto.estoque_minimo} {produto.unidade_medida}</p>
                    </div>
                  )}
                  {produto.estoque_maximo && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estoque Máximo</p>
                      <p>{produto.estoque_maximo} {produto.unidade_medida}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fornecedor */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconPackage className="h-5 w-5" />
                    Fornecedor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {produto.fornecedor_principal ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fornecedor Principal</p>
                      <p>{produto.fornecedor_principal}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum fornecedor cadastrado</p>
                  )}
                  {produto.codigo_fornecedor && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Código no Fornecedor</p>
                      <p className="font-mono">{produto.codigo_fornecedor}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs com informações detalhadas */}
            <Tabs defaultValue="detalhes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="fiscal">Dados Fiscais</TabsTrigger>
                <TabsTrigger value="dimensoes">Dimensões</TabsTrigger>
                <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {produto.descricao && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{produto.descricao}</p>
                      </CardContent>
                    </Card>
                  )}
                  {produto.observacoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{produto.observacoes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Fiscais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {produto.ncm && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">NCM</p>
                          <p>{produto.ncm}</p>
                        </div>
                      )}
                      {produto.cest && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CEST</p>
                          <p>{produto.cest}</p>
                        </div>
                      )}
                      {produto.origem !== undefined && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Origem</p>
                          <p>{produto.origem} - {produto.origem === 0 ? 'Nacional' : 'Estrangeira'}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dimensoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões e Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {produto.peso_bruto && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peso Bruto</p>
                          <p>{produto.peso_bruto} kg</p>
                        </div>
                      )}
                      {produto.peso_liquido && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peso Líquido</p>
                          <p>{produto.peso_liquido} kg</p>
                        </div>
                      )}
                      {produto.altura && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Altura</p>
                          <p>{produto.altura} cm</p>
                        </div>
                      )}
                      {produto.largura && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Largura</p>
                          <p>{produto.largura} cm</p>
                        </div>
                      )}
                      {produto.profundidade && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Profundidade</p>
                          <p>{produto.profundidade} cm</p>
                        </div>
                      )}
                      {produto.volume && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Volume</p>
                          <p>{produto.volume} m³</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="movimentacoes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconHistory className="h-5 w-5" />
                      Histórico de Movimentações
                    </CardTitle>
                    <CardDescription>
                      Últimas movimentações de estoque do produto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMovimentacoes ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Carregando movimentações...</p>
                      </div>
                    ) : movimentacoes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Estoque Anterior</TableHead>
                            <TableHead>Estoque Atual</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Data</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {movimentacoes.slice(0, 10).map((mov) => (
                            <TableRow key={mov.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTipoMovimentacaoIcon(mov.tipo)}
                                  {mov.tipo}
                                </div>
                              </TableCell>
                              <TableCell className="font-mono">
                                {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SAIDA' ? '-' : ''}
                                {mov.quantidade}
                              </TableCell>
                              <TableCell className="font-mono">{mov.quantidade_anterior}</TableCell>
                              <TableCell className="font-mono">{mov.quantidade_atual}</TableCell>
                              <TableCell>{mov.motivo || '-'}</TableCell>
                              <TableCell>{formatDate(mov.data_movimentacao)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <IconHistory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma movimentação encontrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
