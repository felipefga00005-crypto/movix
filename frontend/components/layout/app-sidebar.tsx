"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconPackage,
  IconTruck,
  IconUserCog,
  IconCash,
  IconReceipt,
  IconBuildingStore,
  IconCertificate,
  IconFileInvoice,
  IconSettingsCog,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/layout/nav-documents"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
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
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
      items: [
        {
          title: "Ponto de Venda",
          url: "/pdv",
          icon: IconBuildingStore,
        },
        {
          title: "Vendas",
          url: "/pdv/vendas",
          icon: IconReceipt,
        },
        {
          title: "Relatórios",
          url: "/pdv/relatorios",
          icon: IconReport,
        },
      ],
    },
    {
      title: "Cadastros",
      url: "#",
      icon: IconDatabase,
      items: [
        {
          title: "Clientes",
          url: "/cadastro/clientes",
          icon: IconUsers,
        },
        {
          title: "Produtos",
          url: "/cadastro/produtos",
          icon: IconPackage,
        },
        {
          title: "Fornecedores",
          url: "/cadastro/fornecedores",
          icon: IconTruck,
        },
        {
          title: "Usuários",
          url: "/cadastro/usuarios",
          icon: IconUserCog,
        },
      ],
    },
    {
      title: "Fiscal",
      url: "#",
      icon: IconFileInvoice,
      items: [
        {
          title: "Configuração Empresa",
          url: "/fiscal/empresa",
          icon: IconBuildingStore,
        },
        {
          title: "Certificado Digital",
          url: "/fiscal/certificado",
          icon: IconCertificate,
        },
        {
          title: "Naturezas de Operação",
          url: "/fiscal/naturezas",
          icon: IconListDetails,
        },
        {
          title: "Configurações SEFAZ",
          url: "/fiscal/configuracoes",
          icon: IconSettingsCog,
        },
      ],
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
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
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Movix</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
