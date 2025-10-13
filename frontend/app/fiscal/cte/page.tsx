import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconTruck, 
  IconPlus, 
  IconEye, 
  IconDownload, 
  IconSend,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconRoute
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
const cteData = [
  {
    id: 1,
    numero: "000000001",
    serie: "001",
    remetente: "Empresa ABC Ltda",
    destinatario: "Comércio XYZ S.A.",
    origem: "São Paulo/SP",
    destino: "Rio de Janeiro/RJ",
    valor: "R$ 450,00",
    peso: "1.250 kg",
    status: "autorizada",
    dataEmissao: "2024-01-15",
    chave: "35240114200166000187570010000000011123456789"
  },
  {
    id: 2,
    numero: "000000002",
    serie: "001",
    remetente: "Indústria DEF",
    destinatario: "Distribuidora GHI",
    origem: "Campinas/SP",
    destino: "Belo Horizonte/MG",
    valor: "R$ 680,00",
    peso: "2.100 kg",
    status: "pendente",
    dataEmissao: "2024-01-16",
    chave: "35240114200166000187570010000000021123456789"
  },
  {
    id: 3,
    numero: "000000003",
    serie: "001",
    remetente: "Fornecedor JKL",
    destinatario: "Cliente MNO",
    origem: "Santos/SP",
    destino: "Salvador/BA",
    valor: "R$ 920,00",
    peso: "3.500 kg",
    status: "rejeitada",
    dataEmissao: "2024-01-17",
    chave: "35240114200166000187570010000000031123456789"
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

export default function CtePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">CT-e - Conhecimento de Transporte Eletrônico</h1>
            <p className="text-muted-foreground">
              Emissão e gestão de documentos fiscais para transporte de cargas
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emitidos</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Autorizados</CardTitle>
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
              <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
              <IconRoute className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.850</div>
              <p className="text-xs text-muted-foreground">
                kg transportados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <IconTruck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.050</div>
              <p className="text-xs text-muted-foreground">
                Frete do mês
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
                Operações de transporte e logística
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <Button>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Novo CT-e
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
                  <IconMapPin className="h-4 w-4 mr-2" />
                  Rastrear Carga
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de CT-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Conhecimentos de Transporte Recentes</CardTitle>
              <CardDescription>
                Últimos CT-e emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Remetente</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cteData.map((cte) => (
                    <TableRow key={cte.id}>
                      <TableCell className="font-medium">
                        {cte.numero}/{cte.serie}
                      </TableCell>
                      <TableCell>{cte.remetente}</TableCell>
                      <TableCell>{cte.destinatario}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{cte.origem}</div>
                          <div className="text-muted-foreground">→ {cte.destino}</div>
                        </div>
                      </TableCell>
                      <TableCell>{cte.peso}</TableCell>
                      <TableCell>{cte.valor}</TableCell>
                      <TableCell>{getStatusBadge(cte.status)}</TableCell>
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

        {/* Informações sobre CT-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações sobre CT-e</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-2">Modalidades</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Rodoviário</li>
                    <li>• Aéreo</li>
                    <li>• Aquaviário</li>
                    <li>• Ferroviário</li>
                    <li>• Dutoviário</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tipos de Serviço</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Normal</li>
                    <li>• Subcontratação</li>
                    <li>• Redespacho</li>
                    <li>• Intermediário</li>
                    <li>• Multimodal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Documentos Relacionados</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• NF-e de origem</li>
                    <li>• Manifesto de carga</li>
                    <li>• Documentos do veículo</li>
                    <li>• Documentos do condutor</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
