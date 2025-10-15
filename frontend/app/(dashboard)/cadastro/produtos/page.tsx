'use client'

/**
 * Página de Cadastro de Produtos
 * Gerenciamento completo de produtos com integração ao backend
 */

import { useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function ProdutosPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
              <p className="text-muted-foreground">
                Gerencie o cadastro de produtos do sistema
              </p>
            </div>
          </div>

          {/* Placeholder content */}
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                Página em Desenvolvimento
              </h3>
              <p className="text-sm text-muted-foreground">
                A página de produtos está sendo desenvolvida.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
