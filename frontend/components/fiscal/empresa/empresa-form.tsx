'use client'

/**
 * Formulário de Configuração da Empresa
 * Permite editar dados fiscais da empresa
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  IconDeviceFloppy,
  IconLoader2,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconShield,
  IconSettings,
} from "@tabler/icons-react"
import type { Empresa, CreateEmpresaRequest, UF } from "@/types/empresa"

interface EmpresaFormProps {
  empresa: Empresa | null
  loading: boolean
  onSave: (empresa: Empresa) => void
}

const UFs: UF[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export function EmpresaForm({ empresa, loading, onSave }: EmpresaFormProps) {
  const [formData, setFormData] = useState<Partial<Empresa>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (empresa) {
      setFormData(empresa)
    }
  }, [empresa])

  const handleInputChange = (field: keyof Empresa, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.id) return

    setSaving(true)
    try {
      await onSave(formData as Empresa)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="dados-basicos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados-basicos" className="flex items-center gap-2">
            <IconBuilding className="h-4 w-4" />
            Dados Básicos
          </TabsTrigger>
          <TabsTrigger value="endereco" className="flex items-center gap-2">
            <IconMapPin className="h-4 w-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger value="contatos" className="flex items-center gap-2">
            <IconPhone className="h-4 w-4" />
            Contatos
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            Fiscal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados-basicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identificação da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="razao_social">Razão Social *</Label>
                  <Input
                    id="razao_social"
                    value={formData.razao_social || ""}
                    onChange={(e) => handleInputChange("razao_social", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                  <Input
                    id="nome_fantasia"
                    value={formData.nome_fantasia || ""}
                    onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj || ""}
                    onChange={(e) => handleInputChange("cnpj", e.target.value)}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    value={formData.inscricao_estadual || ""}
                    onChange={(e) => handleInputChange("inscricao_estadual", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                  <Input
                    id="inscricao_municipal"
                    value={formData.inscricao_municipal || ""}
                    onChange={(e) => handleInputChange("inscricao_municipal", e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo || false}
                    onCheckedChange={(checked) => handleInputChange("ativo", checked)}
                  />
                  <Label htmlFor="ativo">Empresa Ativa</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endereço da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.cep || ""}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF *</Label>
                  <Select
                    value={formData.uf || ""}
                    onValueChange={(value) => handleInputChange("uf", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UFs.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ""}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro || ""}
                    onChange={(e) => handleInputChange("logradouro", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={formData.numero || ""}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento || ""}
                    onChange={(e) => handleInputChange("complemento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro || ""}
                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contatos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ""}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Site</Label>
                <Input
                  id="site"
                  value={formData.site || ""}
                  onChange={(e) => handleInputChange("site", e.target.value)}
                  placeholder="https://www.exemplo.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regime_tributario">Regime Tributário *</Label>
                  <Select
                    value={formData.regime_tributario?.toString() || ""}
                    onValueChange={(value) => handleInputChange("regime_tributario", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Simples Nacional</SelectItem>
                      <SelectItem value="2">Simples Nacional - Excesso</SelectItem>
                      <SelectItem value="3">Regime Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ambiente_nfe">Ambiente NFe *</Label>
                  <Select
                    value={formData.ambiente_nfe?.toString() || ""}
                    onValueChange={(value) => handleInputChange("ambiente_nfe", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Produção</SelectItem>
                      <SelectItem value="2">Homologação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie_nfce">Série NFCe *</Label>
                  <Input
                    id="serie_nfce"
                    type="number"
                    value={formData.serie_nfce || ""}
                    onChange={(e) => handleInputChange("serie_nfce", parseInt(e.target.value))}
                    min="1"
                    max="999"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximo_numero_nfce">Próximo Número NFCe</Label>
                  <Input
                    id="proximo_numero_nfce"
                    type="number"
                    value={formData.proximo_numero_nfce || ""}
                    onChange={(e) => handleInputChange("proximo_numero_nfce", parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="csc_id">CSC ID</Label>
                  <Input
                    id="csc_id"
                    type="number"
                    value={formData.csc_id || ""}
                    onChange={(e) => handleInputChange("csc_id", parseInt(e.target.value))}
                    min="1"
                    max="999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csc">CSC (Código de Segurança do Contribuinte)</Label>
                  <Input
                    id="csc"
                    value={formData.csc || ""}
                    onChange={(e) => handleInputChange("csc", e.target.value)}
                    placeholder="Código fornecido pela SEFAZ"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button type="submit" disabled={saving || loading}>
          {saving ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
