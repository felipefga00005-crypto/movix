"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  IconPackage,
  IconTag,
  IconCurrencyReal,
  IconStack,
  IconFileText,
  IconX,
} from "@tabler/icons-react"
import { useProdutoForm, produtoFormSchema, type ProdutoFormValues } from "@/hooks/cadastros/use-produto-form"
import type { Produto } from "@/types"

interface ProdutoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produto?: Produto | null
  onSuccess?: () => void
}

// Funções de formatação
const formatarMoeda = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  const amount = parseFloat(numbers) / 100
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ProdutoFormDialog({ open, onOpenChange, produto, onSuccess }: ProdutoFormDialogProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const {
    form,
    loading,
    error,
    onSubmit,
    calcularMargemLucro,
    calcularPrecoVenda,
    isEditing
  } = useProdutoForm({
    produto,
    onSuccess: () => {
      onSuccess?.()
      onOpenChange(false)
    }
  })

  // Controla a exibição do AlertDialog quando há erro
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true)
    }
  }, [error])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackage className="h-5 w-5" />
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do produto"
              : "Preencha os dados para cadastrar um novo produto"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col" id="produto-form">
              <Tabs defaultValue="geral" className="flex-1 flex flex-col">
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
                    <TabsTrigger value="geral" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                      <IconTag className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Dados Gerais</span>
                    </TabsTrigger>
                    <TabsTrigger value="precos" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                      <IconCurrencyReal className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Preços</span>
                    </TabsTrigger>
                    <TabsTrigger value="estoque" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                      <IconStack className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Estoque</span>
                    </TabsTrigger>
                    <TabsTrigger value="fiscal" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                      <IconFileText className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Fiscal</span>
                    </TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <div className="flex-1 overflow-y-auto mt-4">
                  {/* Tab: Dados Gerais */}
                  <TabsContent value="geral" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
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
                        name="codigo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código</FormLabel>
                            <FormControl>
                              <Input placeholder="Código interno" {...field} />
                            </FormControl>
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
                              <Input placeholder="EAN/UPC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoriaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <FormControl>
                              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Eletrônicos</SelectItem>
                                  <SelectItem value="2">Roupas</SelectItem>
                                  <SelectItem value="3">Casa e Jardim</SelectItem>
                                  <SelectItem value="4">Esportes</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="marcaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <FormControl>
                              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a marca" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Samsung</SelectItem>
                                  <SelectItem value="2">Apple</SelectItem>
                                  <SelectItem value="3">Nike</SelectItem>
                                  <SelectItem value="4">Adidas</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unidadeMedidaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade de Medida *</FormLabel>
                            <FormControl>
                              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a unidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Unidade (UN)</SelectItem>
                                  <SelectItem value="2">Quilograma (KG)</SelectItem>
                                  <SelectItem value="3">Metro (M)</SelectItem>
                                  <SelectItem value="4">Litro (L)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="peso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dimensoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dimensões</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 10x20x30 cm" {...field} />
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
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Ativo">Ativo</SelectItem>
                                  <SelectItem value="Inativo">Inativo</SelectItem>
                                  <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descrição detalhada do produto..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Preços */}
                  <TabsContent value="precos" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="precoCompra"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Compra *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0)
                                  setTimeout(calcularMargemLucro, 100)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="precoVenda"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço de Venda *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value) || 0)
                                  setTimeout(calcularMargemLucro, 100)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="margemLucro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Margem de Lucro (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const margem = parseFloat(e.target.value) || 0
                                  field.onChange(margem)
                                  calcularPrecoVenda(margem)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Estoque */}
                  <TabsContent value="estoque" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="controlaEstoque"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Controla Estoque</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Ativar controle de estoque para este produto
                              </div>
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

                      <FormField
                        control={form.control}
                        name="permiteVendaSemEstoque"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Venda sem Estoque</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Permitir venda mesmo sem estoque
                              </div>
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

                      <FormField
                        control={form.control}
                        name="estoqueAtual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Atual *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                            <FormLabel>Estoque Mínimo *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estoqueMaximo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estoque Máximo</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="1"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="localizacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Localização</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Prateleira A1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Fiscal */}
                  <TabsContent value="fiscal" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ncm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NCM</FormLabel>
                            <FormControl>
                              <Input placeholder="Nomenclatura Comum do Mercosul" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEST</FormLabel>
                            <FormControl>
                              <Input placeholder="Código Especificador da Substituição Tributária" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="origem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origem</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a origem" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">0 - Nacional</SelectItem>
                                  <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                                  <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fornecedorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor Principal</FormLabel>
                            <FormControl>
                              <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o fornecedor" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Fornecedor A</SelectItem>
                                  <SelectItem value="2">Fornecedor B</SelectItem>
                                  <SelectItem value="3">Fornecedor C</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="observacoes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Observações sobre o produto..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="produto-form"
            disabled={loading}
          >
            {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>

        {/* AlertDialog para exibir erros */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <IconX className="h-5 w-5" />
                Erro ao salvar produto
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
      </DialogContent>
    </Dialog>
  )
}
