'use client'

/**
 * Formulário de Fornecedor
 * Componente para criar/editar fornecedores
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fornecedorService } from '@/lib/services/fornecedor.service'
import { externalApiService } from '@/lib/services/external-api.service'
import type { Fornecedor, CreateFornecedorRequest } from '@/types/fornecedor'
import { toast } from 'sonner'

interface FornecedorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fornecedor?: Fornecedor | null
  onSuccess?: () => void
}

export function FornecedorForm({
  open,
  onOpenChange,
  fornecedor,
  onSuccess,
}: FornecedorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false)
  const [formData, setFormData] = useState<CreateFornecedorRequest>({
    tipoPessoa: 'PJ', // Padrão CNPJ para fornecedores
    cnpjCpf: '',
    razaoSocial: '',
    status: 'Ativo',
    categoria: 'Distribuidor',
  })

  const isEditing = !!fornecedor

  // Carregar dados do fornecedor quando estiver editando
  useEffect(() => {
    if (fornecedor && open) {
      setFormData({
        tipoPessoa: fornecedor.tipo_pessoa || 'PJ',
        cnpjCpf: fornecedor.cnpj_cpf || '',
        razaoSocial: fornecedor.razao_social || '',
        nomeFantasia: fornecedor.nome_fantasia || '',
        ie: fornecedor.ie || '',
        im: fornecedor.im || '',
        indIeDest: fornecedor.ind_ie_dest || 1, // Contribuinte por padrão para fornecedores
        categoria: fornecedor.categoria || 'Distribuidor',
        status: fornecedor.status || 'Ativo',
        email: fornecedor.email || '',
        fone: fornecedor.fone || '',
        celular: fornecedor.celular || '',
        site: fornecedor.site || '',
        pontoReferencia: fornecedor.ponto_referencia || '',
        // Contato Principal
        nomeContato: fornecedor.nome_contato || '',
        cargoContato: fornecedor.cargo_contato || '',
        telefoneContato: fornecedor.telefone_contato || '',
        emailContato: fornecedor.email_contato || '',
        // Endereço Principal
        cep: fornecedor.cep || '',
        logradouro: fornecedor.logradouro || '',
        numero: fornecedor.numero || '',
        complemento: fornecedor.complemento || '',
        bairro: fornecedor.bairro || '',
        municipio: fornecedor.municipio || '',
        uf: fornecedor.uf || '',
        codigoIbge: fornecedor.codigo_ibge || '',
        pais: fornecedor.pais || 'BRASIL',
        codigoPais: fornecedor.codigo_pais || '1058',
        // Dados Comerciais
        prazoPagamento: fornecedor.prazo_pagamento || 0,
        limiteCompra: fornecedor.limite_compra || 0,
        descontoNegociado: fornecedor.desconto_negociado || 0,
        freteMinimo: fornecedor.frete_minimo || 0,
        pedidoMinimo: fornecedor.pedido_minimo || 0,
        prazoEntrega: fornecedor.prazo_entrega || 0,
        // Dados Bancários
        banco: fornecedor.banco || '',
        agencia: fornecedor.agencia || '',
        conta: fornecedor.conta || '',
        tipoConta: fornecedor.tipo_conta || '',
        pix: fornecedor.pix || '',
        // Observações
        observacoes: fornecedor.observacoes || '',
        anotacoes: fornecedor.anotacoes || '',
        // Datas
        dataAbertura: fornecedor.data_abertura || '',
        proximoContato: fornecedor.proximo_contato || '',
      })
    } else if (!open) {
      // Resetar quando fechar
      resetForm()
    }
  }, [fornecedor, open])

  // Função para detectar automaticamente o tipo de pessoa baseado no CNPJ/CPF
  const detectarTipoPessoa = (cnpjCpf: string): 'PF' | 'PJ' => {
    const apenasNumeros = cnpjCpf.replace(/\D/g, '')
    if (apenasNumeros.length === 11) {
      return 'PF' // CPF tem 11 dígitos
    } else {
      return 'PJ' // CNPJ tem 14 dígitos (padrão)
    }
  }

  // Handler para mudança no campo CNPJ/CPF
  const handleCnpjCpfChange = (value: string) => {
    setFormData({
      ...formData,
      cnpjCpf: value
    })
  }

  // Handler para quando o usuário sai do campo CNPJ/CPF
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
        site: dados.site || prev.site,
        // Endereço
        cep: dados.endereco?.cep || prev.cep,
        logradouro: dados.endereco?.logradouro || prev.logradouro,
        numero: dados.endereco?.numero || prev.numero,
        complemento: dados.endereco?.complemento || prev.complemento,
        bairro: dados.endereco?.bairro || prev.bairro,
        municipio: dados.endereco?.cidade || prev.municipio,
        uf: dados.endereco?.estado || prev.uf,
        // Data de abertura
        dataAbertura: dados.data_abertura || prev.dataAbertura,
      }))

      toast.success('Dados do CNPJ carregados com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar dados do CNPJ')
    } finally {
      setIsLoadingCNPJ(false)
    }
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
        await fornecedorService.update(fornecedor.id, formData)
        toast.success('Fornecedor atualizado com sucesso!')
      } else {
        await fornecedorService.create(formData)
        toast.success('Fornecedor criado com sucesso!')
      }
      
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar fornecedor')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tipoPessoa: 'PJ',
      cnpjCpf: '',
      razaoSocial: '',
      status: 'Ativo',
      categoria: 'Distribuidor',
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[95vw] max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? 'Atualize as informações do fornecedor'
                  : 'Preencha os dados para cadastrar um novo fornecedor'
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
              </div>
            </div>

            {/* Tabs - Contatos, Endereço, Comercial, Bancário */}
            <Tabs defaultValue="contatos" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4 h-9">
                <TabsTrigger value="contatos" className="text-sm">Contatos</TabsTrigger>
                <TabsTrigger value="endereco" className="text-sm">Endereço</TabsTrigger>
                <TabsTrigger value="comercial" className="text-sm">Comercial</TabsTrigger>
                <TabsTrigger value="bancario" className="text-sm">Bancário</TabsTrigger>
              </TabsList>

              <div>
                <TabsContent value="contatos" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@empresa.com"
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
                      <Label htmlFor="site">Website</Label>
                      <Input
                        id="site"
                        value={formData.site || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, site: e.target.value })
                        }
                        placeholder="https://www.empresa.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select
                        value={formData.categoria || 'Distribuidor'}
                        onValueChange={(value) =>
                          setFormData({ ...formData, categoria: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                          <SelectItem value="Fabricante">Fabricante</SelectItem>
                          <SelectItem value="Importador">Importador</SelectItem>
                          <SelectItem value="Prestador de Serviço">Prestador de Serviço</SelectItem>
                          <SelectItem value="Atacadista">Atacadista</SelectItem>
                          <SelectItem value="Varejista">Varejista</SelectItem>
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
                          <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="indIeDest">Indicador IE</Label>
                      <Select
                        value={formData.indIeDest?.toString() || '1'}
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
                  </div>

                  {/* Contato Principal */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contato Principal (Opcional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeContato">Nome do Contato</Label>
                        <Input
                          id="nomeContato"
                          value={formData.nomeContato || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, nomeContato: e.target.value })
                          }
                          placeholder="Nome do responsável"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cargoContato">Cargo</Label>
                        <Input
                          id="cargoContato"
                          value={formData.cargoContato || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, cargoContato: e.target.value })
                          }
                          placeholder="Cargo do responsável"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefoneContato">Telefone Direto</Label>
                        <Input
                          id="telefoneContato"
                          value={formData.telefoneContato || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, telefoneContato: e.target.value })
                          }
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailContato">Email Direto</Label>
                        <Input
                          id="emailContato"
                          type="email"
                          value={formData.emailContato || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, emailContato: e.target.value })
                          }
                          placeholder="contato@empresa.com"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

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
                        placeholder="Rua, Avenida, etc."
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
                        placeholder="123"
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
                        placeholder="Sala, Andar, etc."
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
                        placeholder="Nome do bairro"
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
                        placeholder="Nome da cidade"
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
                        placeholder="BRASIL"
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

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pontoReferencia">Ponto de Referência</Label>
                      <Input
                        id="pontoReferencia"
                        value={formData.pontoReferencia || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, pontoReferencia: e.target.value })
                        }
                        placeholder="Ex: Próximo ao shopping"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comercial" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prazoPagamento">Prazo de Pagamento (dias)</Label>
                      <Input
                        id="prazoPagamento"
                        type="number"
                        min="0"
                        value={formData.prazoPagamento || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prazoPagamento: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limiteCompra">Limite de Compra (R$)</Label>
                      <Input
                        id="limiteCompra"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.limiteCompra || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            limiteCompra: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="10000.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descontoNegociado">Desconto Negociado (%)</Label>
                      <Input
                        id="descontoNegociado"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.descontoNegociado || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descontoNegociado: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="5.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="freteMinimo">Frete Mínimo (R$)</Label>
                      <Input
                        id="freteMinimo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.freteMinimo || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            freteMinimo: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="50.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pedidoMinimo">Pedido Mínimo (R$)</Label>
                      <Input
                        id="pedidoMinimo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pedidoMinimo || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pedidoMinimo: parseFloat(e.target.value) || 0
                          })
                        }
                        placeholder="500.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prazoEntrega">Prazo de Entrega (dias)</Label>
                      <Input
                        id="prazoEntrega"
                        type="number"
                        min="0"
                        value={formData.prazoEntrega || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            prazoEntrega: parseInt(e.target.value) || 0
                          })
                        }
                        placeholder="7"
                      />
                    </div>

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

                    <div className="space-y-2">
                      <Label htmlFor="proximoContato">Próximo Contato</Label>
                      <Input
                        id="proximoContato"
                        type="date"
                        value={formData.proximoContato || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, proximoContato: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Observações</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações Gerais</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, observacoes: e.target.value })
                          }
                          placeholder="Observações sobre o fornecedor..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="anotacoes">Anotações Internas</Label>
                        <Textarea
                          id="anotacoes"
                          value={formData.anotacoes || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, anotacoes: e.target.value })
                          }
                          placeholder="Anotações internas sobre o fornecedor..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bancario" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="banco">Banco</Label>
                      <Input
                        id="banco"
                        value={formData.banco || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, banco: e.target.value })
                        }
                        placeholder="Nome do banco"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agencia">Agência</Label>
                      <Input
                        id="agencia"
                        value={formData.agencia || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, agencia: e.target.value })
                        }
                        placeholder="0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conta">Conta</Label>
                      <Input
                        id="conta"
                        value={formData.conta || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, conta: e.target.value })
                        }
                        placeholder="00000-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipoConta">Tipo de Conta</Label>
                      <Select
                        value={formData.tipoConta || ''}
                        onValueChange={(value) =>
                          setFormData({ ...formData, tipoConta: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corrente">Conta Corrente</SelectItem>
                          <SelectItem value="Poupança">Conta Poupança</SelectItem>
                          <SelectItem value="Salário">Conta Salário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pix">Chave PIX</Label>
                      <Input
                        id="pix"
                        value={formData.pix || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, pix: e.target.value })
                        }
                        placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      <strong>Nota:</strong> Os dados bancários são utilizados para pagamentos e transferências.
                      Certifique-se de que as informações estão corretas.
                    </p>
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
