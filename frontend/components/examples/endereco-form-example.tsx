"use client"

// ============================================
// EXEMPLO DE FORMULÁRIO COM APIS AUTOMÁTICAS
// ============================================

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  IconMapPin, 
  IconLoader2, 
  IconCheck, 
  IconX,
  IconSearch,
  IconBuilding
} from "@tabler/icons-react"

// Importa os hooks das APIs externas
import { externalApisService } from "@/lib/api/external-apis"
import type { Endereco, Estado, Cidade } from "@/lib/api/external-apis"

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function EnderecoFormExample() {
  // Estados do formulário
  const [cep, setCep] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState<Endereco | null>(null)
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estadoSelecionado, setEstadoSelecionado] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  
  // Estados de loading
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [loadingCNPJ, setLoadingCNPJ] = useState(false)
  const [loadingEstados, setLoadingEstados] = useState(false)
  const [loadingCidades, setLoadingCidades] = useState(false)
  
  // Estados de erro
  const [errorCEP, setErrorCEP] = useState<string | null>(null)
  const [errorCNPJ, setErrorCNPJ] = useState<string | null>(null)

  // ============================================
  // CARREGA ESTADOS AO MONTAR
  // ============================================
  
  useEffect(() => {
    const carregarEstados = async () => {
      setLoadingEstados(true)
      try {
        const estadosData = await externalApisService.buscarEstados()
        setEstados(estadosData)
      } catch (error) {
        console.error('Erro ao carregar estados:', error)
      } finally {
        setLoadingEstados(false)
      }
    }

    carregarEstados()
  }, [])

  // ============================================
  // FUNÇÕES DE BUSCA
  // ============================================

  const buscarCEP = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) return

    setLoadingCEP(true)
    setErrorCEP(null)

    try {
      const enderecoData = await externalApisService.buscarCEP(cep)
      setEndereco(enderecoData)
      
      // Busca as cidades do estado automaticamente
      if (enderecoData.estado) {
        setEstadoSelecionado(enderecoData.estado)
        await buscarCidades(enderecoData.estado)
        setCidadeSelecionada(enderecoData.cidade)
      }
    } catch (error) {
      setErrorCEP(error instanceof Error ? error.message : 'Erro ao buscar CEP')
      setEndereco(null)
    } finally {
      setLoadingCEP(false)
    }
  }

  const buscarCNPJ = async () => {
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) return

    setLoadingCNPJ(true)
    setErrorCNPJ(null)

    try {
      const empresaData = await externalApisService.buscarCNPJ(cnpj)
      
      // Preenche automaticamente o CEP e busca o endereço
      if (empresaData.endereco.cep) {
        setCep(empresaData.endereco.cep)
        setEndereco(empresaData.endereco)
        
        // Busca as cidades do estado
        if (empresaData.endereco.estado) {
          setEstadoSelecionado(empresaData.endereco.estado)
          await buscarCidades(empresaData.endereco.estado)
          setCidadeSelecionada(empresaData.endereco.cidade)
        }
      }
    } catch (error) {
      setErrorCNPJ(error instanceof Error ? error.message : 'Erro ao buscar CNPJ')
    } finally {
      setLoadingCNPJ(false)
    }
  }

  const buscarCidades = async (uf: string) => {
    if (!uf) return

    setLoadingCidades(true)
    try {
      const cidadesData = await externalApisService.buscarCidades(uf)
      setCidades(cidadesData)
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
    } finally {
      setLoadingCidades(false)
    }
  }

  const limparFormulario = () => {
    setCep('')
    setCnpj('')
    setEndereco(null)
    setEstadoSelecionado('')
    setCidadeSelecionada('')
    setCidades([])
    setErrorCEP(null)
    setErrorCNPJ(null)
  }

  // ============================================
  // FORMATAÇÃO
  // ============================================

  const formatarCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return value
  }

  const formatarCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            Exemplo: Formulário com APIs Automáticas
          </CardTitle>
          <CardDescription>
            Demonstração de integração com CEP, CNPJ e localização usando cache inteligente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Seção CEP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4" />
              <Label className="text-sm font-medium">Busca por CEP</Label>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatarCEP(e.target.value))}
                  maxLength={9}
                />
              </div>
              <Button 
                onClick={buscarCEP}
                disabled={loadingCEP || cep.replace(/\D/g, '').length !== 8}
                size="sm"
              >
                {loadingCEP ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSearch className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>
            
            {errorCEP && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <IconX className="h-4 w-4" />
                {errorCEP}
              </div>
            )}
          </div>

          <Separator />

          {/* Seção CNPJ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconBuilding className="h-4 w-4" />
              <Label className="text-sm font-medium">Busca por CNPJ</Label>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatarCNPJ(e.target.value))}
                  maxLength={18}
                />
              </div>
              <Button 
                onClick={buscarCNPJ}
                disabled={loadingCNPJ || cnpj.replace(/\D/g, '').length !== 14}
                size="sm"
              >
                {loadingCNPJ ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSearch className="h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>
            
            {errorCNPJ && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <IconX className="h-4 w-4" />
                {errorCNPJ}
              </div>
            )}
          </div>

          <Separator />

          {/* Resultado do Endereço */}
          {endereco && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-600" />
                <Label className="text-sm font-medium">Endereço Encontrado</Label>
                <Badge variant="secondary">Cache Inteligente</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Logradouro</Label>
                  <p className="text-sm font-medium">{endereco.logradouro}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bairro</Label>
                  <p className="text-sm font-medium">{endereco.bairro}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cidade</Label>
                  <p className="text-sm font-medium">{endereco.cidade}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estado</Label>
                  <p className="text-sm font-medium">{endereco.estado}</p>
                </div>
                {endereco.latitude && endereco.longitude && (
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Coordenadas</Label>
                    <p className="text-sm font-medium">
                      {endereco.latitude}, {endereco.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Seleção Manual */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Seleção Manual (Cache Local)</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <Select 
                  value={estadoSelecionado} 
                  onValueChange={(value) => {
                    setEstadoSelecionado(value)
                    setCidadeSelecionada('')
                    buscarCidades(value)
                  }}
                  disabled={loadingEstados}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.sigla} value={estado.sigla}>
                        {estado.nome} ({estado.sigla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Cidade</Label>
                <Select 
                  value={cidadeSelecionada} 
                  onValueChange={setCidadeSelecionada}
                  disabled={loadingCidades || !estadoSelecionado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map((cidade) => (
                      <SelectItem key={cidade.codigo_ibge} value={cidade.nome}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loadingCidades && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Carregando cidades...
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button onClick={limparFormulario} variant="outline" size="sm">
              Limpar Formulário
            </Button>
            <Button size="sm">
              Salvar Endereço
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sistema de Cache Inteligente</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>✅ <strong>Estados e Cidades:</strong> Cache permanente no banco (atualização automática a cada 30 dias)</p>
          <p>✅ <strong>CEP:</strong> Consulta sempre atualizada (BrasilAPI + ViaCEP como fallback)</p>
          <p>✅ <strong>CNPJ:</strong> Consulta sempre atualizada (dados podem mudar)</p>
          <p>✅ <strong>Performance:</strong> Primeira consulta lenta, demais instantâneas</p>
        </CardContent>
      </Card>
    </div>
  )
}
