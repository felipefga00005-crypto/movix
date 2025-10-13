"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconLoader, IconPackage, IconCalculator } from "@tabler/icons-react"

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

import { 
  Produto, 
  CreateProdutoRequest, 
  UpdateProdutoRequest, 
  ProdutoStatus,
  ProdutoCategoria,
  ProdutoUnidade
} from "@/types/produto"
import { produtoUtils } from "@/lib/api/produtos"

// Schema de validação
const produtoSchema = z.object({
  // Dados básicos
  nome: z.string().min(2, "Nome é obrigatório"),
  codigo: z.string().optional(),
  categoria: z.string().optional(),
  subcategoria: z.string().optional(),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  
  // Preços
  preco: z.string().min(1, "Preço é obrigatório").refine(
    (val) => !isNaN(parseFloat(val.replace(',', '.'))),
    "Preço deve ser um número válido"
  ),
  precoCusto: z.string().optional(),
  
  // Estoque
  estoque: z.string().optional(),
  estoqueMinimo: z.string().optional(),
  unidade: z.string().default("UN"),
  
  // Outros
  status: z.string().default(ProdutoStatus.ATIVO),
  fornecedor: z.string().optional(),
  descricao: z.string().optional(),
  peso: z.string().optional(),
  dimensoes: z.string().optional(),
  garantia: z.string().optional(),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface ProdutoFormProps {
  produto?: Produto
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProdutoForm({ produto, onSubmit, onCancel, isLoading }: ProdutoFormProps) {
  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produto?.nome || "",
      codigo: produto?.codigo || "",
      categoria: produto?.categoria || "",
      subcategoria: produto?.subcategoria || "",
      marca: produto?.marca || "",
      modelo: produto?.modelo || "",
      preco: produto?.preco?.toString() || "",
      precoCusto: produto?.precoCusto?.toString() || "",
      estoque: produto?.estoque?.toString() || "0",
      estoqueMinimo: produto?.estoqueMinimo?.toString() || "10",
      unidade: produto?.unidade || "UN",
      status: produto?.status || ProdutoStatus.ATIVO,
      fornecedor: produto?.fornecedor || "",
      descricao: produto?.descricao || "",
      peso: produto?.peso || "",
      dimensoes: produto?.dimensoes || "",
      garantia: produto?.garantia || "",
    },
  })

  // Gerar código automático se não fornecido
  const handleGenerateCodigo = () => {
    const nome = form.getValues("nome")
    const categoria = form.getValues("categoria")
    if (nome) {
      const codigo = produtoUtils.generateCodigoSuggestion(nome, categoria)
      form.setValue("codigo", codigo)
    }
  }

  // Calcular margem de lucro
  const calcularMargem = () => {
    const preco = parseFloat(form.getValues("preco")?.replace(',', '.') || "0")
    const precoCusto = parseFloat(form.getValues("precoCusto")?.replace(',', '.') || "0")
    
    if (precoCusto > 0) {
      return ((preco - precoCusto) / precoCusto * 100).toFixed(1)
    }
    return "0"
  }

  const handleSubmit = async (data: ProdutoFormData) => {
    try {
      // Converter strings para números
      const submitData = {
        ...data,
        preco: parseFloat(data.preco.replace(',', '.')),
        precoCusto: data.precoCusto ? parseFloat(data.precoCusto.replace(',', '.')) : undefined,
        estoque: data.estoque ? parseInt(data.estoque) : 0,
        estoqueMinimo: data.estoqueMinimo ? parseInt(data.estoqueMinimo) : 10,
      }
      
      await onSubmit(submitData)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              Dados Básicos
            </CardTitle>
            <CardDescription>
              Informações principais do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Código do produto" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateCodigo}
                        disabled={!form.getValues("nome")}
                      >
                        <IconCalculator className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Deixe vazio para gerar automaticamente
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
                        <SelectItem value={ProdutoStatus.ATIVO}>Ativo</SelectItem>
                        <SelectItem value={ProdutoStatus.INATIVO}>Inativo</SelectItem>
                        <SelectItem value={ProdutoStatus.DESCONTINUADO}>Descontinuado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ProdutoCategoria.INFORMATICA}>Informática</SelectItem>
                        <SelectItem value={ProdutoCategoria.ELETRONICOS}>Eletrônicos</SelectItem>
                        <SelectItem value={ProdutoCategoria.CASA_JARDIM}>Casa e Jardim</SelectItem>
                        <SelectItem value={ProdutoCategoria.ROUPAS_ACESSORIOS}>Roupas e Acessórios</SelectItem>
                        <SelectItem value={ProdutoCategoria.LIVROS}>Livros</SelectItem>
                        <SelectItem value={ProdutoCategoria.ESPORTES}>Esportes</SelectItem>
                        <SelectItem value={ProdutoCategoria.BELEZA_SAUDE}>Beleza e Saúde</SelectItem>
                        <SelectItem value={ProdutoCategoria.AUTOMOTIVO}>Automotivo</SelectItem>
                        <SelectItem value={ProdutoCategoria.BRINQUEDOS}>Brinquedos</SelectItem>
                        <SelectItem value={ProdutoCategoria.OUTROS}>Outros</SelectItem>
                      </SelectContent>
                    </Select>
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
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Modelo do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subcategoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Subcategoria do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fornecedor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fornecedor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preços */}
        <Card>
          <CardHeader>
            <CardTitle>Preços e Margem</CardTitle>
            <CardDescription>
              Informações financeiras do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d,]/g, '')
                          field.onChange(value)
                        }}
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
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d,]/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mostrar margem de lucro */}
            {form.watch("preco") && form.watch("precoCusto") && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Margem de Lucro:</strong> {calcularMargem()}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
            <CardDescription>
              Informações de estoque e unidade de medida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        type="number"
                        min="0"
                        {...field}
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
                        placeholder="10"
                        type="number"
                        min="0"
                        {...field}
                      />
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
                        <SelectItem value={ProdutoUnidade.UN}>Unidade (UN)</SelectItem>
                        <SelectItem value={ProdutoUnidade.KG}>Quilograma (KG)</SelectItem>
                        <SelectItem value={ProdutoUnidade.L}>Litro (L)</SelectItem>
                        <SelectItem value={ProdutoUnidade.M}>Metro (M)</SelectItem>
                        <SelectItem value={ProdutoUnidade.M2}>Metro² (M²)</SelectItem>
                        <SelectItem value={ProdutoUnidade.M3}>Metro³ (M³)</SelectItem>
                        <SelectItem value={ProdutoUnidade.CX}>Caixa (CX)</SelectItem>
                        <SelectItem value={ProdutoUnidade.PC}>Peça (PC)</SelectItem>
                        <SelectItem value={ProdutoUnidade.PAR}>Par (PAR)</SelectItem>
                        <SelectItem value={ProdutoUnidade.DZIA}>Dúzia (DZIA)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
            <CardDescription>
              Detalhes complementares do produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do produto"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1.5kg" {...field} />
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
                      <Input placeholder="Ex: 30x20x10cm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="garantia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garantia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 12 meses" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
            {produto ? "Atualizar" : "Cadastrar"} Produto
          </Button>
        </div>
      </form>
    </Form>
  )
}
