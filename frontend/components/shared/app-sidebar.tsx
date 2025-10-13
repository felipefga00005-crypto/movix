"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconCash,
  IconFileInvoice,
  IconPackage,
  IconCreditCard,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconInnerShadowTop,
  IconCirclePlusFilled,
  IconMail,
  IconUserCircle,
  IconLogout,
  IconNotification,
  IconDotsVertical,
} from "@tabler/icons-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Administrador",
    email: "admin@movix.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "PDV",
      url: "/pdv",
      icon: IconCash,
    },
    {
      title: "Fiscal",
      url: "/fiscal",
      icon: IconFileInvoice,
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: IconPackage,
    },
    {
      title: "Financeiro",
      url: "/financeiro",
      icon: IconCreditCard,
    },
  ],
  navFiscal: [
    {
      title: "Fiscal",
      icon: IconFileInvoice,
      isActive: true,
      url: "/fiscal",
      items: [
        {
          title: "NF-e",
          url: "/fiscal/nfe",
        },
        {
          title: "NFC-e",
          url: "/fiscal/nfce",
        },
        {
          title: "CT-e",
          url: "/fiscal/cte",
        },
        {
          title: "MDF-e",
          url: "/fiscal/mdfe",
        },
      ],
    },
  ],
  navCadastros: [
    {
      title: "Cadastros",
      icon: IconUsers,
      isActive: true,
      url: "/cadastros",
      items: [
        {
          title: "Clientes",
          url: "/cadastros/clientes",
        },
        {
          title: "Produtos",
          url: "/cadastros/produtos",
        },
        {
          title: "Fornecedores",
          url: "/cadastros/fornecedores",
        },
        {
          title: "Usuários",
          url: "/cadastros/usuarios",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: IconChartBar,
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/ajuda",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "/buscar",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Base de Dados",
      url: "/database",
      icon: IconDatabase,
    },
    {
      name: "Relatórios",
      url: "/relatorios",
      icon: IconReport,
    },
    {
      name: "Documentos",
      url: "/documentos",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Movix ERP</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={pathname} />
        <NavDocuments items={data.navFiscal} currentPath={pathname} />
        <NavDocuments items={data.navCadastros} currentPath={pathname} />
        <NavSecondary items={data.navSecondary} className="mt-auto" currentPath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
