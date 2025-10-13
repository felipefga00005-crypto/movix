import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconFileInvoice, IconReceipt, IconTruck, IconFileText } from "@tabler/icons-react"
import Link from "next/link"

export default function FiscalPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Módulo Fiscal</h1>
            <p className="text-muted-foreground">
              Gestão de documentos fiscais e integração com SEFAZ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NF-e</CardTitle>
              <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Notas Fiscais Eletrônicas
              </p>
              <Button asChild className="mt-2 w-full" size="sm">
                <Link href="/fiscal/nfe">
                  Emitir NF-e
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFC-e</CardTitle>
              <IconReceipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Cupons Fiscais Eletrônicos
              </p>
              <Button asChild className="mt-2 w-full" size="sm">
                <Link href="/fiscal/nfce">
                  Emitir NFC-e
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CT-e</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Conhecimentos de Transporte
              </p>
              <Button asChild className="mt-2 w-full" size="sm">
                <Link href="/fiscal/cte">
                  Emitir CT-e
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MDF-e</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Manifestos de Documentos Fiscais
              </p>
              <Button asChild className="mt-2 w-full" size="sm">
                <Link href="/fiscal/mdfe">
                  Emitir MDF-e
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Fiscais Recentes</CardTitle>
              <CardDescription>
                Últimos documentos fiscais emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Nenhum documento fiscal encontrado.
                <br />
                <Button className="mt-4">Emitir Primeiro Documento</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
