'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GalleryVerticalEnd, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { setupSuperAdmin, setAuthToken, setCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';
import {
  setupSchema,
  type SetupFormData,
  getPasswordStrength,
} from '@/lib/validations/auth';

export default function SetupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const password = form.watch('senha');
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: SetupFormData) => {
    try {
      const response = await setupSuperAdmin({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
      });

      // Salva o token e usuário
      setAuthToken(response.token);
      setCurrentUser(response.user);

      toast.success('Super Admin criado com sucesso!');

      // Redireciona para o dashboard
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar super admin');
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Movix
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Configuração Inicial
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Crie a conta do Super Administrador para começar a usar o sistema
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="João Silva"
                          autoComplete="name"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@movix.com"
                          autoComplete="email"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {password && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i < passwordStrength.score
                                    ? passwordStrength.color
                                    : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <FormDescription>
                            Força da senha: {passwordStrength.label}
                          </FormDescription>
                        </div>
                      )}
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
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Digite a senha novamente"
                            autoComplete="new-password"
                            {...field}
                            disabled={form.formState.isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting
                    ? 'Criando...'
                    : 'Criar Super Admin e Começar'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              Bem-vindo ao Movix
            </h2>
            <p className="text-muted-foreground text-lg">
              Sistema completo de gestão empresarial. Configure sua conta de
              administrador para começar a usar todas as funcionalidades.
            </p>
            <div className="mt-8 space-y-2 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  1
                </div>
                <div>
                  <p className="font-medium">Primeiro Acesso</p>
                  <p className="text-muted-foreground text-sm">
                    Esta é a configuração inicial do sistema
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  2
                </div>
                <div>
                  <p className="font-medium">Super Administrador</p>
                  <p className="text-muted-foreground text-sm">
                    Você terá acesso total ao sistema
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary mt-1 flex size-6 items-center justify-center rounded-full">
                  3
                </div>
                <div>
                  <p className="font-medium">Comece Agora</p>
                  <p className="text-muted-foreground text-sm">
                    Após criar a conta, você será direcionado ao dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

