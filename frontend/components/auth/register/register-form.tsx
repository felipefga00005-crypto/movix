'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth.schema"
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
import { toast } from "sonner"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Limpa erro do campo ao digitar
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validação com Zod
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterFormData
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    // Register
    try {
      setIsLoading(true)
      // Remove confirmarSenha antes de enviar para o backend
      const { confirmarSenha, ...registerData } = formData
      await register(registerData)
      toast.success("Cadastro realizado! Aguarde aprovação do administrador.")
      router.push("/login")
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
              <h1 className="text-xl font-bold">Criar Conta</h1>
              <p className="text-muted-foreground text-sm">
                Cadastre-se no sistema Movix
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
                {isLoading ? "Cadastrando..." : "Criar Conta"}
              </Button>
            </Field>
            <FieldDescription className="text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/login" className="underline">
                Faça login
              </Link>
            </FieldDescription>
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
