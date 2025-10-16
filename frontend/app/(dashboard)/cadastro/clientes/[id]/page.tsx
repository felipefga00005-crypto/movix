'use client'

/**
 * Página de Visualização de Cliente
 * Exibe todos os detalhes do cliente de forma organizada
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/dashboard/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconUser,
  IconBuilding,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCreditCard,
  IconCalendar,
  IconFileText,
  IconTruck,
  IconCash,
} from '@tabler/icons-react'
import { clienteService } from '@/lib/services/cliente.service'
import { ClienteForm } from '@/components/cadastro/clientes/cliente-form'
import type { Cliente } from '@/types/cliente'
import { toast } from 'sonner'

export default function ClienteViewPage() {
  const params = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const clienteId = params.id as string

  useEffect(() => {
    loadCliente()
  }, [clienteId])

  const loadCliente = async () => {
    try {
      setIsLoading(true)
      const data = await clienteService.getById(parseInt(clienteId))
      setCliente(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar cliente')
      router.push('/cadastro/clientes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    loadCliente() // Recarregar dados após edição
  }

  const handleDelete = async () => {
    if (!cliente) return
    
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.razao_social}?`)) {
      try {
        await clienteService.delete(cliente.id)
        toast.success('Cliente excluído com sucesso!')
        router.push('/cadastro/clientes')
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir cliente')
      }
    }
  }

  const formatCpfCnpj = (value: string): string => {
    if (!value) return '-'
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string | undefined): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!cliente) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="relative flex flex-col gap-4 overflow-auto px-4 py-4 lg:px-6 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/cadastro/clientes')}
              >
                <IconArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{cliente.razao_social}</h1>
                {cliente.nome_fantasia && (
                  <p className="text-sm text-muted-foreground">{cliente.nome_fantasia}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={cliente.status === 'Ativo' ? 'default' : 'secondary'}>
                {cliente.status}
              </Badge>
              <Badge variant="outline">
                {cliente.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <IconTrash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>

          <Separator />

          {/* Dados Gerais - Fora das Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* CNPJ/CPF */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {cliente.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'}
                  </p>
                  <p className="text-base font-semibold font-mono">{formatCpfCnpj(cliente.cnpj_cpf)}</p>
                </div>

                {/* Email */}
                {cliente.email && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <IconMail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-base font-semibold truncate">{cliente.email}</p>
                  </div>
                )}

                {/* Telefone */}
                {cliente.fone && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <IconPhone className="h-4 w-4" />
                      Telefone
                    </p>
                    <p className="text-base font-semibold">{cliente.fone}</p>
                  </div>
                )}

                {/* Celular */}
                {cliente.celular && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <IconPhone className="h-4 w-4" />
                      Celular
                    </p>
                    <p className="text-base font-semibold">{cliente.celular}</p>
                  </div>
                )}

                {/* IE */}
                {cliente.ie && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Inscrição Estadual</p>
                    <p className="text-base font-semibold">{cliente.ie}</p>
                  </div>
                )}

                {/* IM */}
                {cliente.im && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Inscrição Municipal</p>
                    <p className="text-base font-semibold">{cliente.im}</p>
                  </div>
                )}

                {/* Indicador IE */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Indicador IE</p>
                  <p className="text-base font-semibold">
                    {cliente.ind_ie_dest === 1
                      ? 'Contribuinte ICMS'
                      : cliente.ind_ie_dest === 2
                      ? 'Isento'
                      : 'Não Contribuinte'}
                  </p>
                </div>

                {/* Tipo de Contato */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Contato</p>
                  <p className="text-base font-semibold">{cliente.tipo_contato}</p>
                </div>

                {/* Consumidor Final */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Consumidor Final</p>
                  <p className="text-base font-semibold">{cliente.consumidor_final ? 'Sim' : 'Não'}</p>
                </div>

                {/* Ponto de Referência */}
                {cliente.ponto_referencia && (
                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-muted-foreground">Ponto de Referência</p>
                    <p className="text-base font-semibold">{cliente.ponto_referencia}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs - Informações Específicas */}
          <Tabs defaultValue="endereco" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            {/* Aba Endereço */}
            <TabsContent value="endereco" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Endereço Principal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMapPin className="h-5 w-5" />
                      Endereço Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cliente.logradouro && (
                      <p className="text-base">
                        {cliente.logradouro}
                        {cliente.numero && `, ${cliente.numero}`}
                      </p>
                    )}
                    {cliente.complemento && (
                      <p className="text-sm text-muted-foreground">{cliente.complemento}</p>
                    )}
                    {cliente.bairro && (
                      <p className="text-base">{cliente.bairro}</p>
                    )}
                    {cliente.municipio && cliente.uf && (
                      <p className="text-base">
                        {cliente.municipio} - {cliente.uf}
                      </p>
                    )}
                    {cliente.cep && (
                      <p className="text-sm text-muted-foreground">CEP: {cliente.cep}</p>
                    )}
                    {cliente.pais && (
                      <p className="text-sm text-muted-foreground">{cliente.pais}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Endereço de Entrega */}
                {(cliente.logradouro_entrega || cliente.cep_entrega) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconTruck className="h-5 w-5" />
                        Endereço de Entrega
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {cliente.logradouro_entrega && (
                        <p className="text-base">
                          {cliente.logradouro_entrega}
                          {cliente.numero_entrega && `, ${cliente.numero_entrega}`}
                        </p>
                      )}
                      {cliente.complemento_entrega && (
                        <p className="text-sm text-muted-foreground">{cliente.complemento_entrega}</p>
                      )}
                      {cliente.bairro_entrega && (
                        <p className="text-base">{cliente.bairro_entrega}</p>
                      )}
                      {cliente.municipio_entrega && cliente.uf_entrega && (
                        <p className="text-base">
                          {cliente.municipio_entrega} - {cliente.uf_entrega}
                        </p>
                      )}
                      {cliente.cep_entrega && (
                        <p className="text-sm text-muted-foreground">CEP: {cliente.cep_entrega}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Aba Financeiro */}
            <TabsContent value="financeiro" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconCash className="h-5 w-5" />
                      Limite de Crédito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(cliente.limite_credito)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconCreditCard className="h-5 w-5" />
                      Saldo Inicial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(cliente.saldo_inicial)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconCalendar className="h-5 w-5" />
                      Prazo de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{cliente.prazo_pagamento} dias</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Histórico */}
            <TabsContent value="historico" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCalendar className="h-5 w-5" />
                    Datas Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cliente.data_nascimento && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                      <p className="text-base">{formatDate(cliente.data_nascimento)}</p>
                    </div>
                  )}
                  {cliente.data_abertura && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Abertura</p>
                      <p className="text-base">{formatDate(cliente.data_abertura)}</p>
                    </div>
                  )}
                  {cliente.ultima_compra && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última Compra</p>
                      <p className="text-base">{formatDate(cliente.ultima_compra)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cadastrado em</p>
                    <p className="text-base">{formatDate(cliente.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                    <p className="text-base">{formatDate(cliente.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Formulário de Edição */}
      <ClienteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        cliente={cliente}
        onSuccess={handleFormSuccess}
      />
    </SidebarProvider>
  )
}


