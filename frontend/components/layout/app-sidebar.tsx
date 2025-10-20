"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFileInvoice,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconPackage,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavClouds } from "@/components/layout/nav-clouds"
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
      title: "NFes",
      url: "/nfes",
      icon: IconFileDescription,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: IconUsers,
    },
    {
      title: "Produtos",
      url: "/produtos",
      icon: IconDatabase,
    },
    {
      title: "Configurações",
      url: "/configuracoes/emitente",
      icon: IconSettings,
    },
  ],
  navClouds: [
    {
      title: "NFe",
      icon: IconFileDescription,
      isActive: true,
      url: "/nfes",
      items: [
        {
          title: "Todas as NFes",
          url: "/nfes",
        },
        {
          title: "Nova NFe",
          url: "/nfes/nova",
        },
        {
          title: "Digitação",
          url: "/nfes?status=DIGITACAO",
        },
        {
          title: "Autorizadas",
          url: "/nfes?status=AUTORIZADA",
        },
      ],
    },
    {
      title: "Cadastros",
      icon: IconDatabase,
      url: "/clientes",
      items: [
        {
          title: "Clientes",
          url: "/clientes",
        },
        {
          title: "Fornecedores",
          url: "/fornecedores",
        },
        {
          title: "Produtos",
          url: "/produtos",
        },
        {
          title: "Configurações",
          url: "/configuracoes/emitente",
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
      name: "Relatórios",
      url: "/relatorios",
      icon: IconReport,
    },
    {
      name: "Configurações",
      url: "/configuracoes",
      icon: IconSettings,
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
                <span className="text-base font-semibold">Movix NFe</span>
              </Link>
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
