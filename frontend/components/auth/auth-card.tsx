/**
 * AuthCard - Componente wrapper reutilizável para cards de autenticação
 * Mantém o design atual com 2 colunas (form + imagem)
 */

import { Card, CardContent } from "@/components/ui/card"

interface AuthCardProps {
  children: React.ReactNode
  imageSrc?: string
  imageAlt?: string
}

export function AuthCard({
  children,
  imageSrc = "https://ui.shadcn.com/placeholder.svg",
  imageAlt = "Movix - Sistema ERP/PDV",
}: AuthCardProps) {
  return (
    <Card className="overflow-hidden max-w-6xl w-full">
      <CardContent className="grid p-0 md:grid-cols-2">
        {/* Formulário */}
        <div className="p-4 md:p-6">
          {children}
        </div>

        {/* Imagem */}
        <div className="relative hidden bg-muted md:block">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  )
}

