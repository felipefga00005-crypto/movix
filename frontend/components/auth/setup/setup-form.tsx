'use client'

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { setupSchema, type SetupFormData } from "@/lib/validations/auth.schema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/auth/auth-card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SetupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { setup } = useAuth()
  const [formData, setFormData] = useState<SetupFormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
  })
  const [errors, setErrors] = useState<Partial<SetupFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo ao digitar
    if (errors[name as keyof SetupFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validação com Zod
    const result = setupSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<SetupFormData> = {}
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof SetupFormData
        fieldErrors[field] = error.message
      })
      setErrors(fieldErrors)
      return
    }

    // Setup
    try {
      setIsLoading(true)
      // Remove confirmarSenha antes de enviar para o backend
      const { confirmarSenha, ...setupData } = formData
      await setup(setupData)
    } catch (error) {
      // Erro já tratado no AuthContext com toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <AuthCard>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-3">
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-xl font-bold">Configuração Inicial</h1>
              <p className="text-muted-foreground text-sm">
                Crie o primeiro usuário administrador do sistema
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="nome">Nome Completo</FieldLabel>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="João Silva"
                value={formData.nome}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@empresa.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="senha">Senha</FieldLabel>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.senha && (
                <p className="text-sm text-red-500">{errors.senha}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmarSenha">Confirmar Senha</FieldLabel>
              <Input
                id="confirmarSenha"
                name="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
              {errors.confirmarSenha && (
                <p className="text-sm text-red-500">{errors.confirmarSenha}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="telefone">Telefone (Opcional)</FieldLabel>
              <Input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.telefone && (
                <p className="text-sm text-red-500">{errors.telefone}</p>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Configurando..." : "Criar Conta e Começar"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </AuthCard>
      <FieldDescription className="px-6 text-center text-xs">
        Ao continuar, você concorda com nossos{" "}
        <Link href="/terms" className="underline">
          Termos
        </Link>{" "}
        e{" "}
        <Link href="/privacy" className="underline">
          Privacidade
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
