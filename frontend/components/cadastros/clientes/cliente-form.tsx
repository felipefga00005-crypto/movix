"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ClienteService, type CreateClienteData } from "@/lib/services/cliente.service"
import { AuxiliaresService, type Estado, type Municipio } from "@/lib/services/auxiliar.service"

interface ClienteFormProps {
  clienteId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ClienteForm({ clienteId, onSuccess, onCancel }: ClienteFormProps) {
  const [loading, setLoading] = useState(false)
  const [estados, setEstados] = useState<Estado[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [formData, setFormData] = useState<CreateClienteData>({
    tipo: 'FISICA',
    documento: '',
    nome: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cep: '',
    municipioId: '',
    estadoId: '',
    telefone: '',
    celular: '',
    email: '',
    indicadorIE: 9,
    ativo: true,
  })

  useEffect(() => {
    loadEstados()
    if (clienteId) {
      loadCliente()
    }
  }, [clienteId])

  useEffect(() => {
    if (formData.estadoId) {
      loadMunicipios(formData.estadoId)
    }
  }, [formData.estadoId])

  const loadEstados = async () => {
    try {
      const data = await AuxiliaresService.getEstados()
      setEstados(data)
    } catch (error) {
      console.error('Erro ao carregar estados:', error)
    }
  }

  const loadMunicipios = async (estadoId: string) => {
    try {
      const data = await AuxiliaresService.getMunicipiosByEstado(estadoId)
      setMunicipios(data)
    } catch (error) {
      console.error('Erro ao carregar municípios:', error)
    }
  }

  const loadCliente = async () => {
    if (!clienteId) return
    
    try {
      setLoading(true)
      const cliente = await ClienteService.getById(clienteId)
      setFormData({
        tipo: cliente.tipo,
        documento: cliente.documento,
        nome: cliente.nome,
        nomeFantasia: cliente.nomeFantasia || '',
        inscricaoEstadual: cliente.inscricaoEstadual || '',
        inscricaoMunicipal: cliente.inscricaoMunicipal || '',
        logradouro: cliente.logradouro,
        numero: cliente.numero,
        complemento: cliente.complemento || '',
        bairro: cliente.bairro,
        cep: cliente.cep,
        municipioId: cliente.municipioId,
        estadoId: cliente.estadoId,
        telefone: cliente.telefone || '',
        celular: cliente.celular || '',
        email: cliente.email || '',
        indicadorIE: cliente.indicadorIE || 9,
        ativo: cliente.ativo,
      })
    } catch (error) {
      console.error('Erro ao carregar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      if (clienteId) {
        await ClienteService.update(clienteId, formData)
      } else {
        await ClienteService.create(formData)
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateClienteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{clienteId ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
        <CardDescription>
          {clienteId ? 'Edite as informações do cliente' : 'Cadastre um novo cliente'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo e Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'FISICA' | 'JURIDICA') => handleInputChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FISICA">Pessoa Física</SelectItem>
                  <SelectItem value="JURIDICA">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">{formData.tipo === 'FISICA' ? 'CPF' : 'CNPJ'}</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => handleInputChange('documento', e.target.value)}
                placeholder={formData.tipo === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            </div>
          </div>

          {/* Nome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">{formData.tipo === 'FISICA' ? 'Nome' : 'Razão Social'}</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>
            {formData.tipo === 'JURIDICA' && (
              <div className="space-y-2">
                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                <Input
                  id="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estadoId">Estado</Label>
                <Select
                  value={formData.estadoId}
                  onValueChange={(value) => handleInputChange('estadoId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.id} value={estado.id}>
                        {estado.nome} ({estado.uf})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipioId">Município</Label>
                <Select
                  value={formData.municipioId}
                  onValueChange={(value) => handleInputChange('municipioId', value)}
                  disabled={!formData.estadoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o município" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((municipio) => (
                      <SelectItem key={municipio.id} value={municipio.id}>
                        {municipio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={formData.logradouro}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={(e) => handleInputChange('celular', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleInputChange('ativo', checked)}
            />
            <Label htmlFor="ativo">Cliente ativo</Label>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : clienteId ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
