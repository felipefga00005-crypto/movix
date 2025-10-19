"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileInvoice,
  IconUsers,
  IconPackage,
  IconTruck,
  IconBuilding,
  IconUserCog,
  IconSettings,
  IconHelp,
  IconCertificate,
  IconBuildingStore,
} from "@tabler/icons-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import { useAuth } from "@/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
    ]

    // Items for all authenticated users
    const userItems = [
      {
        title: "NFes",
        url: "/dashboard/nfes",
        icon: IconFileInvoice,
      },
      {
        title: "Clientes",
        url: "/dashboard/clientes",
        icon: IconUsers,
      },
      {
        title: "Produtos",
        url: "/dashboard/produtos",
        icon: IconPackage,
      },
      {
        title: "Transportadoras",
        url: "/dashboard/transportadoras",
        icon: IconTruck,
      },
    ]

    // Admin items
    const adminItems = [
      {
        title: "Empresas",
        url: "/dashboard/admin/companies",
        icon: IconBuildingStore,
      },
      {
        title: "Usuários",
        url: "/dashboard/admin/users",
        icon: IconUserCog,
      },
      {
        title: "Certificados",
        url: "/dashboard/admin/certificates",
        icon: IconCertificate,
      },
    ]

    // SuperAdmin items
    const superAdminItems = [
      {
        title: "Contas",
        url: "/dashboard/superadmin/accounts",
        icon: IconBuilding,
      },
    ]

    let items = [...baseItems, ...userItems]

    if (user?.role === 'admin' || user?.role === 'superadmin') {
      items = [...items, ...adminItems]
    }

    if (user?.role === 'superadmin') {
      items = [...items, ...superAdminItems]
    }

    return items
  }

  const navSecondary = [
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/dashboard/help",
      icon: IconHelp,
    },
  ]

  const userData = {
    name: user?.name || "Usuário",
    email: user?.email || "",
    avatar: "",
  }

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
                <IconFileInvoice className="!size-5" />
                <span className="text-base font-semibold">Movix</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavItems()} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
