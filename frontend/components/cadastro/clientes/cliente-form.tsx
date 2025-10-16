'use client'

/**
 * Formulário de Cliente
 * Componente para criar/editar clientes
 */

import { useState, useEffect } from 'react'
import { IconDeviceFloppy, IconX, IconLoader2, IconCopy } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clienteService } from '@/lib/services/cliente.service'
import { externalApiService } from '@/lib/services/external-api.service'
import type { Cliente, CreateClienteRequest } from '@/types/cliente'
import { toast } from 'sonner'

interface ClienteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cliente?: Cliente | null
  onSuccess?: () => void
}

export function ClienteForm({
  open,
  onOpenChange,
  cliente,
  onSuccess,
}: ClienteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false)
  const [formData, setFormData] = useState<CreateClienteRequest>({
    tipoPessoa: 'PJ', // Padrão CNPJ
    cnpjCpf: '',
    razaoSocial: '',
    status: 'Ativo',
  })

  const isEditing = !!cliente

  // Carregar dados do cliente quando estiver editando
  useEffect(() => {
    if (cliente && open) {
      setFormData({
        tipoPessoa: cliente.tipo_pessoa || 'PJ',
        cnpjCpf: cliente.cnpj_cpf || '',
        razaoSocial: cliente.razao_social || '',
        nomeFantasia: cliente.nome_fantasia || '',
        ie: cliente.ie || '',
        im: cliente.im || '',
        indIeDest: cliente.ind_ie_dest || 9,
        email: cliente.email || '',
        fone: cliente.fone || '',
        celular: cliente.celular || '',
        status: cliente.status || 'Ativo',
        tipoContato: cliente.tipo_contato || 'Cliente',
        consumidorFinal: cliente.consumidor_final || false,
        pontoReferencia: cliente.ponto_referencia || '',
        dataNascimento: cliente.data_nascimento || '',
        dataAbertura: cliente.data_abertura || '',
        // Endereço Principal
        cep: cliente.cep || '',
        logradouro: cliente.logradouro || '',
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro || '',
        municipio: cliente.municipio || '',
        uf: cliente.uf || '',
        codigoIbge: cliente.codigo_ibge || '',
        pais: cliente.pais || 'BRASIL',
        codigoPais: cliente.codigo_pais || '1058',
        // Endereço de Entrega
        cepEntrega: cliente.cep_entrega || '',
        logradouroEntrega: cliente.logradouro_entrega || '',
        numeroEntrega: cliente.numero_entrega || '',
        complementoEntrega: cliente.complemento_entrega || '',
        bairroEntrega: cliente.bairro_entrega || '',
        municipioEntrega: cliente.municipio_entrega || '',
        ufEntrega: cliente.uf_entrega || '',
        codigoIbgeEntrega: cliente.codigo_ibge_entrega || '',
        paisEntrega: cliente.pais_entrega || '',
        codigoPaisEntrega: cliente.codigo_pais_entrega || '',
        // Financeiro
        limiteCredito: cliente.limite_credito || 0,
        saldoInicial: cliente.saldo_inicial || 0,
        prazoPagamento: cliente.prazo_pagamento || 0,
      })
    } else if (!open) {
      // Resetar quando fechar
      resetForm()
    }
  }, [cliente, open])

  // Função para detectar automaticamente o tipo de pessoa baseado no CNPJ/CPF
  const detectarTipoPessoa = (cnpjCpf: string): 'PF' | 'PJ' => {
    // Remove caracteres não numéricos
    const apenasNumeros = cnpjCpf.replace(/\D/g, '')

    // Se tiver exatamente 11 dígitos, é CPF (Pessoa Física)
    // Caso contrário, é CNPJ (Pessoa Jurídica) - padrão
    if (apenasNumeros.length === 11) {
      return 'PF' // CPF tem 11 dígitos
    } else {
      return 'PJ' // CNPJ tem 14 dígitos (padrão)
    }
  }

  // Handler para mudança no campo CNPJ/CPF (apenas atualiza o valor)
  const handleCnpjCpfChange = (value: string) => {
    setFormData({
      ...formData,
      cnpjCpf: value
    })
  }

  // Handler para quando o usuário sai do campo CNPJ/CPF (detecta o tipo e busca dados)
  const handleCnpjCpfBlur = async () => {
    if (formData.cnpjCpf) {
      const tipoPessoaDetectado = detectarTipoPessoa(formData.cnpjCpf)
      setFormData({
        ...formData,
        tipoPessoa: tipoPessoaDetectado
      })

      // Se for CNPJ (14 dígitos), busca os dados automaticamente
      const apenasNumeros = formData.cnpjCpf.replace(/\D/g, '')
      if (apenasNumeros.length === 14) {
        await buscarDadosCNPJ(formData.cnpjCpf)
      }
    }
  }

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj: string) => {
    try {
      setIsLoadingCNPJ(true)
      const dados = await externalApiService.buscarCNPJ(cnpj)

      // Preenche os campos do formulário com os dados da empresa
      setFormData(prev => ({
        ...prev,
        razaoSocial: dados.razao_social || prev.razaoSocial,
        nomeFantasia: dados.nome_fantasia || prev.nomeFantasia,
        ie: dados.inscricao_estadual || prev.ie,
        email: dados.contato?.email || prev.email,
        fone: dados.contato?.telefone || prev.fone,
        celular: dados.contato?.telefone2 || prev.celular,
        // Endereço
        cep: dados.endereco?.cep || prev.cep,
        logradouro: dados.endereco?.logradouro || prev.logradouro,
        numero: dados.endereco?.numero || prev.numero,
        complemento: dados.endereco?.complemento || prev.complemento,
        bairro: dados.endereco?.bairro || prev.bairro,
        municipio: dados.endereco?.cidade || prev.municipio,
        uf: dados.endereco?.estado || prev.uf,
      }))

      toast.success('Dados do CNPJ carregados com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar dados do CNPJ')
    } finally {
      setIsLoadingCNPJ(false)
    }
  }

  // Função para copiar endereço principal para endereço de entrega
  const copiarEnderecoPrincipal = () => {
    setFormData(prev => ({
      ...prev,
      cepEntrega: prev.cep,
      logradouroEntrega: prev.logradouro,
      numeroEntrega: prev.numero,
      complementoEntrega: prev.complemento,
      bairroEntrega: prev.bairro,
      municipioEntrega: prev.municipio,
      ufEntrega: prev.uf,
      codigoIbgeEntrega: prev.codigoIbge,
      paisEntrega: prev.pais,
      codigoPaisEntrega: prev.codigoPais,
    }))
    toast.success('Endereço copiado com sucesso!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.razaoSocial.trim()) {
      toast.error('Nome/Razão Social é obrigatório')
      return
    }

    if (!formData.cnpjCpf.trim()) {
      toast.error('CPF/CNPJ é obrigatório')
      return
    }

    try {
      setIsLoading(true)
      
      if (isEditing) {
        await clienteService.update(cliente.id, formData)
        toast.success('Cliente atualizado com sucesso!')
      } else {
        await clienteService.create(formData)
        toast.success('Cliente criado com sucesso!')
      }
      
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tipoPessoa: 'PJ', // Padrão CNPJ
      cnpjCpf: '',
      razaoSocial: '',
      status: 'Ativo',
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90vw] max-w-[90vw] w-full h-[85vh] max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? 'Atualize as informações do cliente'
                  : 'Preencha os dados para cadastrar um novo cliente'
                }
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-7 w-7 rounded-full"
            >
              <IconX className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Dados Gerais - Fora das Tabs */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Dados Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpjCpf">
                    CNPJ/CPF *
                  </Label>
                  <div className="relative">
                    <Input
                      id="cnpjCpf"
                      value={formData.cnpjCpf}
                      onChange={(e) => handleCnpjCpfChange(e.target.value)}
                      onBlur={handleCnpjCpfBlur}
                      placeholder="00.000.000/0000-00 ou 000.000.000-00"
                      disabled={isLoadingCNPJ}
                    />
                    {isLoadingCNPJ && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {isLoadingCNPJ && (
                    <p className="text-xs text-muted-foreground">
                      Buscando dados do CNPJ...
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">
                    Nome/Razão Social *
                  </Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) =>
                      setFormData({ ...formData, razaoSocial: e.target.value })
                    }
                    placeholder="Digite o nome ou razão social"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">
                    Nome Fantasia
                  </Label>
                  <Input
                    id="nomeFantasia"
                    value={formData.nomeFantasia || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeFantasia: e.target.value })
                    }
                    placeholder="Nome fantasia (opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fone">Telefone</Label>
                  <Input
                    id="fone"
                    value={formData.fone || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, fone: e.target.value })
                    }
                    placeholder="(11) 3333-3333"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.celular || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, celular: e.target.value })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ie">IE (Inscrição Estadual)</Label>
                  <Input
                    id="ie"
                    value={formData.ie || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, ie: e.target.value })
                    }
                    placeholder="Inscrição Estadual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="im">IM (Inscrição Municipal)</Label>
                  <Input
                    id="im"
                    value={formData.im || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, im: e.target.value })
                    }
                    placeholder="Inscrição Municipal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoContato">Tipo de Contato</Label>
                  <Select
                    value={formData.tipoContato || 'Cliente'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoContato: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                      <SelectItem value="Transportadora">Transportadora</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indIeDest">Indicador IE</Label>
                  <Select
                    value={formData.indIeDest?.toString() || '9'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, indIeDest: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Contribuinte ICMS</SelectItem>
                      <SelectItem value="2">2 - Isento</SelectItem>
                      <SelectItem value="9">9 - Não Contribuinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consumidorFinal">Consumidor Final</Label>
                  <Select
                    value={formData.consumidorFinal ? 'true' : 'false'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, consumidorFinal: value === 'true' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                  <Input
                    id="pontoReferencia"
                    value={formData.pontoReferencia || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, pontoReferencia: e.target.value })
                    }
                    placeholder="Ex: Próximo ao mercado"
                  />
                </div>

                {formData.tipoPessoa === 'PF' && (
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formData.dataNascimento || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dataNascimento: e.target.value })
                      }
                    />
                  </div>
                )}

                {formData.tipoPessoa === 'PJ' && (
                  <div className="space-y-2">
                    <Label htmlFor="dataAbertura">Data de Abertura</Label>
                    <Input
                      id="dataAbertura"
                      type="date"
                      value={formData.dataAbertura || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, dataAbertura: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tabs - Endereço e Financeiro */}
            <Tabs defaultValue="endereco" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
                <TabsTrigger value="endereco" className="text-sm">Endereço</TabsTrigger>
                <TabsTrigger value="financeiro" className="text-sm">Financeiro</TabsTrigger>
              </TabsList>

              <div>
                <TabsContent value="endereco" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: e.target.value })
                    }
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, logradouro: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.numero || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, numero: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, complemento: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, bairro: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipio">Cidade</Label>
                  <Input
                    id="municipio"
                    value={formData.municipio || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, municipio: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.uf || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, uf: e.target.value.toUpperCase() })
                    }
                    maxLength={2}
                    placeholder="SP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoIbge">Código IBGE</Label>
                  <Input
                    id="codigoIbge"
                    value={formData.codigoIbge || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoIbge: e.target.value })
                    }
                    placeholder="Código IBGE da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    value={formData.pais || 'BRASIL'}
                    onChange={(e) =>
                      setFormData({ ...formData, pais: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoPais">Código País</Label>
                  <Input
                    id="codigoPais"
                    value={formData.codigoPais || '1058'}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoPais: e.target.value })
                    }
                    placeholder="1058"
                  />
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Endereço de Entrega (Opcional)</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copiarEnderecoPrincipal}
                    className="h-8"
                  >
                    <IconCopy className="mr-2 h-3.5 w-3.5" />
                    Copiar Endereço Principal
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cepEntrega">CEP</Label>
                    <Input
                      id="cepEntrega"
                      value={formData.cepEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, cepEntrega: e.target.value })
                      }
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouroEntrega">Logradouro</Label>
                    <Input
                      id="logradouroEntrega"
                      value={formData.logradouroEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, logradouroEntrega: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroEntrega">Número</Label>
                    <Input
                      id="numeroEntrega"
                      value={formData.numeroEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, numeroEntrega: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complementoEntrega">Complemento</Label>
                    <Input
                      id="complementoEntrega"
                      value={formData.complementoEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, complementoEntrega: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairroEntrega">Bairro</Label>
                    <Input
                      id="bairroEntrega"
                      value={formData.bairroEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, bairroEntrega: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipioEntrega">Cidade</Label>
                    <Input
                      id="municipioEntrega"
                      value={formData.municipioEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, municipioEntrega: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ufEntrega">UF</Label>
                    <Input
                      id="ufEntrega"
                      value={formData.ufEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ufEntrega: e.target.value.toUpperCase() })
                      }
                      maxLength={2}
                      placeholder="SP"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigoIbgeEntrega">Código IBGE</Label>
                    <Input
                      id="codigoIbgeEntrega"
                      value={formData.codigoIbgeEntrega || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, codigoIbgeEntrega: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
                </TabsContent>

                <TabsContent value="financeiro" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteCredito">Limite de Crédito</Label>
                  <Input
                    id="limiteCredito"
                    type="number"
                    step="0.01"
                    value={formData.limiteCredito || ''}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        limiteCredito: parseFloat(e.target.value) || 0 
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saldoInicial">Saldo Inicial</Label>
                  <Input
                    id="saldoInicial"
                    type="number"
                    step="0.01"
                    value={formData.saldoInicial || ''}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        saldoInicial: parseFloat(e.target.value) || 0 
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prazoPagamento">Prazo de Pagamento (dias)</Label>
                  <Input
                    id="prazoPagamento"
                    type="number"
                    value={formData.prazoPagamento || ''}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        prazoPagamento: parseInt(e.target.value) || 0 
                      })
                    }
                  />
                </div>
              </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="flex-shrink-0 border-t px-4 py-3 mt-0 flex flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              size="sm"
              className="min-w-[100px]"
            >
              <IconX className="mr-2 h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingCNPJ}
              size="sm"
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="mr-2 h-3.5 w-3.5" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
