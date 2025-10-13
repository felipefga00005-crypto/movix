"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconLoader, IconSearch, IconBuilding } from "@tabler/icons-react"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { 
  Fornecedor, 
  CreateFornecedorRequest, 
  UpdateFornecedorRequest, 
  FornecedorStatus,
  FornecedorCategoria 
} from "@/types/fornecedor"
import { fornecedorUtils } from "@/lib/api/fornecedores"
import { externalAPI } from "@/lib/api/clientes"

// Schema de validação
const fornecedorSchema = z.object({
  // Dados básicos
  razaoSocial: z.string().min(2, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ é obrigatório").refine(
    (val) => fornecedorUtils.isValidCNPJ(val),
    "CNPJ inválido"
  ),
  
  // Contatos
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  contato: z.string().optional(),
  
  // Endereço
  cep: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  
  // Classificação
  categoria: z.string().optional(),
  status: z.string().default(FornecedorStatus.ATIVO),
})

type FornecedorFormData = z.infer<typeof fornecedorSchema>

interface FornecedorFormProps {
  fornecedor?: Fornecedor
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function FornecedorForm({ fornecedor, onSubmit, onCancel, isLoading }: FornecedorFormProps) {
  const [isLoadingCEP, setIsLoadingCEP] = React.useState(false)
  const [isLoadingCNPJ, setIsLoadingCNPJ] = React.useState(false)

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      razaoSocial: fornecedor?.razaoSocial || "",
      nomeFantasia: fornecedor?.nomeFantasia || "",
      cnpj: fornecedor?.cnpj || "",
      email: fornecedor?.email || "",
      telefone: fornecedor?.telefone || "",
      contato: fornecedor?.contato || "",
      cep: fornecedor?.cep || "",
      endereco: fornecedor?.endereco || "",
      cidade: fornecedor?.cidade || "",
      uf: fornecedor?.uf || "",
      categoria: fornecedor?.categoria || "",
      status: fornecedor?.status || FornecedorStatus.ATIVO,
    },
  })

  // Buscar CEP
  const handleBuscarCEP = async () => {
    const cep = form.getValues("cep")
    if (!cep || cep.length < 8) return

    setIsLoadingCEP(true)
    try {
      const endereco = await externalAPI.buscarCEP(cep)
      form.setValue("endereco", endereco.logradouro)
      form.setValue("cidade", endereco.localidade)
      form.setValue("uf", endereco.uf)
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    } finally {
      setIsLoadingCEP(false)
    }
  }

  // Buscar CNPJ
  const handleBuscarCNPJ = async () => {
    const cnpj = form.getValues("cnpj")
    if (!cnpj || cnpj.length < 14) return

    setIsLoadingCNPJ(true)
    try {
      const empresa = await externalAPI.buscarCNPJ(cnpj)
      form.setValue("razaoSocial", empresa.razaoSocial)
      form.setValue("nomeFantasia", empresa.nomeFantasia)
      form.setValue("email", empresa.email)
      form.setValue("telefone", empresa.telefone)
      form.setValue("cep", empresa.endereco.cep)
      form.setValue("endereco", empresa.endereco.logradouro)
      form.setValue("cidade", empresa.endereco.municipio)
      form.setValue("uf", empresa.endereco.uf)
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error)
    } finally {
      setIsLoadingCNPJ(false)
    }
  }

  const handleSubmit = async (data: FornecedorFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5" />
              Dados Básicos
            </CardTitle>
            <CardDescription>
              Informações principais do fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="00.000.000/0000-00" 
                          {...field}
                          onChange={(e) => {
                            const formatted = fornecedorUtils.formatCNPJ(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleBuscarCNPJ}
                        disabled={isLoadingCNPJ || !field.value || field.value.length < 14}
                      >
                        {isLoadingCNPJ ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconSearch className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      Clique na lupa para buscar dados automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value={FornecedorStatus.ATIVO}>Ativo</SelectItem>
                        <SelectItem value={FornecedorStatus.INATIVO}>Inativo</SelectItem>
                        <SelectItem value={FornecedorStatus.PENDENTE}>Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="razaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomeFantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome comercial" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FornecedorCategoria.DISTRIBUIDOR}>Distribuidor</SelectItem>
                      <SelectItem value={FornecedorCategoria.FABRICANTE}>Fabricante</SelectItem>
                      <SelectItem value={FornecedorCategoria.IMPORTADOR}>Importador</SelectItem>
                      <SelectItem value={FornecedorCategoria.PRESTADOR_SERVICO}>Prestador de Serviço</SelectItem>
                      <SelectItem value={FornecedorCategoria.OUTROS}>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Dados para comunicação com o fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@empresa.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field}
                        onChange={(e) => {
                          const formatted = fornecedorUtils.formatTelefone(e.target.value)
                          field.onChange(formatted)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pessoa de Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do responsável" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Localização do fornecedor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          {...field}
                          onChange={(e) => {
                            const formatted = fornecedorUtils.formatCEP(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleBuscarCEP}
                        disabled={isLoadingCEP || !field.value || field.value.length < 8}
                      >
                        {isLoadingCEP ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconSearch className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, complemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
            {fornecedor ? "Atualizar" : "Cadastrar"} Fornecedor
          </Button>
        </div>
      </form>
    </Form>
  )
}
