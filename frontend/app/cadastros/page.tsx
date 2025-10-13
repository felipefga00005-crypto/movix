import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconUsers, IconPackage, IconTruck, IconUserCircle } from "@tabler/icons-react"
import Link from "next/link"

export default function CadastrosPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Cadastros</h1>
            <p className="text-muted-foreground">
              Gerencie todos os cadastros do sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mb-3">
                Clientes cadastrados
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href="/cadastros/clientes">
                  Gerenciar Clientes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <IconPackage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mb-3">
                Produtos cadastrados
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href="/cadastros/produtos">
                  Gerenciar Produtos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mb-3">
                Fornecedores cadastrados
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link href="/cadastros/fornecedores">
                  Gerenciar Fornecedores
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <IconUserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground mb-3">
                Usuários do sistema
              </p>
              <Button asChild size="sm" className="w-full" variant="outline">
                <Link href="/cadastros/usuarios">
                  Gerenciar Usuários
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Cadastros mais utilizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                <Button asChild>
                  <Link href="/cadastros/clientes">
                    <IconUsers className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cadastros/produtos">
                    <IconPackage className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cadastros/fornecedores">
                    <IconTruck className="h-4 w-4 mr-2" />
                    Novo Fornecedor
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/cadastros/usuarios">
                    <IconUserCircle className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
