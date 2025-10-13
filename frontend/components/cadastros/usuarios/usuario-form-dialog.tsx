"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
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

const usuarioFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  perfil: z.enum(["Administrador", "Gerente", "Vendedor", "Operador"]).default("Operador"),
  departamento: z.string().optional(),
  status: z.enum(["Ativo", "Inativo", "Bloqueado"]).default("Ativo"),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional(),
})

type UsuarioFormValues = z.infer<typeof usuarioFormSchema>

interface UsuarioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: any | null
  onSuccess?: () => void
}

export function UsuarioFormDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: UsuarioFormDialogProps) {
  const [loading, setLoading] = React.useState(false)
  const isEditing = !!usuario

  const form = useForm({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      telefone: usuario?.telefone || "",
      perfil: usuario?.perfil || "Operador",
      departamento: usuario?.departamento || "",
      status: usuario?.status || "Ativo",
      senha: "",
    },
  })

  React.useEffect(() => {
    if (usuario) {
      form.reset({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || "",
        perfil: usuario.perfil || "Operador",
        departamento: usuario.departamento || "",
        status: usuario.status || "Ativo",
        senha: "",
      })
    } else {
      form.reset({
        nome: "",
        email: "",
        telefone: "",
        perfil: "Operador",
        departamento: "",
        status: "Ativo",
        senha: "",
      })
    }
  }, [usuario, form])

  const onSubmit = async (data: UsuarioFormValues) => {
    try {
      setLoading(true)
      // TODO: Integrar com API
      console.log(isEditing ? "Atualizando usuário:" : "Criando usuário:", data)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simula API
      onOpenChange(false)
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl flex flex-col max-h-[90vh]">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>
              {isEditing ? "Editar Usuário" : "Novo Usuário"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? "Atualize as informações do usuário"
                : "Preencha os dados para cadastrar um novo usuário"}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4" id="usuario-form">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2">
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
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perfil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Vendedor">Vendedor</SelectItem>
                        <SelectItem value="Operador">Operador</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <FormControl>
                      <Input placeholder="Departamento" {...field} />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                        <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{isEditing ? "Nova Senha (deixe em branco para manter)" : "Senha *"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </form>
            </Form>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t mt-0 pb-8">
            <Button type="submit" form="usuario-form" disabled={loading}>
              {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

