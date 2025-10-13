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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  IconBuilding,
  IconUser,
  IconMapPin,
  IconPhone,
  IconFileText,
  IconLoader2,
  IconCheck,
  IconX,
} from "@tabler/icons-react"
import { useFornecedorForm, fornecedorFormSchema, type FornecedorFormValues } from "@/hooks/cadastros/use-fornecedor-form"
import type { Fornecedor } from "@/types"

interface FornecedorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fornecedor?: Fornecedor | null
  onSuccess?: () => void
}

// Funções de formatação
const formatarCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const formatarCEP = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function FornecedorFormDialog({ open, onOpenChange, fornecedor, onSuccess }: FornecedorFormDialogProps) {
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
  } = useFornecedorForm({
    fornecedor,
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
            <IconBuilding className="h-5 w-5" />
            {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do fornecedor"
              : "Preencha os dados para cadastrar um novo fornecedor"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col" id="fornecedor-form">
              <Tabs defaultValue="geral" className="flex-1 flex flex-col">
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
                    <TabsTrigger value="geral" className="flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm">
                      <IconUser className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Dados Gerais</span>
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
                      <IconFileText className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Comercial</span>
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
                        name="razaoSocial"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Razão Social *</FormLabel>
                            <FormControl>
                              <Input placeholder="Razão social da empresa" {...field} />
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
                              <Input placeholder="Nome fantasia" {...field} />
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
                              <Input placeholder="Código do fornecedor" {...field} />
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
                              <div className="relative">
                                <Input
                                  placeholder="00.000.000/0000-00"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(formatarCNPJ(value))
                                  }}
                                  onBlur={(e) => {
                                    field.onBlur()
                                    const numbers = e.target.value.replace(/\D/g, '')
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
                            <FormMessage />
                            {errorCNPJ && (
                              <p className="text-sm text-destructive">{errorCNPJ}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inscricaoEstadual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição Estadual</FormLabel>
                            <FormControl>
                              <Input placeholder="Inscrição estadual" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Contato */}
                  <TabsContent value="contato" className="mt-0 space-y-4">
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

                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone *</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 0000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="celular"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Celular</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  {/* Tab: Endereço */}
                  <TabsContent value="endereco" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="00000-000"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(formatarCEP(value))
                                  }}
                                  onBlur={(e) => {
                                    field.onBlur()
                                    const numbers = e.target.value.replace(/\D/g, '')
                                    if (numbers.length === 8) {
                                      buscarCEP(e.target.value)
                                    }
                                  }}
                                />
                                {loadingCEP && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                            {errorCEP && (
                              <p className="text-sm text-destructive">{errorCEP}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua, avenida, etc." {...field} />
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
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a cidade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cidades.map((cidade) => (
                                    <SelectItem key={cidade.id} value={cidade.nome}>
                                      {cidade.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Select value={field.value} onValueChange={(value) => {
                                field.onChange(value)
                                selecionarEstado(value)
                              }}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  {estados.map((estado) => (
                                    <SelectItem key={estado.id} value={estado.sigla}>
                                      {estado.nome}
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
                  </TabsContent>

                  {/* Tab: Comercial */}
                  <TabsContent value="comercial" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Fabricante">Fabricante</SelectItem>
                                  <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                                  <SelectItem value="Importador">Importador</SelectItem>
                                  <SelectItem value="Prestador de Serviço">Prestador de Serviço</SelectItem>
                                </SelectContent>
                              </Select>
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
                                  <SelectItem value="Pendente">Pendente</SelectItem>
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
                                placeholder="Observações sobre o fornecedor..."
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
            form="fornecedor-form"
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
                Erro ao salvar fornecedor
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
