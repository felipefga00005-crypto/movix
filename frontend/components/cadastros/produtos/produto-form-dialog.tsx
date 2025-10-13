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
import { useProdutos } from "@/hooks/cadastros/use-produtos"
import type { Produto, Status } from "@/types"

const produtoFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  marca: z.string().optional(),
  unidade: z.string().optional(),
  preco: z.coerce.number().min(0, "Preço deve ser maior que zero"),
  precoCusto: z.coerce.number().min(0).optional(),
  estoque: z.coerce.number().min(0).optional(),
  estoqueMinimo: z.coerce.number().min(0).optional(),
  status: z.enum(["Ativo", "Inativo", "Pendente"]).default("Ativo"),
  codigoBarras: z.string().optional(),
  ncm: z.string().optional(),
  observacoes: z.string().optional(),
})

type ProdutoFormValues = z.infer<typeof produtoFormSchema>

interface ProdutoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produto?: Produto | null
  onSuccess?: () => void
}

export function ProdutoFormDialog({
  open,
  onOpenChange,
  produto,
  onSuccess,
}: ProdutoFormDialogProps) {
  const { createProduto, updateProduto, loading } = useProdutos({ autoFetch: false })
  const isEditing = !!produto

  const form = useForm({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      nome: produto?.nome || "",
      descricao: produto?.descricao || "",
      categoria: produto?.categoria || "",
      marca: produto?.marca || "",
      unidade: produto?.unidade || "UN",
      preco: produto?.preco || 0,
      precoCusto: produto?.precoCusto || 0,
      estoque: produto?.estoque || 0,
      estoqueMinimo: produto?.estoqueMinimo || 0,
      status: (produto?.status as Status) || "Ativo",
      codigoBarras: produto?.codigoBarras || "",
      ncm: produto?.ncm || "",
      observacoes: produto?.observacoes || "",
    },
  })

  React.useEffect(() => {
    if (produto) {
      form.reset({
        nome: produto.nome,
        descricao: produto.descricao || "",
        categoria: produto.categoria,
        marca: produto.marca || "",
        unidade: produto.unidade || "UN",
        preco: produto.preco,
        precoCusto: produto.precoCusto || 0,
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        status: produto.status as Status,
        codigoBarras: produto.codigoBarras || "",
        ncm: produto.ncm || "",
        observacoes: produto.observacoes || "",
      })
    } else {
      form.reset({
        nome: "",
        descricao: "",
        categoria: "",
        marca: "",
        unidade: "UN",
        preco: 0,
        precoCusto: 0,
        estoque: 0,
        estoqueMinimo: 0,
        status: "Ativo",
        codigoBarras: "",
        ncm: "",
        observacoes: "",
      })
    }
  }, [produto, form])

  const onSubmit = async (data: ProdutoFormValues) => {
    try {
      if (isEditing) {
        await updateProduto(produto.id, data)
      } else {
        await createProduto(data)
      }
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-3xl flex flex-col max-h-[90vh]">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {isEditing ? "Editar Produto" : "Novo Produto"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Atualize as informações do produto"
                : "Preencha os dados para cadastrar um novo produto"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" id="produto-form">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
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
                    <FormLabel>Categoria *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Eletrônicos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Marca do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UN">Unidade</SelectItem>
                        <SelectItem value="CX">Caixa</SelectItem>
                        <SelectItem value="PC">Peça</SelectItem>
                        <SelectItem value="KG">Quilograma</SelectItem>
                        <SelectItem value="LT">Litro</SelectItem>
                        <SelectItem value="MT">Metro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigoBarras"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input placeholder="EAN/GTIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={String(field.value || "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precoCusto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={String(field.value || "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={String(field.value || "")}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoqueMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={String(field.value || "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ncm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NCM</FormLabel>
                    <FormControl>
                      <Input placeholder="Código NCM" {...field} />
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do produto..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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


