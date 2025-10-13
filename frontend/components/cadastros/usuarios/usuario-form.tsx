"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconLoader, IconUser, IconEye, IconEyeOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { 
  Usuario, 
  CreateUsuarioRequest, 
  UpdateUsuarioRequest, 
  UsuarioStatus,
  UsuarioPerfil,
  UsuarioDepartamento
} from "@/types/usuario"
import { usuarioUtils } from "@/lib/api/usuarios"

// Schema de validação
const usuarioSchema = z.object({
  // Dados básicos
  nome: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  
  // Senha (apenas para criação)
  senha: z.string().optional(),
  confirmarSenha: z.string().optional(),
  
  // Contatos
  telefone: z.string().optional(),
  
  // Organização
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  perfil: z.string().default(UsuarioPerfil.OPERADOR),
  status: z.string().default(UsuarioStatus.ATIVO),
}).refine((data) => {
  // Validar senha apenas se fornecida
  if (data.senha) {
    return data.senha === data.confirmarSenha
  }
  return true
}, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
}).refine((data) => {
  // Validar força da senha apenas se fornecida
  if (data.senha) {
    return usuarioUtils.isValidPassword(data.senha)
  }
  return true
}, {
  message: "Senha deve ter pelo menos 8 caracteres, incluindo letras e números",
  path: ["senha"],
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

interface UsuarioFormProps {
  usuario?: Usuario
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function UsuarioForm({ usuario, onSubmit, onCancel, isLoading }: UsuarioFormProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const isEditing = !!usuario

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      senha: "",
      confirmarSenha: "",
      telefone: usuario?.telefone || "",
      cargo: usuario?.cargo || "",
      departamento: usuario?.departamento || "",
      perfil: usuario?.perfil || UsuarioPerfil.OPERADOR,
      status: usuario?.status || UsuarioStatus.ATIVO,
    },
  })

  const handleSubmit = async (data: UsuarioFormData) => {
    try {
      const submitData: any = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cargo: data.cargo,
        departamento: data.departamento,
        perfil: data.perfil,
        status: data.status,
      }

      // Incluir senha apenas se fornecida (para criação ou alteração)
      if (data.senha) {
        submitData.senha = data.senha
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Dados Básicos
            </CardTitle>
            <CardDescription>
              Informações principais do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do usuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="email@empresa.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field}
                        onChange={(e) => {
                          const formatted = usuarioUtils.formatTelefone(e.target.value)
                          field.onChange(formatted)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UsuarioStatus.ATIVO}>Ativo</SelectItem>
                        <SelectItem value={UsuarioStatus.INATIVO}>Inativo</SelectItem>
                        <SelectItem value={UsuarioStatus.PENDENTE}>Pendente</SelectItem>
                        <SelectItem value={UsuarioStatus.BLOQUEADO}>Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Senha (apenas para criação ou se quiser alterar) */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Alterar Senha (opcional)" : "Senha de Acesso"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Deixe em branco para manter a senha atual" 
                : "Defina uma senha segura para o usuário"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditing ? "Nova Senha" : "Senha *"}</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormDescription>
                      Mínimo 8 caracteres com letras e números
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <IconEyeOff className="h-4 w-4" />
                        ) : (
                          <IconEye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Organizacionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Organizacionais</CardTitle>
            <CardDescription>
              Cargo, departamento e perfil de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Analista de Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UsuarioDepartamento.VENDAS}>Vendas</SelectItem>
                        <SelectItem value={UsuarioDepartamento.FINANCEIRO}>Financeiro</SelectItem>
                        <SelectItem value={UsuarioDepartamento.ESTOQUE}>Estoque</SelectItem>
                        <SelectItem value={UsuarioDepartamento.COMPRAS}>Compras</SelectItem>
                        <SelectItem value={UsuarioDepartamento.MARKETING}>Marketing</SelectItem>
                        <SelectItem value={UsuarioDepartamento.TI}>TI</SelectItem>
                        <SelectItem value={UsuarioDepartamento.RH}>RH</SelectItem>
                        <SelectItem value={UsuarioDepartamento.DIRETORIA}>Diretoria</SelectItem>
                        <SelectItem value={UsuarioDepartamento.OUTROS}>Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="perfil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UsuarioPerfil.ADMIN}>
                        <div className="flex flex-col">
                          <span>Administrador</span>
                          <span className="text-xs text-muted-foreground">Acesso total ao sistema</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UsuarioPerfil.GERENTE}>
                        <div className="flex flex-col">
                          <span>Gerente</span>
                          <span className="text-xs text-muted-foreground">Acesso gerencial e relatórios</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UsuarioPerfil.VENDEDOR}>
                        <div className="flex flex-col">
                          <span>Vendedor</span>
                          <span className="text-xs text-muted-foreground">Acesso a vendas e clientes</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UsuarioPerfil.FINANCEIRO}>
                        <div className="flex flex-col">
                          <span>Financeiro</span>
                          <span className="text-xs text-muted-foreground">Acesso financeiro e cobrança</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UsuarioPerfil.ESTOQUE}>
                        <div className="flex flex-col">
                          <span>Estoque</span>
                          <span className="text-xs text-muted-foreground">Acesso a produtos e estoque</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UsuarioPerfil.OPERADOR}>
                        <div className="flex flex-col">
                          <span>Operador</span>
                          <span className="text-xs text-muted-foreground">Acesso básico ao sistema</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O perfil define as permissões de acesso do usuário
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
            {usuario ? "Atualizar" : "Cadastrar"} Usuário
          </Button>
        </div>
      </form>
    </Form>
  )
}
