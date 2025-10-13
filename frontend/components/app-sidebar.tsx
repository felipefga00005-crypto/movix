"use client"

import * as React from "react"
import {
  IconBrandReact,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconHelp,
  IconPackage,
  IconReport,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconTruck,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react"

import { NavClouds } from "@/components/nav-clouds"
import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
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
    name: "Admin Movix",
    email: "admin@movix.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Vendas",
      url: "/vendas",
      icon: IconShoppingCart,
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: IconPackage,
    },
    {
      title: "Cadastros",
      url: "/cadastros",
      icon: IconUsers,
    },
    {
      title: "Relatórios",
      url: "/relatorios",
      icon: IconChartBar,
    },
  ],
  navClouds: [
    {
      title: "Clientes",
      icon: IconUserCheck,
      isActive: true,
      url: "/cadastros/clientes",
      items: [
        {
          title: "Lista de Clientes",
          url: "/cadastros/clientes",
        },
        {
          title: "Novo Cliente",
          url: "/cadastros/clientes/novo",
        },
      ],
    },
    {
      title: "Fornecedores",
      icon: IconTruck,
      url: "/cadastros/fornecedores",
      items: [
        {
          title: "Lista de Fornecedores",
          url: "/cadastros/fornecedores",
        },
        {
          title: "Novo Fornecedor",
          url: "/cadastros/fornecedores/novo",
        },
      ],
    },
    {
      title: "Produtos",
      icon: IconPackage,
      url: "/cadastros/produtos",
      items: [
        {
          title: "Lista de Produtos",
          url: "/cadastros/produtos",
        },
        {
          title: "Novo Produto",
          url: "/cadastros/produtos/novo",
        },
      ],
    },
  ],
  navSecondary: [
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
      url: "/dados",
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
      icon: IconFileDescription,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <IconBrandReact className="!size-5" />
                <span className="text-base font-semibold">Movix</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavClouds items={data.navClouds} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
