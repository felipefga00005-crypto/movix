"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconUserCheck, IconUserX, IconClock, IconShield } from "@tabler/icons-react"
import { Usuario, UsuarioStats } from "@/types/usuario"
import { usuarioUtils } from "@/lib/api/usuarios"

interface UsuarioStatsCardsProps {
  usuarios: Usuario[]
  stats?: UsuarioStats
  isLoading?: boolean
}

export function UsuarioStatsCards({ usuarios, stats, isLoading }: UsuarioStatsCardsProps) {
  // Calcular estatísticas localmente se não fornecidas
  const localStats = React.useMemo(() => {
    if (stats) return stats

    const total = usuarios.length
    const ativos = usuarios.filter(u => u.status === "Ativo").length
    const inativos = usuarios.filter(u => u.status === "Inativo").length
    const pendentes = usuarios.filter(u => u.status === "Pendente").length
    const bloqueados = usuarios.filter(u => u.status === "Bloqueado").length

    // Contar por perfil
    const porPerfil: Record<string, number> = {}
    usuarios.forEach(usuario => {
      porPerfil[usuario.perfil] = (porPerfil[usuario.perfil] || 0) + 1
    })

    // Contar por departamento
    const porDepartamento: Record<string, number> = {}
    usuarios.forEach(usuario => {
      if (usuario.departamento) {
        porDepartamento[usuario.departamento] = (porDepartamento[usuario.departamento] || 0) + 1
      }
    })

    // Usuários online (simulado - último acesso < 5 min)
    const usuariosOnline = usuarios.filter(u => usuarioUtils.isOnline(u.ultimoAcesso)).length

    return {
      total,
      ativos,
      inativos,
      pendentes,
      bloqueados,
      porPerfil,
      porDepartamento,
      ultimosAcessos: [],
      usuariosOnline,
      novosCadastros: {
        hoje: 0,
        semana: 0,
        mes: 0
      }
    }
  }, [usuarios, stats])

  const cards = [
    {
      title: "Total de Usuários",
      value: localStats.total,
      icon: IconUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "usuários cadastrados"
    },
    {
      title: "Usuários Ativos",
      value: localStats.ativos,
      icon: IconUserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: `${localStats.total > 0 ? ((localStats.ativos / localStats.total) * 100).toFixed(1) : 0}% do total`
    },
    {
      title: "Usuários Online",
      value: localStats.usuariosOnline,
      icon: IconShield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "conectados agora"
    },
    {
      title: "Pendentes",
      value: localStats.pendentes + localStats.bloqueados,
      icon: IconClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "aguardando ação"
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Card de perfis */}
      {Object.keys(localStats.porPerfil).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usuários por Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localStats.porPerfil)
                .sort(([, a], [, b]) => b - a)
                .map(([perfil, quantidade]) => (
                  <Badge key={perfil} variant="secondary" className="text-sm">
                    {usuarioUtils.getPerfilName(perfil as any)}: {quantidade}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de departamentos */}
      {Object.keys(localStats.porDepartamento).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usuários por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(localStats.porDepartamento)
                .sort(([, a], [, b]) => b - a)
                .map(([departamento, quantidade]) => (
                  <Badge key={departamento} variant="outline" className="text-sm">
                    {departamento}: {quantidade}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo rápido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Resumo de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Taxa de Ativação</p>
              <p className="font-semibold text-green-600">
                {localStats.total > 0 ? ((localStats.ativos / localStats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Maior Perfil</p>
              <p className="font-semibold">
                {Object.entries(localStats.porPerfil).length > 0
                  ? usuarioUtils.getPerfilName(Object.entries(localStats.porPerfil).reduce((a, b) => a[1] > b[1] ? a : b)[0] as any)
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Usuários Bloqueados</p>
              <p className={`font-semibold ${localStats.bloqueados > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {localStats.bloqueados}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Geral</p>
              <p className="font-semibold">
                {localStats.ativos > localStats.inativos && localStats.bloqueados === 0 ? (
                  <span className="text-green-600">Saudável</span>
                ) : localStats.bloqueados > 0 ? (
                  <span className="text-red-600">Atenção</span>
                ) : (
                  <span className="text-yellow-600">Moderado</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de segurança */}
      {(localStats.bloqueados > 0 || localStats.pendentes > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-yellow-700 text-sm">
              {localStats.bloqueados > 0 && (
                <p>• {localStats.bloqueados} usuário{localStats.bloqueados > 1 ? 's' : ''} bloqueado{localStats.bloqueados > 1 ? 's' : ''}</p>
              )}
              {localStats.pendentes > 0 && (
                <p>• {localStats.pendentes} usuário{localStats.pendentes > 1 ? 's' : ''} pendente{localStats.pendentes > 1 ? 's' : ''} de aprovação</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
