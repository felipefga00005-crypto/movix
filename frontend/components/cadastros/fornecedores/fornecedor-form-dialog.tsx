"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea"

const fornecedorFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  tipo: z.enum(["Fabricante", "Distribuidor", "Importador", "Prestador de Serviço"]).default("Distribuidor"),
  status: z.enum(["Ativo", "Inativo"]).default("Ativo"),
  observacoes: z.string().optional(),
})

type FornecedorFormValues = z.infer<typeof fornecedorFormSchema>

interface FornecedorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fornecedor?: any | null
  onSuccess?: () => void
}

export function FornecedorFormDialog({
  open,
  onOpenChange,
  fornecedor,
  onSuccess,
}: FornecedorFormDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isEditing = !!fornecedor

  const form = useForm({
    resolver: zodResolver(fornecedorFormSchema),
    defaultValues: {
      nome: fornecedor?.nome || "",
      razaoSocial: fornecedor?.razaoSocial || "",
      cnpj: fornecedor?.cnpj || "",
      email: fornecedor?.email || "",
      telefone: fornecedor?.telefone || "",
      endereco: fornecedor?.endereco || "",
      cidade: fornecedor?.cidade || "",
      estado: fornecedor?.estado || "",
      cep: fornecedor?.cep || "",
      tipo: (fornecedor?.categoria as any) || "Distribuidor",
      status: fornecedor?.status || "Ativo",
      observacoes: fornecedor?.observacoes || "",
    },
  })

  React.useEffect(() => {
    if (fornecedor) {
      form.reset({
        nome: fornecedor.nome,
        razaoSocial: fornecedor.razaoSocial || "",
        cnpj: fornecedor.cnpj,
        email: fornecedor.email,
        telefone: fornecedor.telefone,
        endereco: fornecedor.endereco || "",
        cidade: fornecedor.cidade || "",
        estado: fornecedor.estado || "",
        cep: fornecedor.cep || "",
        tipo: fornecedor.tipo || "Distribuidor",
        status: fornecedor.status || "Ativo",
        observacoes: fornecedor.observacoes || "",
      })
    } else {
      form.reset({
        nome: "",
        razaoSocial: "",
        cnpj: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        tipo: "Distribuidor",
        status: "Ativo",
        observacoes: "",
      })
    }
  }, [fornecedor, form])

  const onSubmit = async (data: FornecedorFormValues) => {
    try {
      setLoading(true)
      // TODO: Integrar com API
      console.log(isEditing ? "Atualizando fornecedor:" : "Criando fornecedor:", data)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simula API
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar fornecedor:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl flex flex-col max-h-[90vh]">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Atualize as informações do fornecedor"
                : "Preencha os dados para cadastrar um novo fornecedor"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" id="fornecedor-form">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome Fantasia *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Razão social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fabricante">Fabricante</SelectItem>
                        <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                        <SelectItem value="Importador">Importador</SelectItem>
                        <SelectItem value="Prestador de Serviço">Prestador de Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
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
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, complemento" {...field} />
                    </FormControl>
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
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              {/* Botões dentro do formulário */}
              <div className="flex flex-col gap-2 pt-6 pb-8 border-t mt-6">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" type="button" className="w-full">Cancelar</Button>
                </DrawerClose>
              </div>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}


