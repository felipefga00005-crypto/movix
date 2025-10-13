import { AppLayout } from "@/components/shared/app-layout"
import { ConfiguracoesForm } from "@/components/configuracoes/configuracoes-form"
import { ConfiguracoesSectionCards } from "@/components/configuracoes/configuracoes-section-cards"

export default function ConfiguracoesPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Configurações Gerais</h1>
            <p className="text-muted-foreground">
              Configure as preferências e parâmetros do sistema
            </p>
          </div>
        </div>
        <ConfiguracoesSectionCards />
        <ConfiguracoesForm />
      </div>
    </AppLayout>
  )
}
