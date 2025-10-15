'use client'

/**
 * Formulário de Cliente
 * Componente para criar/editar clientes
 */

import { useState } from 'react'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
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
  const [formData, setFormData] = useState<CreateClienteRequest>({
    tipoPessoa: 'PF',
    cnpjCpf: '',
    razaoSocial: '',
    status: 'Ativo',
  })

  const isEditing = !!cliente

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
      tipoPessoa: 'PF',
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
        className="max-w-[95vw] w-full max-h-[95vh] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex-shrink-0 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
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
              className="h-8 w-8 rounded-full"
            >
              <IconX className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
            <Tabs defaultValue="dados-basicos" className="w-full flex flex-col flex-1 overflow-hidden">
              <TabsList className="grid w-full grid-cols-3 flex-shrink-0 mb-6 h-10">
              <TabsTrigger value="dados-basicos">Dados Básicos</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="dados-basicos" className="space-y-6 h-full overflow-y-auto p-1 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoPessoa">Tipo de Pessoa *</Label>
                  <Select
                    value={formData.tipoPessoa}
                    onValueChange={(value: 'PF' | 'PJ') =>
                      setFormData({ ...formData, tipoPessoa: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">Pessoa Física</SelectItem>
                      <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpjCpf">
                    {formData.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} *
                  </Label>
                  <Input
                    id="cnpjCpf"
                    value={formData.cnpjCpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpjCpf: e.target.value })
                    }
                    placeholder={
                      formData.tipoPessoa === 'PF' 
                        ? '000.000.000-00' 
                        : '00.000.000/0000-00'
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">
                    {formData.tipoPessoa === 'PF' ? 'Nome Completo' : 'Razão Social'} *
                  </Label>
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) =>
                      setFormData({ ...formData, razaoSocial: e.target.value })
                    }
                  />
                </div>

                {formData.tipoPessoa === 'PJ' && (
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={formData.nomeFantasia || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, nomeFantasia: e.target.value })
                      }
                    />
                  </div>
                )}

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
                    placeholder="(11) 99999-9999"
                  />
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
              </div>
                </TabsContent>

                <TabsContent value="endereco" className="space-y-6 h-full overflow-y-auto p-1 mt-0">
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
                      setFormData({ ...formData, uf: e.target.value })
                    }
                    maxLength={2}
                  />
                </div>
              </div>
                </TabsContent>

                <TabsContent value="financeiro" className="space-y-4 h-full overflow-y-auto p-1">
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

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-0 gap-3">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 sm:flex-none">
              <IconX className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
