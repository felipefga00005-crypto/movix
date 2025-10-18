'use client'

/**
 * Página de Detalhes do Fornecedor
 * Visualização detalhada de um fornecedor específico
 */

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconEdit, IconTrash, IconBuilding, IconMail, IconPhone, IconMapPin, IconCreditCard, IconCalendar, IconFileText } from "@tabler/icons-react"
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
import { fornecedorService } from "@/lib/services/fornecedor.service"
import type { Fornecedor } from "@/types/fornecedor"
import { toast } from "sonner"

export default function FornecedorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fornecedorId = params.id as string

  useEffect(() => {
    if (fornecedorId) {
      loadFornecedor()
    }
  }, [fornecedorId])

  const loadFornecedor = async () => {
    try {
      setIsLoading(true)
      const data = await fornecedorService.getById(parseInt(fornecedorId))
      setFornecedor(data)
    } catch (error: any) {
      console.error('Erro ao carregar fornecedor:', error)
      toast.error('Erro ao carregar dados do fornecedor')
      router.push('/cadastro/fornecedores')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/cadastro/fornecedores?edit=${fornecedorId}`)
  }

  const handleDelete = async () => {
    if (!fornecedor) return
    
    if (confirm(`Tem certeza que deseja excluir o fornecedor ${fornecedor.razao_social}?`)) {
      try {
        await fornecedorService.delete(fornecedor.id)
        toast.success('Fornecedor excluído com sucesso')
        router.push('/cadastro/fornecedores')
      } catch (error: any) {
        toast.error('Erro ao excluir fornecedor')
      }
    }
  }

  const formatCpfCnpj = (value: string): string => {
    if (!value) return ''
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'default'
      case 'inativo':
        return 'secondary'
      case 'bloqueado':
        return 'destructive'
      case 'pendente':
        return 'outline'
      default:
        return 'outline'
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
              <p className="text-muted-foreground">Carregando dados do fornecedor...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!fornecedor) {
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
              <h2 className="text-2xl font-bold mb-2">Fornecedor não encontrado</h2>
              <p className="text-muted-foreground mb-4">O fornecedor solicitado não foi encontrado.</p>
              <Button onClick={() => router.push('/cadastro/fornecedores')}>
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Fornecedores
              </Button>
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
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/cadastro/fornecedores')}
              >
                <IconArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {fornecedor.razao_social}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusColor(fornecedor.status)}>
                    {fornecedor.status}
                  </Badge>
                  <Badge variant="outline">
                    {fornecedor.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                  <Badge variant="secondary">
                    {fornecedor.categoria}
                  </Badge>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Dados Gerais */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconBuilding className="h-5 w-5" />
                    Dados Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Código</p>
                    <p className="font-mono">{fornecedor.codigo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-mono">{formatCpfCnpj(fornecedor.cnpj_cpf)}</p>
                  </div>
                  {fornecedor.nome_fantasia && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
                      <p>{fornecedor.nome_fantasia}</p>
                    </div>
                  )}
                  {fornecedor.ie && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IE</p>
                      <p>{fornecedor.ie}</p>
                    </div>
                  )}
                  {fornecedor.im && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">IM</p>
                      <p>{fornecedor.im}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contatos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconMail className="h-5 w-5" />
                    Contatos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fornecedor.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{fornecedor.email}</p>
                    </div>
                  )}
                  {fornecedor.fone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                      <p>{fornecedor.fone}</p>
                    </div>
                  )}
                  {fornecedor.celular && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Celular</p>
                      <p>{fornecedor.celular}</p>
                    </div>
                  )}
                  {fornecedor.site && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Website</p>
                      <p className="text-blue-600 hover:underline">
                        <a href={fornecedor.site} target="_blank" rel="noopener noreferrer">
                          {fornecedor.site}
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <IconMapPin className="h-5 w-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fornecedor.logradouro && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                      <p>{fornecedor.logradouro}, {fornecedor.numero}</p>
                    </div>
                  )}
                  {fornecedor.bairro && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                      <p>{fornecedor.bairro}</p>
                    </div>
                  )}
                  {fornecedor.municipio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cidade/UF</p>
                      <p>{fornecedor.municipio}/{fornecedor.uf}</p>
                    </div>
                  )}
                  {fornecedor.cep && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CEP</p>
                      <p>{fornecedor.cep}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs com informações detalhadas */}
            <Tabs defaultValue="comercial" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comercial">Dados Comerciais</TabsTrigger>
                <TabsTrigger value="bancario">Dados Bancários</TabsTrigger>
                <TabsTrigger value="observacoes">Observações</TabsTrigger>
              </TabsList>

              <TabsContent value="comercial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Comerciais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Prazo de Pagamento</p>
                        <p>{fornecedor.prazo_pagamento} dias</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Limite de Compra</p>
                        <p>R$ {fornecedor.limite_compra?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Desconto Negociado</p>
                        <p>{fornecedor.desconto_negociado}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Frete Mínimo</p>
                        <p>R$ {fornecedor.frete_minimo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pedido Mínimo</p>
                        <p>R$ {fornecedor.pedido_minimo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Prazo de Entrega</p>
                        <p>{fornecedor.prazo_entrega} dias</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bancario" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCreditCard className="h-5 w-5" />
                      Dados Bancários
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {fornecedor.banco && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Banco</p>
                          <p>{fornecedor.banco}</p>
                        </div>
                      )}
                      {fornecedor.agencia && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Agência</p>
                          <p>{fornecedor.agencia}</p>
                        </div>
                      )}
                      {fornecedor.conta && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Conta</p>
                          <p>{fornecedor.conta}</p>
                        </div>
                      )}
                      {fornecedor.tipo_conta && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tipo de Conta</p>
                          <p>{fornecedor.tipo_conta}</p>
                        </div>
                      )}
                      {fornecedor.pix && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-muted-foreground">Chave PIX</p>
                          <p className="font-mono">{fornecedor.pix}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="observacoes" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {fornecedor.observacoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconFileText className="h-5 w-5" />
                          Observações Gerais
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{fornecedor.observacoes}</p>
                      </CardContent>
                    </Card>
                  )}
                  {fornecedor.anotacoes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconFileText className="h-5 w-5" />
                          Anotações Internas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{fornecedor.anotacoes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
