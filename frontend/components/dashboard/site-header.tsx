'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface SiteHeaderProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const pathname = usePathname()

  // Gerar breadcrumbs automaticamente se não fornecidos
  const defaultBreadcrumbs = generateBreadcrumbs(pathname)
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {finalBreadcrumbs.map((item, index) => (
              <React.Fragment key={`breadcrumb-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href && index < finalBreadcrumbs.length - 1 ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/movix-erp"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' }
  ]

  let currentPath = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    // Pular o primeiro segmento se for 'dashboard'
    if (segment === 'dashboard') continue

    const label = formatSegmentLabel(segment)
    const isLast = i === segments.length - 1

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath
    })
  }

  return breadcrumbs
}

function formatSegmentLabel(segment: string): string {
  const labels: Record<string, string> = {
    'cadastro': 'Cadastro',
    'clientes': 'Clientes',
    'produtos': 'Produtos',
    'fornecedores': 'Fornecedores',
    'usuarios': 'Usuários',
    'relatorios': 'Relatórios',
    'configuracoes': 'Configurações',
    'pdv': 'PDV',
    'vendas': 'Vendas',
    'estoque': 'Estoque',
    'financeiro': 'Financeiro',
  }

  return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}
