'use client'

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth.schema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/auth/auth-card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    senha: "",
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo ao digitar
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validação com Zod
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<LoginFormData> = {}
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof LoginFormData
        fieldErrors[field] = error.message
      })
      setErrors(fieldErrors)
      return
    }

    // Login
    try {
      setIsLoading(true)
      await login(formData.email, formData.senha)
    } catch (error) {
      // Erro já tratado no AuthContext com toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <AuthCard>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
              <p className="text-muted-foreground text-balance">
                Faça login na sua conta Movix
              </p>
            </div>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
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
              <div className="flex items-center">
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
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
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </Field>
            <FieldDescription className="text-center">
              Não tem uma conta?{" "}
              <Link href="/register" className="underline">
                Cadastre-se
              </Link>
            </FieldDescription>
          </FieldGroup>
        </form>
      </AuthCard>
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com nossos{" "}
        <Link href="/terms" className="underline">
          Termos de Serviço
        </Link>{" "}
        e{" "}
        <Link href="/privacy" className="underline">
          Política de Privacidade
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
