import { AppLayout } from "@/components/shared/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconFileText, 
  IconPlus, 
  IconEye, 
  IconDownload, 
  IconSend,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconTruck,
  IconRoute2
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
const mdfeData = [
  {
    id: 1,
    numero: "000000001",
    serie: "001",
    condutor: "João Silva",
    veiculo: "ABC-1234",
    origem: "São Paulo/SP",
    destino: "Rio de Janeiro/RJ",
    ctes: 3,
    pesoTotal: "15.500 kg",
    status: "autorizada",
    dataEmissao: "2024-01-15",
    chave: "35240114200166000187580010000000011123456789"
  },
  {
    id: 2,
    numero: "000000002",
    serie: "001",
    condutor: "Maria Santos",
    veiculo: "DEF-5678",
    origem: "Campinas/SP",
    destino: "Belo Horizonte/MG",
    ctes: 5,
    pesoTotal: "22.800 kg",
    status: "encerrada",
    dataEmissao: "2024-01-14",
    chave: "35240114200166000187580010000000021123456789"
  },
  {
    id: 3,
    numero: "000000003",
    serie: "001",
    condutor: "Carlos Oliveira",
    veiculo: "GHI-9012",
    origem: "Santos/SP",
    destino: "Salvador/BA",
    ctes: 2,
    pesoTotal: "8.200 kg",
    status: "pendente",
    dataEmissao: "2024-01-17",
    chave: "35240114200166000187580010000000031123456789"
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "autorizada":
      return <Badge className="bg-green-100 text-green-800"><IconCheck className="w-3 h-3 mr-1" />Autorizada</Badge>
    case "encerrada":
      return <Badge className="bg-blue-100 text-blue-800"><IconCheck className="w-3 h-3 mr-1" />Encerrada</Badge>
    case "pendente":
      return <Badge variant="secondary"><IconClock className="w-3 h-3 mr-1" />Pendente</Badge>
    case "rejeitada":
      return <Badge variant="destructive"><IconX className="w-3 h-3 mr-1" />Rejeitada</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function MdfePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">MDF-e - Manifesto Eletrônico de Documentos Fiscais</h1>
            <p className="text-muted-foreground">
              Controle de viagens e manifestos de carga para transporte rodoviário
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emitidos</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
              <IconTruck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Viagem ativa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CT-e Vinculados</CardTitle>
              <IconRoute2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">
                Documentos de carga
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
              <IconFileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">46.500</div>
              <p className="text-xs text-muted-foreground">
                kg transportados
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
                Operações de manifesto e controle de viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <Button>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Novo MDF-e
                </Button>
                <Button variant="outline">
                  <IconSend className="h-4 w-4 mr-2" />
                  Transmitir
                </Button>
                <Button variant="outline">
                  <IconCheck className="h-4 w-4 mr-2" />
                  Encerrar Viagem
                </Button>
                <Button variant="outline">
                  <IconMapPin className="h-4 w-4 mr-2" />
                  Rastrear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de MDF-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Manifestos Recentes</CardTitle>
              <CardDescription>
                Últimos MDF-e emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Condutor</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Rota</TableHead>
                    <TableHead>CT-e</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mdfeData.map((mdfe) => (
                    <TableRow key={mdfe.id}>
                      <TableCell className="font-medium">
                        {mdfe.numero}/{mdfe.serie}
                      </TableCell>
                      <TableCell>{mdfe.condutor}</TableCell>
                      <TableCell>{mdfe.veiculo}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>{mdfe.origem}</div>
                          <div className="text-muted-foreground">→ {mdfe.destino}</div>
                        </div>
                      </TableCell>
                      <TableCell>{mdfe.ctes}</TableCell>
                      <TableCell>{mdfe.pesoTotal}</TableCell>
                      <TableCell>{getStatusBadge(mdfe.status)}</TableCell>
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

        {/* Informações sobre MDF-e */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações sobre MDF-e</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium mb-2">Obrigatoriedade</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Transporte rodoviário de cargas</li>
                    <li>• Viagens interestaduais</li>
                    <li>• Veículos com PBTC &gt; 20 toneladas</li>
                    <li>• Transporte de produtos perigosos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Documentos Vinculados</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CT-e</li>
                    <li>• NF-e (quando aplicável)</li>
                    <li>• Outros documentos fiscais</li>
                    <li>• Documentos de identificação</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Controles</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Início da viagem</li>
                    <li>• Percurso planejado</li>
                    <li>• Encerramento obrigatório</li>
                    <li>• Eventos de fiscalização</li>
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
