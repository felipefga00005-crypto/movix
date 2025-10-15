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
    telefone: "",
    cargo: "",
    departamento: "",
  })
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
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
      const fieldErrors: Partial<RegisterFormData> = {}
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof RegisterFormData
        fieldErrors[field] = error.message
      })
      setErrors(fieldErrors)
      return
    }

    // Register
    try {
      setIsLoading(true)
      await register(formData)
      toast.success("Cadastro realizado! Aguarde aprovação do administrador.")
      router.push("/login")
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
              <h1 className="text-2xl font-bold">Criar Conta</h1>
              <p className="text-muted-foreground text-balance">
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
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
                <Input
                  id="cargo"
                  name="cargo"
                  type="text"
                  placeholder="Vendedor"
                  value={formData.cargo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="departamento">Departamento</FieldLabel>
              <Input
                id="departamento"
                name="departamento"
                type="text"
                placeholder="Vendas"
                value={formData.departamento}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Cadastrando..." : "Criar Conta"}
              </Button>
            </Field>
            <FieldDescription className="text-center">
              Já tem uma conta?{" "}
              <Link href="/login" className="underline">
                Faça login
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
