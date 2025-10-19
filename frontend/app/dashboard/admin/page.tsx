'use client'

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
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
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Companies</CardTitle>
                        <CardDescription>Manage your companies</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Active companies</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>Manage your users</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Active users</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>NFes</CardTitle>
                        <CardDescription>Total NFes this month</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

