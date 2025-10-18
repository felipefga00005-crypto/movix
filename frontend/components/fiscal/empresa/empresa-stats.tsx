'use client'

/**
 * Componente de Estatísticas da Empresa
 * Mostra informações importantes sobre configuração fiscal
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconBuilding,
  IconCertificate,
  IconShield,
  IconCalendar,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react"
import type { Empresa } from "@/types/empresa"

interface EmpresaStatsComponentProps {
  empresa: Empresa | null
}

export function EmpresaStatsComponent({ empresa }: EmpresaStatsComponentProps) {
  if (!empresa) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getRegimeTributarioLabel = (regime: number) => {
    const regimes: Record<number, string> = {
      1: "Simples Nacional",
      2: "Simples Nacional - Excesso",
      3: "Regime Normal",
    }
    return regimes[regime] || "Não informado"
  }

  const getAmbienteLabel = (ambiente: number) => {
    return ambiente === 1 ? "Produção" : "Homologação"
  }

  const getAmbienteBadgeVariant = (ambiente: number) => {
    return ambiente === 1 ? "default" : "secondary"
  }

  const getCertificadoStatus = () => {
    if (!empresa.certificado_a1) {
      return {
        status: "Não configurado",
        variant: "destructive" as const,
        icon: <IconX className="h-4 w-4" />,
      }
    }

    if (empresa.certificado_valido_ate) {
      const validoAte = new Date(empresa.certificado_valido_ate)
      const hoje = new Date()
      const diasParaVencer = Math.ceil((validoAte.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

      if (diasParaVencer < 0) {
        return {
          status: "Vencido",
          variant: "destructive" as const,
          icon: <IconX className="h-4 w-4" />,
        }
      } else if (diasParaVencer <= 30) {
        return {
          status: `Vence em ${diasParaVencer} dias`,
          variant: "outline" as const,
          icon: <IconAlertTriangle className="h-4 w-4" />,
        }
      } else {
        return {
          status: "Válido",
          variant: "default" as const,
          icon: <IconCheck className="h-4 w-4" />,
        }
      }
    }

    return {
      status: "Configurado",
      variant: "secondary" as const,
      icon: <IconCertificate className="h-4 w-4" />,
    }
  }

  const certificadoStatus = getCertificadoStatus()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Status da Empresa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status da Empresa</CardTitle>
          <IconBuilding className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant={empresa.ativo ? "default" : "destructive"}>
              {empresa.ativo ? "Ativa" : "Inativa"}
            </Badge>
            <p className="text-xs text-muted-foreground">
              CNPJ: {empresa.cnpj}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regime Tributário */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regime Tributário</CardTitle>
          <IconShield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {getRegimeTributarioLabel(empresa.regime_tributario)}
            </div>
            <p className="text-xs text-muted-foreground">
              {empresa.inscricao_estadual ? `IE: ${empresa.inscricao_estadual}` : "Sem IE"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ambiente NFe */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ambiente NFe</CardTitle>
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant={getAmbienteBadgeVariant(empresa.ambiente_nfe)}>
              {getAmbienteLabel(empresa.ambiente_nfe)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Série NFCe: {empresa.serie_nfce}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Certificado Digital */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certificado Digital</CardTitle>
          <IconCertificate className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Badge variant={certificadoStatus.variant} className="flex items-center gap-1">
              {certificadoStatus.icon}
              {certificadoStatus.status}
            </Badge>
            {empresa.certificado_valido_ate && (
              <p className="text-xs text-muted-foreground">
                Válido até: {new Date(empresa.certificado_valido_ate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm">Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Razão Social:</span>
              <div className="font-medium">{empresa.razao_social}</div>
            </div>
            {empresa.nome_fantasia && (
              <div>
                <span className="text-muted-foreground">Nome Fantasia:</span>
                <div className="font-medium">{empresa.nome_fantasia}</div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">UF:</span>
              <div className="font-medium">{empresa.uf}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Cidade:</span>
              <div className="font-medium">{empresa.cidade || "Não informada"}</div>
            </div>
            {empresa.email && (
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="font-medium">{empresa.email}</div>
              </div>
            )}
            {empresa.telefone && (
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <div className="font-medium">{empresa.telefone}</div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Próximo Número NFCe:</span>
              <div className="font-medium">{empresa.proximo_numero_nfce}</div>
            </div>
            <div>
              <span className="text-muted-foreground">CSC ID:</span>
              <div className="font-medium">{empresa.csc_id || "Não configurado"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
