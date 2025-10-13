import { AppSidebar } from "@/components/app-sidebar"
import { SectionCards } from "@/components/template/section-cards"
import { SiteHeader } from "@/components/template/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconDashboard, IconTrendingUp, IconUsers, IconPackage, IconBuilding, IconUserCheck } from "@tabler/icons-react"

export default function Home() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* Header */}
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <IconDashboard className="h-6 w-6" />
                      Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Visão geral do sistema de gestão Movix
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <SectionCards />

              {/* Quick Actions */}
              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>
                      Acesse rapidamente as principais funcionalidades do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <a
                        href="/cadastros/clientes"
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <IconUsers className="h-8 w-8 text-blue-500" />
                        <div>
                          <div className="font-medium">Clientes</div>
                          <div className="text-sm text-muted-foreground">Gerenciar clientes</div>
                        </div>
                      </a>
                      <a
                        href="/cadastros/fornecedores"
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <IconBuilding className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="font-medium">Fornecedores</div>
                          <div className="text-sm text-muted-foreground">Gerenciar fornecedores</div>
                        </div>
                      </a>
                      <a
                        href="/cadastros/produtos"
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <IconPackage className="h-8 w-8 text-purple-500" />
                        <div>
                          <div className="font-medium">Produtos</div>
                          <div className="text-sm text-muted-foreground">Gerenciar produtos</div>
                        </div>
                      </a>
                      <a
                        href="/cadastros/usuarios"
                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <IconUserCheck className="h-8 w-8 text-orange-500" />
                        <div>
                          <div className="font-medium">Usuários</div>
                          <div className="text-sm text-muted-foreground">Gerenciar usuários</div>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
