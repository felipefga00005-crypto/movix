"use client"

import { useState, useEffect } from "react"
import { IconCertificate, IconFileDescription, IconSettings, IconShield } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface EmitenteConfig {
  proximoNumeroNfe: number
  serieNfe: number
  certificadoValido: boolean
  ambienteNfe: 'PRODUCAO' | 'HOMOLOGACAO'
  regimeTributario: string
}

export function EmitenteConfigSectionCards() {
  const [config, setConfig] = useState<EmitenteConfig>({
    proximoNumeroNfe: 0,
    serieNfe: 1,
    certificadoValido: false,
    ambienteNfe: 'HOMOLOGACAO',
    regimeTributario: 'Simples Nacional',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      // Simular dados por enquanto - depois integrar com API real
      setConfig({
        proximoNumeroNfe: 1234,
        serieNfe: 1,
        certificadoValido: true,
        ambienteNfe: 'PRODUCAO',
        regimeTributario: 'Simples Nacional',
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Próximo Número NFe</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {config.proximoNumeroNfe.toString().padStart(9, '0')}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconFileDescription />
              Série {config.serieNfe}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Numeração sequencial <IconFileDescription className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Próximo número para emissão de NFe
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Certificado Digital</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {config.certificadoValido ? 'Válido' : 'Inválido'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={config.certificadoValido ? "text-green-600" : "text-red-600"}>
              <IconCertificate />
              {config.certificadoValido ? 'Ativo' : 'Expirado'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {config.certificadoValido ? 'Certificado em dia' : 'Renovação necessária'}{" "}
            <IconCertificate className={`size-4 ${config.certificadoValido ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div className="text-muted-foreground">
            Status do certificado A1/A3
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ambiente NFe</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {config.ambienteNfe === 'PRODUCAO' ? 'Produção' : 'Homologação'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={config.ambienteNfe === 'PRODUCAO' ? "text-green-600" : "text-yellow-600"}>
              <IconShield />
              {config.ambienteNfe === 'PRODUCAO' ? 'Oficial' : 'Teste'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {config.ambienteNfe === 'PRODUCAO' ? 'Ambiente oficial' : 'Ambiente de testes'}{" "}
            <IconShield className={`size-4 ${config.ambienteNfe === 'PRODUCAO' ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div className="text-muted-foreground">
            Configuração do ambiente SEFAZ
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Regime Tributário</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {config.regimeTributario}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconSettings />
              Configurado
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Regime fiscal definido <IconSettings className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Configuração tributária da emitente
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
