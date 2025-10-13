"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconLoader, IconSearch, IconPlus, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import { Cliente, CreateClienteRequest, UpdateClienteRequest, ClienteStatus, TipoContato } from "@/types/cliente"
import { clienteUtils, externalAPI } from "@/lib/api/clientes"

// Schema de validação
const clienteSchema = z.object({
  // Dados básicos
  cpf: z.string().min(11, "CPF/CNPJ é obrigatório").refine(
    (val) => clienteUtils.isValidCPF(val) || clienteUtils.isValidCNPJ(val),
    "CPF/CNPJ inválido"
  ),
  nome: z.string().min(2, "Nome é obrigatório"),
  nomeFantasia: z.string().optional(),
  ieRg: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  tipoContato: z.string().default(TipoContato.CLIENTE),
  consumidorFinal: z.boolean().default(false),
  
  // Contatos
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefoneFixo: z.string().optional(),
  telefoneAlternativo: z.string().optional(),
  celular: z.string().optional(),
  pontoReferencia: z.string().optional(),
  
  // Endereço principal
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  
  // Endereço de entrega
  cepEntrega: z.string().optional(),
  enderecoEntrega: z.string().optional(),
  numeroEntrega: z.string().optional(),
  complementoEntrega: z.string().optional(),
  bairroEntrega: z.string().optional(),
  cidadeEntrega: z.string().optional(),
  estadoEntrega: z.string().optional(),
  
  // Dados financeiros
  limiteCredito: z.string().optional(),
  saldoInicial: z.string().optional(),
  prazoPagamento: z.string().optional(),
  
  // Outros
  dataNascimento: z.string().optional(),
  dataAbertura: z.string().optional(),
  status: z.string().default(ClienteStatus.ATIVO),
  observacoes: z.string().optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: Cliente
  onSubmit: (data: CreateClienteRequest | UpdateClienteRequest) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ClienteForm({ cliente, onSubmit, onCancel, isLoading }: ClienteFormProps) {
  const [isLoadingCEP, setIsLoadingCEP] = React.useState(false)
  const [isLoadingCNPJ, setIsLoadingCNPJ] = React.useState(false)
  const [estados, setEstados] = React.useState<Array<{id: number, sigla: string, nome: string}>>([])
  
  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      cpf: cliente?.cpf || "",
      nome: cliente?.nome || "",
      nomeFantasia: cliente?.nomeFantasia || "",
      ieRg: cliente?.ieRg || "",
      inscricaoMunicipal: cliente?.inscricaoMunicipal || "",
      tipoContato: cliente?.tipoContato || TipoContato.CLIENTE,
      consumidorFinal: cliente?.consumidorFinal || false,
      email: cliente?.email || "",
      telefoneFixo: cliente?.telefoneFixo || "",
      telefoneAlternativo: cliente?.telefoneAlternativo || "",
      celular: cliente?.celular || "",
      pontoReferencia: cliente?.pontoReferencia || "",
      cep: cliente?.cep || "",
      endereco: cliente?.endereco || "",
      numero: cliente?.numero || "",
      complemento: cliente?.complemento || "",
      bairro: cliente?.bairro || "",
      cidade: cliente?.cidade || "",
      estado: cliente?.estado || "",
      cepEntrega: cliente?.cepEntrega || "",
      enderecoEntrega: cliente?.enderecoEntrega || "",
      numeroEntrega: cliente?.numeroEntrega || "",
      complementoEntrega: cliente?.complementoEntrega || "",
      bairroEntrega: cliente?.bairroEntrega || "",
      cidadeEntrega: cliente?.cidadeEntrega || "",
      estadoEntrega: cliente?.estadoEntrega || "",
      limiteCredito: cliente?.limiteCredito || "",
      saldoInicial: cliente?.saldoInicial || "",
      prazoPagamento: cliente?.prazoPagamento || "",
      dataNascimento: cliente?.dataNascimento || "",
      dataAbertura: cliente?.dataAbertura || "",
      status: cliente?.status || ClienteStatus.ATIVO,
      observacoes: cliente?.observacoes || "",
    },
  })

  // Carregar estados na inicialização
  React.useEffect(() => {
    externalAPI.listarEstados()
      .then(setEstados)
      .catch(console.error)
  }, [])

  // Buscar CEP
  const handleBuscarCEP = async (cep: string, isEntrega = false) => {
    if (!cep || cep.length < 8) return
    
    setIsLoadingCEP(true)
    try {
      const endereco = await externalAPI.buscarCEP(cep)
      
      if (isEntrega) {
        form.setValue("enderecoEntrega", endereco.street || "")
        form.setValue("bairroEntrega", endereco.district || "")
        form.setValue("cidadeEntrega", endereco.city || "")
        form.setValue("estadoEntrega", endereco.state || "")
      } else {
        form.setValue("endereco", endereco.street || "")
        form.setValue("bairro", endereco.district || "")
        form.setValue("cidade", endereco.city || "")
        form.setValue("estado", endereco.state || "")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    } finally {
      setIsLoadingCEP(false)
    }
  }

  // Buscar CNPJ
  const handleBuscarCNPJ = async (cnpj: string) => {
    if (!cnpj || cnpj.length < 14) return
    
    setIsLoadingCNPJ(true)
    try {
      const empresa = await externalAPI.buscarCNPJ(cnpj)
      
      form.setValue("nome", empresa.razaoSocial || "")
      form.setValue("nomeFantasia", empresa.nomeFantasia || "")
      form.setValue("email", empresa.email || "")
      form.setValue("telefoneFixo", empresa.telefone || "")
      
      if (empresa.endereco) {
        form.setValue("endereco", empresa.endereco.logradouro || "")
        form.setValue("numero", empresa.endereco.numero || "")
        form.setValue("complemento", empresa.endereco.complemento || "")
        form.setValue("bairro", empresa.endereco.bairro || "")
        form.setValue("cidade", empresa.endereco.municipio || "")
        form.setValue("estado", empresa.endereco.uf || "")
        form.setValue("cep", empresa.endereco.cep || "")
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error)
    } finally {
      setIsLoadingCNPJ(false)
    }
  }

  const handleSubmit = async (data: ClienteFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
            <CardDescription>
              Informações principais do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CPF/CNPJ */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00 ou 00.000.000/0000-00" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value)
                            
                            // Auto-buscar CNPJ se for válido
                            if (clienteUtils.isValidCNPJ(value)) {
                              handleBuscarCNPJ(value)
                            }
                          }}
                        />
                      </FormControl>
                      {clienteUtils.getDocumentType(field.value) === 'CNPJ' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleBuscarCNPJ(field.value)}
                          disabled={isLoadingCNPJ}
                        >
                          {isLoadingCNPJ ? (
                            <IconLoader className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconSearch className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome */}
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

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Nome Fantasia */}
              <FormField
                control={form.control}
                name="nomeFantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome fantasia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Contato */}
              <FormField
                control={form.control}
                name="tipoContato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Contato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TipoContato.CLIENTE}>Cliente</SelectItem>
                        <SelectItem value={TipoContato.FORNECEDOR}>Fornecedor</SelectItem>
                        <SelectItem value={TipoContato.AMBOS}>Ambos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value={ClienteStatus.ATIVO}>Ativo</SelectItem>
                        <SelectItem value={ClienteStatus.INATIVO}>Inativo</SelectItem>
                        <SelectItem value={ClienteStatus.PENDENTE}>Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Consumidor Final */}
            <FormField
              control={form.control}
              name="consumidorFinal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Consumidor Final
                    </FormLabel>
                    <FormDescription>
                      Marque se este cliente é consumidor final
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
            {cliente ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>

      </form>
    </Form>
  )
}
