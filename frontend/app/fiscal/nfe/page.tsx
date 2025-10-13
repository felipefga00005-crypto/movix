import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconFileInvoice, 
  IconPlus, 
  IconEye, 
  IconDownload, 
  IconSend,
  IconCheck,
  IconX,
  IconClock
} from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Dados mockados para demonstração
const nfeData = [
  {
    id: 1,
    numero: "000000001",
    serie: "001",
    cliente: "Cliente Exemplo Ltda",
    valor: "R$ 1.250,00",
    status: "autorizada",
    dataEmissao: "2024-01-15",
    chave: "35240114200166000187550010000000011123456789"
  },
  {
    id: 2,
    numero: "000000002",
    serie: "001",
    cliente: "Empresa ABC S.A.",
    valor: "R$ 2.850,00",
    status: "pendente",
    dataEmissao: "2024-01-16",
    chave: "35240114200166000187550010000000021123456789"
  },
  {
    id: 3,
    numero: "000000003",
    serie: "001",
    cliente: "Comércio XYZ",
    valor: "R$ 750,00",
    status: "rejeitada",
    dataEmissao: "2024-01-17",
    chave: "35240114200166000187550010000000031123456789"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "autorizada":
      return <Badge className="bg-green-100 text-green-800"><IconCheck className="w-3 h-3 mr-1" />Autorizada</Badge>
    case "pendente":
      return <Badge variant="secondary"><IconClock className="w-3 h-3 mr-1" />Pendente</Badge>
    case "rejeitada":
      return <Badge variant="destructive"><IconX className="w-3 h-3 mr-1" />Rejeitada</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function NfePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">NF-e - Nota Fiscal Eletrônica</h1>
            <p className="text-muted-foreground">
              Emissão e gestão de Notas Fiscais Eletrônicas
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emitidas</CardTitle>
              <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
              <IconCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                33% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <IconClock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Aguardando SEFAZ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <IconFileInvoice className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 4.850</div>
              <p className="text-xs text-muted-foreground">
                Faturamento do mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Operações mais utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <Button>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Nova NF-e
                </Button>
                <Button variant="outline">
                  <IconSend className="h-4 w-4 mr-2" />
                  Transmitir Lote
                </Button>
                <Button variant="outline">
                  <IconDownload className="h-4 w-4 mr-2" />
                  Consultar SEFAZ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de NF-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais Recentes</CardTitle>
              <CardDescription>
                Últimas NF-e emitidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nfeData.map((nfe) => (
                    <TableRow key={nfe.id}>
                      <TableCell className="font-medium">
                        {nfe.numero}/{nfe.serie}
                      </TableCell>
                      <TableCell>{nfe.cliente}</TableCell>
                      <TableCell>{nfe.valor}</TableCell>
                      <TableCell>{getStatusBadge(nfe.status)}</TableCell>
                      <TableCell>{new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <IconEye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <IconDownload className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
