"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppLayout } from "@/components/shared/app-layout"
import { ClienteFormDialog } from "@/components/cadastros/clientes/cliente-form-dialog"
import { useClientes } from "@/hooks/cadastros/use-clientes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCreditCard,
  IconBuilding,
  IconId,
  IconFileText,
  IconShoppingCart,
  IconClock
} from "@tabler/icons-react"
import type { Cliente } from "@/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function ClienteDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(params.id as string)

  const { getCliente, deleteCliente } = useClientes({ autoFetch: false })
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Funções de formatação
  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado"
    try {
      return new Date(dateString).toLocaleDateString("pt-BR")
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Não informado"
    try {
      return new Date(dateString).toLocaleString("pt-BR")
    } catch {
      return dateString
    }
  }

  const formatCpfCnpj = (cpf: string) => {
    if (!cpf) return "Não informado"
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '')

    if (numbers.length === 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbers.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }

    // Se não for CPF nem CNPJ válido, retorna os números com formatação básica
    return numbers
  }

  // Buscar cliente
  useEffect(() => {
    const fetchCliente = async () => {
      if (!id || isNaN(id)) {
        setError("ID do cliente inválido")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await getCliente(id)
        setCliente(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao buscar cliente"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchCliente()
  }, [id, getCliente])

  const handleEdit = () => {
    setEditDialogOpen(true)
  }

  const handleEditSuccess = async () => {
    // Recarregar dados do cliente
    try {
      const data = await getCliente(id)
      setCliente(data)
    } catch (err) {
      console.error("Erro ao recarregar cliente:", err)
    }
  }

  const handleDelete = async () => {
    if (!cliente) return

    try {
      setDeleting(true)
      await deleteCliente(cliente.id)
      router.push("/cadastros/clientes")
    } catch (err) {
      console.error("Erro ao deletar cliente:", err)
      alert("Erro ao deletar cliente")
    } finally {
      setDeleting(false)
    }
  }



  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando cliente...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-destructive mb-2">Erro</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => router.push("/cadastros/clientes")}>
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Clientes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!cliente) {
    return (
      <AppLayout>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
                <p className="text-muted-foreground mb-4">O cliente solicitado não existe ou foi removido.</p>
                <Button onClick={() => router.push("/cadastros/clientes")}>
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Clientes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Breadcrumb */}
        <div className="px-4 lg:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/cadastros/clientes">Clientes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detalhes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header da página */}
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/cadastros/clientes")}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{cliente.nome}</h1>
                <p className="text-sm text-muted-foreground">
                  CPF/CNPJ: {formatCpfCnpj(cliente.cpf)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleEdit} size="sm">
                <IconEdit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    {deleting ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconTrash className="mr-2 h-4 w-4" />
                    )}
                    {deleting ? "Excluindo..." : "Excluir"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o cliente <strong>{cliente.nome}</strong>?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Cliente Details com Tabs */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="geral" className="w-full">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
                <TabsTrigger value="geral" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                  <IconUser className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Informações Gerais</span>
                </TabsTrigger>
                <TabsTrigger value="contato" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                  <IconPhone className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Contato</span>
                </TabsTrigger>
                <TabsTrigger value="endereco" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                  <IconMapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Endereço</span>
                </TabsTrigger>
                <TabsTrigger value="comercial" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                  <IconCreditCard className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Comercial</span>
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                  <IconClock className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">Histórico</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {/* Tab: Informações Gerais */}
            <TabsContent value="geral" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUser className="h-5 w-5" />
                      Dados Básicos
                    </CardTitle>
                    <CardDescription>
                      Informações principais do cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                        <p className="text-base font-medium">{cliente.nome || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome Fantasia</label>
                        <p className="text-sm">{cliente.nomeFantasia || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo de Contato</label>
                        <p className="text-sm">{cliente.tipoContato || "Cliente"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconId className="h-5 w-5" />
                      Documentos
                    </CardTitle>
                    <CardDescription>
                      Documentos e identificação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</label>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{formatCpfCnpj(cliente.cpf) || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">RG/Inscrição Estadual</label>
                        <p className="text-sm">{cliente.ieRg || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Inscrição Municipal</label>
                        <p className="text-sm">{cliente.inscricaoMunicipal || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="flex items-center gap-2">
                          <Badge variant={cliente.status === "Ativo" ? "default" : "secondary"}>
                            {cliente.status || "Ativo"}
                          </Badge>
                          {cliente.consumidorFinal && (
                            <Badge variant="outline">Consumidor Final</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Contato */}
            <TabsContent value="contato" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMail className="h-5 w-5" />
                      Informações de Contato
                    </CardTitle>
                    <CardDescription>
                      Formas de comunicação com o cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <IconMail className="h-4 w-4" />
                          Email Principal
                        </label>
                        <p className="text-sm bg-muted px-2 py-1 rounded font-mono">{cliente.email || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <IconPhone className="h-4 w-4" />
                          Telefone Fixo
                        </label>
                        <p className="text-sm">{cliente.telefoneFixo || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <IconPhone className="h-4 w-4" />
                          Celular
                        </label>
                        <p className="text-sm">{cliente.celular || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone Alternativo</label>
                        <p className="text-sm">{cliente.telefoneAlternativo || "Não informado"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMapPin className="h-5 w-5" />
                      Referência
                    </CardTitle>
                    <CardDescription>
                      Informações adicionais de localização
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ponto de Referência</label>
                      <p className="text-sm">{cliente.pontoReferencia || "Não informado"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Endereço */}
            <TabsContent value="endereco" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconMapPin className="h-5 w-5" />
                      Endereço Principal
                    </CardTitle>
                    <CardDescription>
                      Localização principal do cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CEP</label>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{cliente.cep || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Endereço Completo</label>
                        <p className="text-sm">{cliente.endereco ? `${cliente.endereco}, ${cliente.numero || "S/N"}` : "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                        <p className="text-sm">{cliente.complemento || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                        <p className="text-sm">{cliente.bairro || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cidade/Estado</label>
                        <p className="text-sm font-medium">{cliente.cidade && cliente.estado ? `${cliente.cidade}/${cliente.estado}` : "Não informado"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconBuilding className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                    <CardDescription>
                      Endereço alternativo para entregas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CEP Entrega</label>
                        <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{cliente.cepEntrega || "Mesmo do principal"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Endereço de Entrega</label>
                        <p className="text-sm">{cliente.enderecoEntrega ? `${cliente.enderecoEntrega}, ${cliente.numeroEntrega || "S/N"}` : "Mesmo do principal"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Cidade/Estado Entrega</label>
                        <p className="text-sm">{cliente.cidadeEntrega && cliente.estadoEntrega ? `${cliente.cidadeEntrega}/${cliente.estadoEntrega}` : "Mesmo do principal"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Comercial */}
            <TabsContent value="comercial" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCreditCard className="h-5 w-5" />
                      Informações Financeiras
                    </CardTitle>
                    <CardDescription>
                      Dados financeiros e de crédito
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Limite de Crédito</label>
                        <p className="text-lg font-semibold text-green-600">{cliente.limiteCredito || "Não definido"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Saldo Inicial</label>
                        <p className="text-sm">{cliente.saldoInicial || "R$ 0,00"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Prazo de Pagamento</label>
                        <p className="text-sm">{cliente.prazoPagamento || "Não definido"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconFileText className="h-5 w-5" />
                      Dados Fiscais
                    </CardTitle>
                    <CardDescription>
                      Informações fiscais e tributárias
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Código IBGE</label>
                        <p className="text-sm font-mono">{cliente.codigoIbge || "Não informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Suframa</label>
                        <p className="text-sm">{cliente.suframa || "Não se aplica"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Histórico */}
            <TabsContent value="historico" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconShoppingCart className="h-5 w-5" />
                      Histórico de Compras
                    </CardTitle>
                    <CardDescription>
                      Informações sobre compras realizadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Última Compra</label>
                        <p className="text-sm">{cliente.ultimaCompra || "Nunca comprou"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total de Compras</label>
                        <p className="text-sm">Não disponível</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
                        <p className="text-sm">Não disponível</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconCalendar className="h-5 w-5" />
                      Datas Importantes
                    </CardTitle>
                    <CardDescription>
                      Histórico de cadastro e atualizações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                        <p className="text-sm">{formatDate(cliente.dataCadastro)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                        <p className="text-sm">{formatDate(cliente.dataAtualizacao)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Nascimento/Abertura</label>
                        <p className="text-sm">{formatDate(cliente.dataNascimento || cliente.dataAbertura)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Dialog */}
      <ClienteFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        cliente={cliente}
        onSuccess={handleEditSuccess}
      />
    </AppLayout>
  )
}
