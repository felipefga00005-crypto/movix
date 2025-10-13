"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Mapeamento de rotas para títulos e descrições
const routeMap: Record<string, { title: string; description?: string }> = {
  "/dashboard": { title: "Dashboard", description: "Visão geral do sistema" },
  "/pdv": { title: "PDV", description: "Ponto de Venda" },
  "/fiscal": { title: "Fiscal", description: "Gestão Fiscal e Tributária" },
  "/fiscal/nfe": { title: "NF-e", description: "Nota Fiscal Eletrônica" },
  "/fiscal/nfce": { title: "NFC-e", description: "Cupom Fiscal Eletrônico" },
  "/fiscal/cte": { title: "CT-e", description: "Conhecimento de Transporte Eletrônico" },
  "/fiscal/mdfe": { title: "MDF-e", description: "Manifesto Eletrônico de Documentos Fiscais" },
  "/estoque": { title: "Estoque", description: "Controle de Estoque" },
  "/financeiro": { title: "Financeiro", description: "Gestão Financeira" },
  "/cadastros": { title: "Cadastros", description: "Cadastros Gerais" },
  "/cadastros/clientes": { title: "Clientes", description: "Cadastro de Clientes" },
  "/cadastros/produtos": { title: "Produtos", description: "Cadastro de Produtos" },
  "/cadastros/fornecedores": { title: "Fornecedores", description: "Cadastro de Fornecedores" },
  "/cadastros/usuarios": { title: "Usuários", description: "Cadastro de Usuários" },
  "/relatorios": { title: "Relatórios", description: "Relatórios Gerenciais" },
  "/configuracoes": { title: "Configurações", description: "Configurações do Sistema" },
}

export function SiteHeader() {
  const pathname = usePathname()

  // Busca informações da rota atual
  let currentRoute = routeMap[pathname]

  // Verifica se é uma rota dinâmica de cliente
  if (!currentRoute && pathname.startsWith("/cadastros/clientes/")) {
    currentRoute = { title: "Clientes", description: "Detalhes do Cliente" }
  }

  // Fallback padrão
  if (!currentRoute) {
    currentRoute = { title: "Movix ERP" }
  }
  
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col">
          <h1 className="text-base font-medium">{currentRoute.title}</h1>
          {currentRoute.description && (
            <p className="text-xs text-muted-foreground">{currentRoute.description}</p>
          )}
        </div>
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
