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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClienteService } from "@/lib/services/cliente.service"
import { AuxiliarService, type Estado, type Municipio } from "@/lib/services/auxiliar.service"
import { DocumentoInput } from "@/components/shared/documento-input"
import { CepInput } from "@/components/shared/cep-input"
import { type CnpjData, type CepData } from "@/lib/services/external-api.service"
import { toast } from "sonner"

const clienteFormSchema = z.object({
  tipo: z.enum(["FISICA", "JURIDICA"]).optional().default("FISICA"),
  documento: z.string().min(11, "Documento deve ter pelo menos 11 caracteres"),
  nome: z.string().min(1, "Nome é obrigatório"),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cep: z.string().min(8, "CEP deve ter 8 caracteres"),
  municipioId: z.string().min(1, "Município é obrigatório"),
  estadoId: z.string().min(1, "Estado é obrigatório"),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  indicadorIE: z.number().optional(),
  ativo: z.boolean().default(true),
})

type ClienteFormValues = z.infer<typeof clienteFormSchema>

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteId?: string
  onSuccess?: () => void
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  clienteId,
  onSuccess,
}: ClienteFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [estados, setEstados] = useState<Estado[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      tipo: "FISICA",
      documento: "",
      nome: "",
      nomeFantasia: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
      municipioId: "",
      estadoId: "",
      telefone: "",
      celular: "",
      email: "",
      indicadorIE: 9,
      ativo: true,
    },
  })

  const watchEstadoId = form.watch("estadoId")

  useEffect(() => {
    loadEstados()
  }, [])

  useEffect(() => {
    if (open && clienteId) {
      loadCliente()
    } else if (open) {
      form.reset()
    }
  }, [open, clienteId])

  useEffect(() => {
    if (watchEstadoId) {
      loadMunicipios(watchEstadoId)
      form.setValue("municipioId", "")
    }
  }, [watchEstadoId])

  const loadEstados = async () => {
    try {
      const data = await AuxiliarService.getEstados()
      setEstados(data)
    } catch (error) {
      console.error("Erro ao carregar estados:", error)
    }
  }

  const loadMunicipios = async (estadoId: string): Promise<void> => {
    try {
      const data = await AuxiliarService.getMunicipiosByEstado(estadoId)
      setMunicipios(data)
    } catch (error) {
      console.error("Erro ao carregar municípios:", error)
    }
  }

  // Auto-preenchimento por CNPJ
  const handleCnpjDataLoaded = (cnpjData: CnpjData) => {
    if (!cnpjData) {
      console.warn('Dados do CNPJ não recebidos')
      return
    }

    // Preenche dados da empresa
    form.setValue("nome", cnpjData.razaoSocial || "")
    form.setValue("nomeFantasia", cnpjData.nomeFantasia || "")
    form.setValue("telefone", cnpjData.telefone || "")
    form.setValue("email", cnpjData.email || "")
    form.setValue("inscricaoEstadual", cnpjData.inscricoesEstaduais?.find(ie => ie.ativo)?.numero || "")

    // Preenche dados do endereço
    form.setValue("logradouro", cnpjData.logradouro || "")
    form.setValue("numero", cnpjData.numero || "")
    form.setValue("complemento", cnpjData.complemento || "")
    form.setValue("bairro", cnpjData.bairro || "")
    form.setValue("cep", typeof cnpjData.cep === 'string' ? cnpjData.cep.replace(/\D/g, '') : "")

    // Se tem UF, busca e seleciona o estado
    if (cnpjData.uf) {
      const estado = estados.find(e => e.uf === cnpjData.uf)
      if (estado) {
        form.setValue("estadoId", estado.id)

        // Se tem município, carrega municípios e seleciona
        if (cnpjData.municipio) {
          loadMunicipios(estado.id).then(() => {
            // Busca o município após carregar a lista
            AuxiliarService.getMunicipiosByEstado(estado.id).then(municipiosData => {
              const municipio = municipiosData.find(m =>
                m.nome.toLowerCase() === cnpjData.municipio?.toLowerCase()
              )
              if (municipio) {
                form.setValue("municipioId", municipio.id)
              }
            }).catch(error => {
              console.warn('Erro ao buscar municípios:', error)
            })
          }).catch(error => {
            console.warn('Erro ao carregar municípios:', error)
          })
        }
      }
    }
  }

  // Auto-preenchimento por CEP
  const handleCepDataLoaded = (cepData: CepData) => {
    if (!cepData) {
      console.warn('Dados do CEP não recebidos')
      return
    }

    // Preenche dados do endereço
    form.setValue("logradouro", cepData.logradouro || "")
    form.setValue("bairro", cepData.bairro || "")

    // Se tem UF, busca estado e município
    if (cepData.uf) {
      const estado = estados.find(e => e.uf === cepData.uf)
      if (estado) {
        form.setValue("estadoId", estado.id)

        // Se tem localidade, carrega municípios e seleciona
        if (cepData.localidade) {
          loadMunicipios(estado.id).then(() => {
            // Busca o município após carregar a lista
            AuxiliarService.getMunicipiosByEstado(estado.id).then(municipiosData => {
              const municipio = municipiosData.find(m =>
                m.nome.toLowerCase() === cepData.localidade?.toLowerCase()
              )
              if (municipio) {
                form.setValue("municipioId", municipio.id)
              }
            }).catch(error => {
              console.warn('Erro ao buscar municípios:', error)
            })
          }).catch(error => {
            console.warn('Erro ao carregar municípios:', error)
          })
        }
      }
    }
  }

  const loadCliente = async () => {
    if (!clienteId) return

    try {
      setLoading(true)
      const cliente = await ClienteService.getById(clienteId)
      form.reset({
        tipo: cliente.tipo,
        documento: cliente.documento,
        nome: cliente.nome,
        nomeFantasia: cliente.nomeFantasia || "",
        inscricaoEstadual: cliente.inscricaoEstadual || "",
        inscricaoMunicipal: cliente.inscricaoMunicipal || "",
        logradouro: cliente.logradouro,
        numero: cliente.numero,
        complemento: cliente.complemento || "",
        bairro: cliente.bairro,
        cep: cliente.cep,
        municipioId: cliente.municipioId,
        estadoId: cliente.estadoId,
        telefone: cliente.telefone || "",
        celular: cliente.celular || "",
        email: cliente.email || "",
        indicadorIE: cliente.indicadorIE || 9,
        ativo: cliente.ativo,
      })
    } catch (error) {
      console.error("Erro ao carregar cliente:", error)
      toast.error("Erro ao carregar dados do cliente")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: ClienteFormValues) => {
    try {
      setLoading(true)

      if (clienteId) {
        await ClienteService.update(clienteId, values)
        toast.success("Cliente atualizado com sucesso!")
      } else {
        await ClienteService.create(values)
        toast.success("Cliente criado com sucesso!")
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error)
      toast.error(error.message || "Erro ao salvar cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] h-[90vh] sm:max-w-[90vw] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {clienteId ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {clienteId
              ? "Edite as informações do cliente abaixo"
              : "Preencha os dados para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Documento CPF/CNPJ */}
                <FormField
                  control={form.control}
                  name="documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF/CNPJ</FormLabel>
                      <FormControl>
                        <DocumentoInput
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value)
                            // Detecta automaticamente o tipo baseado no documento
                            const numbers = value.replace(/\D/g, '')
                            if (numbers.length <= 11) {
                              form.setValue('tipo', 'FISICA')
                            } else if (numbers.length <= 14) {
                              form.setValue('tipo', 'JURIDICA')
                            }
                          }}
                          onDataLoaded={handleCnpjDataLoaded}
                          tipo="AUTO" // Detecção automática
                          autoFill={true} // Auto-preenchimento para CNPJ
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

            {/* Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("documento")?.replace(/\D/g, '').length > 11
                        ? "Razão Social"
                        : "Nome"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("documento")?.replace(/\D/g, '').length > 11 && (
                <FormField
                  control={form.control}
                  name="nomeFantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endereço</CardTitle>
                <CardDescription>
                  Localização do cliente
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
                      <FormControl>
                        <CepInput
                          value={field.value}
                          onChange={field.onChange}
                          onDataLoaded={handleCepDataLoaded}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estadoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado.id} value={estado.id}>
                              {estado.nome} ({estado.uf})
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
                  name="municipioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Município</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!watchEstadoId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o município" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {municipios.map((municipio) => (
                            <SelectItem key={municipio.id} value={municipio.id}>
                              {municipio.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="logradouro"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
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
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contato</CardTitle>
                <CardDescription>
                  Informações de contato do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
                <CardDescription>
                  Configurações de ativação do cliente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cliente Ativo</FormLabel>
                        <FormDescription>
                          Cliente pode ser usado em novas transações
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
              </CardContent>
            </Card>

            </form>
          </Form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                {clienteId ? "Editando cliente existente" : "Criando novo cliente"}
              </div>
              {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
                <div className="flex items-center text-sm text-destructive">
                  <div className="w-2 h-2 rounded-full bg-destructive mr-2" />
                  {Object.keys(form.formState.errors).length} erro(s) encontrado(s)
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || Object.keys(form.formState.errors).length > 0}
                onClick={form.handleSubmit(onSubmit)}
                className="min-w-[140px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <>
                    {clienteId ? "💾 Atualizar Cliente" : "✨ Criar Cliente"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
