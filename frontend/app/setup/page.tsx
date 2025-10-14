'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GalleryVerticalEnd, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { setupSuperAdmin, setAuthToken, setCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await setupSuperAdmin({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone || undefined,
      });

      // Salva o token e usuário
      setAuthToken(response.token);
      setCurrentUser(response.user);

      toast.success('Super Admin criado com sucesso!');

      // Redireciona para o dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar super admin';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-3xl font-bold">Configuração Inicial</h1>
                  <p className="text-muted-foreground text-balance">
                    Crie a conta do Super Administrador para começar a usar o sistema
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="nome">Nome Completo</FieldLabel>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="João Silva"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@movix.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="telefone">Telefone (opcional)</FieldLabel>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="senha">Senha</FieldLabel>
                  <Input
                    id="senha"
                    name="senha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmarSenha">Confirmar Senha</FieldLabel>
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Criando...' : 'Criar Super Admin e Começar'}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
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

