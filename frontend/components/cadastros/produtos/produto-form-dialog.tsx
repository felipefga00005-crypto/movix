"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ProdutoService } from "@/lib/services/produto.service"
import { AuxiliaresService, type NCM, type CEST } from "@/lib/services/auxiliar.service"
import { FornecedorService, type Fornecedor } from "@/lib/services/fornecedor.service"
import { toast } from "sonner"

const produtoFormSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  codigoBarras: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  descricaoComplementar: z.string().optional(),
  ncmId: z.string().min(1, "NCM é obrigatório"),
  cestId: z.string().optional(),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  unidadeTributavel: z.string().optional(),
  valorUnitario: z.number().min(0, "Valor deve ser positivo"),
  valorCusto: z.number().min(0, "Valor deve ser positivo").optional(),
  margemLucro: z.number().min(0, "Margem deve ser positiva").optional(),
  estoqueAtual: z.number().min(0, "Estoque deve ser positivo").optional(),
  estoqueMinimo: z.number().min(0, "Estoque deve ser positivo").optional(),
  estoqueMaximo: z.number().min(0, "Estoque deve ser positivo").optional(),
  origem: z.number().min(0).max(8),
  cstIcms: z.string().min(1, "CST ICMS é obrigatório"),
  aliquotaIcms: z.number().min(0).max(100).optional(),
  reducaoBaseIcms: z.number().min(0).max(100).optional(),
  cstIpi: z.string().optional(),
  aliquotaIpi: z.number().min(0).max(100).optional(),
  cstPis: z.string().optional(),
  aliquotaPis: z.number().min(0).max(100).optional(),
  cstCofins: z.string().optional(),
  aliquotaCofins: z.number().min(0).max(100).optional(),
  fornecedorId: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
})

type ProdutoFormValues = z.infer<typeof produtoFormSchema>

interface ProdutoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  produtoId?: string
  onSuccess?: () => void
}

export function ProdutoFormDialog({
  open,
  onOpenChange,
  produtoId,
  onSuccess,
}: ProdutoFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [ncms, setNcms] = useState<NCM[]>([])
  const [cests, setCests] = useState<CEST[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      codigo: "",
      codigoBarras: "",
      descricao: "",
      descricaoComplementar: "",
      ncmId: "",
      cestId: "",
      unidade: "UN",
      unidadeTributavel: "",
      valorUnitario: 0,
      valorCusto: 0,
      margemLucro: 0,
      estoqueAtual: 0,
      estoqueMinimo: 0,
      estoqueMaximo: 0,
      origem: 0,
      cstIcms: "00",
      aliquotaIcms: 0,
      reducaoBaseIcms: 0,
      cstIpi: "",
      aliquotaIpi: 0,
      cstPis: "",
      aliquotaPis: 0,
      cstCofins: "",
      aliquotaCofins: 0,
      fornecedorId: "",
      observacoes: "",
      ativo: true,
    },
  })

  useEffect(() => {
    loadAuxiliares()
  }, [])

  useEffect(() => {
    if (open && produtoId) {
      loadProduto()
    } else if (open) {
      form.reset()
    }
  }, [open, produtoId])

  const loadAuxiliares = async () => {
    try {
      const [ncmsData, cestsData, fornecedoresData] = await Promise.all([
        AuxiliaresService.getNCMs(),
        AuxiliaresService.getCESTs(),
        FornecedorService.getForSelect(),
      ])
      setNcms(ncmsData)
      setCests(cestsData)
      setFornecedores(fornecedoresData)
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares:", error)
    }
  }

  const loadProduto = async () => {
    if (!produtoId) return

    try {
      setLoading(true)
      const produto = await ProdutoService.getById(produtoId)
      form.reset({
        codigo: produto.codigo,
        codigoBarras: produto.codigoBarras || "",
        descricao: produto.descricao,
        descricaoComplementar: produto.descricaoComplementar || "",
        ncmId: produto.ncmId,
        cestId: produto.cestId || "",
        unidade: produto.unidade,
        unidadeTributavel: produto.unidadeTributavel || "",
        valorUnitario: produto.valorUnitario,
        valorCusto: produto.valorCusto || 0,
        margemLucro: produto.margemLucro || 0,
        estoqueAtual: produto.estoqueAtual,
        estoqueMinimo: produto.estoqueMinimo || 0,
        estoqueMaximo: produto.estoqueMaximo || 0,
        origem: produto.origem,
        cstIcms: produto.cstIcms,
        aliquotaIcms: produto.aliquotaIcms || 0,
        reducaoBaseIcms: produto.reducaoBaseIcms || 0,
        cstIpi: produto.cstIpi || "",
        aliquotaIpi: produto.aliquotaIpi || 0,
        cstPis: produto.cstPis || "",
        aliquotaPis: produto.aliquotaPis || 0,
        cstCofins: produto.cstCofins || "",
        aliquotaCofins: produto.aliquotaCofins || 0,
        fornecedorId: produto.fornecedorId || "",
        observacoes: produto.observacoes || "",
        ativo: produto.ativo,
      })
    } catch (error) {
      console.error("Erro ao carregar produto:", error)
      toast.error("Erro ao carregar dados do produto")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: ProdutoFormValues) => {
    try {
      setLoading(true)

      if (produtoId) {
        await ProdutoService.update(produtoId, values)
        toast.success("Produto atualizado com sucesso!")
      } else {
        await ProdutoService.create(values)
        toast.success("Produto criado com sucesso!")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error)
      toast.error(error.message || "Erro ao salvar produto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {produtoId ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            {produtoId
              ? "Edite as informações do produto"
              : "Cadastre um novo produto"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input {...field} />
                      </FormControl>
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricaoComplementar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Complementar</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Classificação Fiscal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Classificação Fiscal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ncmId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NCM</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o NCM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ncms.map((ncm) => (
                            <SelectItem key={ncm.id} value={ncm.id}>
                              {ncm.codigo} - {ncm.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cestId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEST</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o CEST" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cests.map((cest) => (
                            <SelectItem key={cest.id} value={cest.id}>
                              {cest.codigo} - {cest.descricao}
                            </SelectItem>
                          ))}
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
                  name="origem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origem</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0 - Nacional</SelectItem>
                          <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                          <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cstIcms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CST ICMS</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="CST ICMS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="00">00 - Tributada integralmente</SelectItem>
                          <SelectItem value="10">10 - Tributada e com cobrança do ICMS por substituição tributária</SelectItem>
                          <SelectItem value="20">20 - Com redução de base de cálculo</SelectItem>
                          <SelectItem value="30">30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária</SelectItem>
                          <SelectItem value="40">40 - Isenta</SelectItem>
                          <SelectItem value="41">41 - Não tributada</SelectItem>
                          <SelectItem value="50">50 - Suspensão</SelectItem>
                          <SelectItem value="51">51 - Diferimento</SelectItem>
                          <SelectItem value="60">60 - ICMS cobrado anteriormente por substituição tributária</SelectItem>
                          <SelectItem value="70">70 - Com redução de base de cálculo e cobrança do ICMS por substituição tributária</SelectItem>
                          <SelectItem value="90">90 - Outras</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aliquotaIcms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alíquota ICMS (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Valores e Estoque */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Valores e Estoque</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorUnitario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Unitário</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valorCusto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor de Custo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estoqueAtual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Atual</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
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
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Fornecedor e Observações */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fornecedorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fornecedores.map((fornecedor) => (
                          <SelectItem key={fornecedor.id} value={fornecedor.id}>
                            {fornecedor.nome} - {fornecedor.documento}
                          </SelectItem>
                        ))}
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
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Status */}
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Produto Ativo</FormLabel>
                    <FormDescription>
                      Produto pode ser usado em novas transações
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Salvando..."
                  : produtoId
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
