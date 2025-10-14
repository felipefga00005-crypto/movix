'use client';

import { usePathname } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

// Mapeamento de rotas para títulos e subtítulos
const routeConfig: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
  '/cadastros': { title: 'Cadastros', subtitle: 'Gerenciamento de dados' },
  '/cadastros/clientes': { title: 'Clientes', subtitle: 'Gerencie seus clientes e informações de contato' },
  '/cadastros/produtos': { title: 'Produtos', subtitle: 'Gerencie seu catálogo de produtos' },
  '/cadastros/fornecedores': { title: 'Fornecedores', subtitle: 'Gerencie seus fornecedores' },
};

export function SiteHeader() {
  const pathname = usePathname();

  // Gera o breadcrumb baseado no pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const config = routeConfig[path] || { title: segment };
    return { path, ...config };
  });

  const currentPage = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-col gap-0.5">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <div key={item.path} className="flex items-center gap-2">
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {index === breadcrumbItems.length - 1 ? (
                      <BreadcrumbPage className="font-medium">
                        {item.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.path}>
                        {item.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {currentPage?.subtitle && (
            <p className="text-xs text-muted-foreground hidden sm:block">
              {currentPage.subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
