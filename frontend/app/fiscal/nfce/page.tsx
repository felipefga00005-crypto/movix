import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconReceipt, 
  IconPlus, 
  IconEye, 
  IconDownload, 
  IconSend,
  IconCheck,
  IconX,
  IconClock,
  IconCash
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
const nfceData = [
  {
    id: 1,
    numero: "000000001",
    serie: "065",
    consumidor: "Consumidor Final",
    valor: "R$ 45,90",
    status: "autorizada",
    dataEmissao: "2024-01-15",
    chave: "35240114200166000187650650000000011123456789"
  },
  {
    id: 2,
    numero: "000000002",
    serie: "065",
    consumidor: "João Silva",
    valor: "R$ 128,50",
    status: "pendente",
    dataEmissao: "2024-01-16",
    chave: "35240114200166000187650650000000021123456789"
  },
  {
    id: 3,
    numero: "000000003",
    serie: "065",
    consumidor: "Maria Santos",
    valor: "R$ 75,30",
    status: "autorizada",
    dataEmissao: "2024-01-17",
    chave: "35240114200166000187650650000000031123456789"
  },
  {
    id: 4,
    numero: "000000004",
    serie: "065",
    consumidor: "Consumidor Final",
    valor: "R$ 32,80",
    status: "rejeitada",
    dataEmissao: "2024-01-17",
    chave: "35240114200166000187650650000000041123456789"
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

export default function NfcePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">NFC-e - Cupom Fiscal Eletrônico</h1>
            <p className="text-muted-foreground">
              Emissão e gestão de Cupons Fiscais Eletrônicos para vendas no varejo
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emitidas</CardTitle>
              <IconReceipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autorizadas</CardTitle>
              <IconCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                50% do total
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
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <IconCash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 282,50</div>
              <p className="text-xs text-muted-foreground">
                Vendas de hoje
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
                Operações do PDV e cupons fiscais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <Button>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Nova NFC-e
                </Button>
                <Button variant="outline">
                  <IconSend className="h-4 w-4 mr-2" />
                  Transmitir Lote
                </Button>
                <Button variant="outline">
                  <IconDownload className="h-4 w-4 mr-2" />
                  Consultar SEFAZ
                </Button>
                <Button variant="outline">
                  <IconCash className="h-4 w-4 mr-2" />
                  Abrir PDV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de NFC-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Cupons Fiscais Recentes</CardTitle>
              <CardDescription>
                Últimas NFC-e emitidas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Consumidor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nfceData.map((nfce) => (
                    <TableRow key={nfce.id}>
                      <TableCell className="font-medium">
                        {nfce.numero}/{nfce.serie}
                      </TableCell>
                      <TableCell>{nfce.consumidor}</TableCell>
                      <TableCell>{nfce.valor}</TableCell>
                      <TableCell>{getStatusBadge(nfce.status)}</TableCell>
                      <TableCell>
                        {new Date(nfce.dataEmissao).toLocaleDateString('pt-BR')} 14:30
                      </TableCell>
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

        {/* Informações Importantes */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Contingência</h4>
                  <p className="text-sm text-muted-foreground">
                    Em caso de problemas com a SEFAZ, o sistema pode operar em modo de contingência offline.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Limite de Transmissão</h4>
                  <p className="text-sm text-muted-foreground">
                    NFC-e devem ser transmitidas em até 24 horas após a emissão.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
