"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  IconBuilding,
  IconUser,
  IconMapPin,
  IconPhone,
  IconFileText,
  IconSettings,
  IconTruck,
  IconReceipt,
  IconSearch,
  IconLoader2,
  IconCheck,
  IconX,
  IconCreditCard,
  IconPlus
} from "@tabler/icons-react"
import { useClientes } from "@/hooks/cadastros/use-clientes"
import { useClienteForm, clienteFormSchema, type ClienteFormValues } from "@/hooks/cadastros/use-cliente-form"
import { externalApisService, type Endereco, type Estado, type Cidade } from "@/lib/api/external-apis"
import type { Cliente, Status } from "@/types"

type TipoPessoa = "Física" | "Jurídica"



interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
  onSuccess?: () => void
}

// Funções de formatação
const formatarCPF = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const formatarCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const formatarCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function ClienteFormDialog({ open, onOpenChange, cliente, onSuccess }: ClienteFormDialogProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const {
    form,
    estados,
    cidades,
    endereco,
    loading,
    loadingCEP,
    loadingCNPJ,
    loadingEstados,
    loadingCidades,
    error,
    errorCEP,
    errorCNPJ,
    buscarCEP,
    buscarCNPJ,
    selecionarEstado,
    onSubmit,
    limparEndereco,
    isEditing
  } = useClienteForm({
    cliente,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    }
  })

  // Função para adicionar campo personalizado
  const adicionarCampoPersonalizado = () => {
    const camposAtuais = form.getValues('camposPersonalizados')
    const novoCampo = {
      id: `campo_${Date.now()}`,
      nome: '',
      valor: ''
    }
    form.setValue('camposPersonalizados', [...(camposAtuais || []), novoCampo])
  }

  // Controla a exibição do AlertDialog quando há erro
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true)
    }
  }, [error])

  // Função para remover campo personalizado
  const removerCampoPersonalizado = (id: string) => {
    const camposAtuais = form.getValues('camposPersonalizados')
    const camposFiltrados = (camposAtuais || []).filter(campo => campo.id !== id)
    form.setValue('camposPersonalizados', camposFiltrados)
  }

  // Função para atualizar campo personalizado
  const atualizarCampoPersonalizado = (id: string, propriedade: 'nome' | 'valor', valor: string) => {
    const camposAtuais = form.getValues('camposPersonalizados')
    const camposAtualizados = (camposAtuais || []).map(campo =>
      campo.id === id ? { ...campo, [propriedade]: valor } : campo
    )
    form.setValue('camposPersonalizados', camposAtualizados)
  }

  // Função para detectar tipo de documento
  const detectarTipoDocumento = (documento: string) => {
    const numbers = documento.replace(/\D/g, '')
    return numbers.length <= 11 ? 'CPF' : 'CNPJ'
  }

  // Resetar formulário quando o dialog é aberto/fechado ou cliente muda
  useEffect(() => {
    if (open) {
      // Estados são carregados automaticamente pelo hook

      console.log('Resetando formulário com cliente:', cliente)

      // Resetar formulário com valores do cliente (para edição) ou valores padrão (para criação)
      const formValues = {
        cpfCnpj: cliente?.cpf || "",
        inscricaoEstadual: cliente?.inscricaoEstadual || "",
        inscricaoMunicipal: cliente?.inscricaoMunicipal || "",
        nome: cliente?.nome || "",
        nomeFantasia: cliente?.nomeFantasia || "",
        tipoCliente: (cliente?.tipoContato as any) || "Cliente",
        consumidorFinal: cliente?.consumidorFinal || false,
        dataAbertura: cliente?.dataAbertura || cliente?.dataNascimento || "",
        email: cliente?.email || "",
        telefoneFixo: cliente?.telefone || cliente?.telefoneFixo || "",
        celular: cliente?.celular || "",
        pontoReferencia: cliente?.pontoReferencia || "",
        cep: cliente?.cep || "",
        endereco: cliente?.endereco || "",
        numero: cliente?.numero || "",
        complemento: cliente?.complemento || "",
        bairro: cliente?.bairro || "",
        cidade: cliente?.cidade || "",
        estado: cliente?.estado || "",
        codigoIbge: cliente?.codigoIbge || "",
        enderecoEntregaDiferente: !!(cliente?.cepEntrega || cliente?.enderecoEntrega),
        cepEntrega: cliente?.cepEntrega || "",
        enderecoEntrega: cliente?.enderecoEntrega || "",
        numeroEntrega: cliente?.numeroEntrega || "",
        complementoEntrega: cliente?.complementoEntrega || "",
        bairroEntrega: cliente?.bairroEntrega || "",
        cidadeEntrega: cliente?.cidadeEntrega || "",
        estadoEntrega: cliente?.estadoEntrega || "",
        limiteCredito: cliente?.limiteCredito || "",
        saldoInicial: cliente?.saldoInicial || "0",
        prazoPagamento: cliente?.prazoPagamento || "",
        numeroImposto: cliente?.numeroImposto || "",
        codigoCliente: cliente?.codigo || "",
        suframa: cliente?.suframa || "",
        camposPersonalizados: [],
        status: (cliente?.status as Status) || "Ativo",
        observacoes: cliente?.observacoes || "",
      }

      console.log('Valores do formulário sendo definidos:', formValues)
      form.reset(formValues)

      // Estados de erro são gerenciados pelo hook
    }
  }, [open, cliente, form])









  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-screen !h-screen max-h-none flex flex-col p-0 rounded-none border-0 m-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize as informações do cliente"
                : "Preencha os dados para cadastrar um novo cliente"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="cliente-form">
              <Tabs defaultValue="dados-basicos" className="w-full">
                {/* Container responsivo para os tabs */}
                <div className="w-full">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max min-w-full md:w-full">
                      <TabsTrigger
                        value="dados-basicos"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 flex-shrink-0"
                      >
                        <IconUser className="h-4 w-4" />
                        <span className="hidden sm:inline">Dados Básicos</span>
                        <span className="sm:hidden">Dados</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="endereco-contato"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 flex-shrink-0"
                      >
                        <IconPhone className="h-4 w-4" />
                        <span className="hidden sm:inline">Contato & Endereço</span>
                        <span className="sm:hidden">Contato</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="financeiro-fiscal"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 flex-shrink-0"
                      >
                        <IconCreditCard className="h-4 w-4" />
                        <span>Financeiro</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="configuracoes"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2 flex-shrink-0"
                      >
                        <IconSettings className="h-4 w-4" />
                        <span className="hidden sm:inline">Configurações</span>
                        <span className="sm:hidden">Config</span>
                      </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </div>

                {/* Tab: Dados Básicos */}
                <TabsContent value="dados-basicos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconUser className="h-5 w-5" />
                        Informações Básicas
                      </CardTitle>
                      <CardDescription>
                        Dados principais e documentos do cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Primeira linha - Documentos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* CPF/CNPJ */}
                        <FormField
                          control={form.control}
                          name="cpfCnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                CPF/CNPJ *
                                {loadingCNPJ && <IconLoader2 className="h-4 w-4 animate-spin" />}
                                {field.value && (
                                  <Badge variant="outline" className="text-xs">
                                    {detectarTipoDocumento(field.value)}
                                  </Badge>
                                )}
                              </FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      const numbers = value.replace(/\D/g, '')

                                      // Formata automaticamente baseado no tamanho
                                      if (numbers.length <= 11) {
                                        field.onChange(formatarCPF(value))
                                      } else {
                                        field.onChange(formatarCNPJ(value))
                                      }
                                    }}
                                    onBlur={(e) => {
                                      field.onBlur()
                                      const numbers = e.target.value.replace(/\D/g, '')

                                      // Se é CNPJ (14 dígitos), busca automaticamente
                                      if (numbers.length === 14) {
                                        buscarCNPJ(e.target.value)
                                      }
                                    }}
                                  />
                                  {loadingCNPJ && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                      <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              {errorCNPJ && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                  <IconX className="h-3 w-3" />
                                  {errorCNPJ}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* RG/Inscrição Estadual */}
                        <FormField
                          control={form.control}
                          name="inscricaoEstadual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {detectarTipoDocumento(form.watch('cpfCnpj')) === 'CPF' ? 'RG' : 'Inscrição Estadual'}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={detectarTipoDocumento(form.watch('cpfCnpj')) === 'CPF' ? 'RG' : 'Inscrição Estadual'}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Inscrição Municipal */}
                        <FormField
                          control={form.control}
                          name="inscricaoMunicipal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inscrição Municipal</FormLabel>
                              <FormControl>
                                <Input placeholder="Inscrição Municipal" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nome/Razão Social */}
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome/Razão Social *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome completo ou razão social" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nome Fantasia */}
                        <FormField
                          control={form.control}
                          name="nomeFantasia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome Fantasia</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome fantasia (se aplicável)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Data de Abertura/Nascimento */}
                        <FormField
                          control={form.control}
                          name="dataAbertura"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {detectarTipoDocumento(form.watch('cpfCnpj')) === 'CPF' ? 'Data de Nascimento' : 'Data de Abertura'}
                              </FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tipo de Cliente */}
                        <FormField
                          control={form.control}
                          name="tipoCliente"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Cliente *</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Cliente">Cliente</SelectItem>
                                    <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                    <SelectItem value="Cliente/Fornecedor">Cliente/Fornecedor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Consumidor Final */}
                        <FormField
                          control={form.control}
                          name="consumidorFinal"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Consumidor Final
                                </FormLabel>
                                <FormDescription>
                                  Marque se for consumidor final
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>


                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Contato & Endereço */}
                <TabsContent value="endereco-contato" className="space-y-4">
                  {/* Dados de Contato */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconPhone className="h-5 w-5" />
                        Dados de Contato
                      </CardTitle>
                      <CardDescription>
                        Informações para comunicação com o cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Email */}
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@exemplo.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Telefone Fixo */}
                        <FormField
                          control={form.control}
                          name="telefoneFixo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 3000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Celular */}
                        <FormField
                          control={form.control}
                          name="celular"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Celular</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 99999-9999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Ponto de Referência */}
                        <FormField
                          control={form.control}
                          name="pontoReferencia"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2 lg:col-span-3">
                              <FormLabel>Ponto de Referência</FormLabel>
                              <FormControl>
                                <Input placeholder="Próximo ao shopping, em frente à padaria..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Endereço Principal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconMapPin className="h-5 w-5" />
                        Endereço Principal
                      </CardTitle>
                      <CardDescription>
                        Localização do cliente para entrega e correspondência
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* CEP */}
                        <FormField
                          control={form.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                CEP *
                                {loadingCEP && <IconLoader2 className="h-4 w-4 animate-spin" />}
                                {endereco && <Badge variant="secondary" className="text-xs">
                                  <IconCheck className="h-3 w-3 mr-1" />
                                  Encontrado
                                </Badge>}
                              </FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="CEP"
                                    {...field}
                                    onChange={(e) => {
                                      const formatted = formatarCEP(e.target.value)
                                      field.onChange(formatted)
                                    }}
                                    onBlur={(e) => {
                                      field.onBlur()
                                      const numbers = e.target.value.replace(/\D/g, '')

                                      // Se tem 8 dígitos, busca automaticamente
                                      if (numbers.length === 8) {
                                        buscarCEP(e.target.value)
                                      }
                                    }}
                                  />
                                  {field.value && field.value.replace(/\D/g, '').length === 8 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => field.value && buscarCEP(field.value)}
                                      disabled={loadingCEP}
                                    >
                                      {loadingCEP ? (
                                        <IconLoader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <IconSearch className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </FormControl>
                              {errorCEP && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                  <IconX className="h-3 w-3" />
                                  {errorCEP}
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Endereço */}
                        <FormField
                          control={form.control}
                          name="endereco"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Rua *</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Número */}
                        <FormField
                          control={form.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nº" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Complemento */}
                        <FormField
                          control={form.control}
                          name="complemento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input placeholder="Complemento" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Bairro */}
                        <FormField
                          control={form.control}
                          name="bairro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro *</FormLabel>
                              <FormControl>
                                <Input placeholder="Bairro" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Cidade */}
                        <FormField
                          control={form.control}
                          name="cidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Cidade *
                                {loadingCidades && <IconLoader2 className="h-4 w-4 animate-spin" />}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Cidade"
                                  {...field}
                                  disabled={loadingCidades}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Estado */}
                        <FormField
                          control={form.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Estado
                                {loadingEstados && <IconLoader2 className="h-4 w-4 animate-spin" />}
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    // Busca cidades automaticamente quando seleciona estado
                                    selecionarEstado(value)
                                  }}
                                  value={field.value}
                                  disabled={loadingEstados}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {estados.map((estado) => (
                                      <SelectItem key={estado.sigla} value={estado.sigla}>
                                        {estado.nome} ({estado.sigla})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Ponto de Referência */}
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="pontoReferencia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ponto de Referência</FormLabel>
                              <FormControl>
                                <Input placeholder="Próximo ao shopping, em frente à escola..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Endereço de Entrega */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconTruck className="h-5 w-5" />
                        Endereço de Entrega
                      </CardTitle>
                      <CardDescription>
                        Configure um endereço diferente para entrega (opcional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Switch para habilitar endereço diferente */}
                      <FormField
                        control={form.control}
                        name="enderecoEntregaDiferente"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Endereço de entrega diferente
                              </FormLabel>
                              <FormDescription>
                                Marque se o endereço de entrega for diferente do endereço principal
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Campos de endereço de entrega (só aparecem se habilitado) */}
                      {form.watch('enderecoEntregaDiferente') && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* CEP Entrega */}
                            <FormField
                              control={form.control}
                              name="cepEntrega"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="00000-000"
                                        {...field}
                                        onChange={(e) => {
                                          const value = e.target.value
                                          field.onChange(formatarCEP(value))
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => field.value && buscarCEP(field.value)}
                                        disabled={loadingCEP}
                                      >
                                        <IconSearch className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Endereço Entrega */}
                            <FormField
                              control={form.control}
                              name="enderecoEntrega"
                              render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel>Endereço</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rua, Avenida, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Número Entrega */}
                            <FormField
                              control={form.control}
                              name="numeroEntrega"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Complemento Entrega */}
                            <FormField
                              control={form.control}
                              name="complementoEntrega"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Apto, Sala, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Bairro Entrega */}
                            <FormField
                              control={form.control}
                              name="bairroEntrega"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Bairro" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Cidade Entrega */}
                            <FormField
                              control={form.control}
                              name="cidadeEntrega"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Cidade" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Financeiro */}
                <TabsContent value="financeiro-fiscal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconCreditCard className="h-5 w-5" />
                        Dados Financeiros
                      </CardTitle>
                      <CardDescription>
                        Informações comerciais e de pagamento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Limite de Crédito */}
                        <FormField
                          control={form.control}
                          name="limiteCredito"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Limite de crédito</FormLabel>
                              <FormControl>
                                <Input placeholder="Mantenha em branco sem limite" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Saldo Inicial */}
                        <FormField
                          control={form.control}
                          name="saldoInicial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Saldo inicial</FormLabel>
                              <FormControl>
                                <Input placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Prazo de Pagamento */}
                        <FormField
                          control={form.control}
                          name="prazoPagamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prazo de pagamento</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecionar" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="a-vista">À vista</SelectItem>
                                    <SelectItem value="7-dias">7 dias</SelectItem>
                                    <SelectItem value="15-dias">15 dias</SelectItem>
                                    <SelectItem value="30-dias">30 dias</SelectItem>
                                    <SelectItem value="45-dias">45 dias</SelectItem>
                                    <SelectItem value="60-dias">60 dias</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Campos Personalizados */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="h-5 w-5" />
                        Campos Personalizados
                      </CardTitle>
                      <CardDescription>
                        Campos adicionais personalizáveis
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Botão para adicionar campo */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={adicionarCampoPersonalizado}
                        className="w-full"
                      >
                        <IconPlus className="h-4 w-4 mr-2" />
                        Adicionar Campo Personalizado
                      </Button>

                      {/* Campos personalizados dinâmicos */}
                      <div className="space-y-4">
                        {(form.watch('camposPersonalizados') || []).map((campo, index) => (
                          <div key={campo.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                            <FormField
                              control={form.control}
                              name={`camposPersonalizados.${index}.nome`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Campo</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ex: Código Interno"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e)
                                        atualizarCampoPersonalizado(campo.id, 'nome', e.target.value)
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`camposPersonalizados.${index}.valor`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Valor do campo"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e)
                                        atualizarCampoPersonalizado(campo.id, 'valor', e.target.value)
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removerCampoPersonalizado(campo.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <IconX className="h-4 w-4" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                </TabsContent>

                {/* Tab: Configurações */}
                <TabsContent value="configuracoes" className="space-y-4">
                  {/* Configurações do Sistema */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSettings className="h-5 w-5" />
                        Configurações do Sistema
                      </CardTitle>
                      <CardDescription>
                        Status e configurações gerais do cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status */}
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Ativo">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      Ativo
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Inativo">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      Inativo
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Pendente">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                      Pendente
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observações */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Observações</CardTitle>
                      <CardDescription>
                        Informações adicionais sobre o cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Observações adicionais sobre o cliente..."
                                className="resize-none min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>



        <div className="border-t p-6">
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="cliente-form"
              disabled={loading}
            >
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>

      {/* AlertDialog para exibir erros */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <IconX className="h-5 w-5" />
              Erro ao salvar cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
