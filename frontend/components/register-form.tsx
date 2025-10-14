'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { register, setAuthToken, setCurrentUser, login } from '@/lib/auth';

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de serviço');
      return;
    }

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
      // Registra o usuário
      await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone || undefined,
      });

      // Faz login automaticamente
      const response = await login(formData.email, formData.senha);
      setAuthToken(response.token);
      setCurrentUser(response.user);

      // Redireciona para o dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Criar uma conta
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha os dados abaixo para criar sua conta
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm border border-destructive/20">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="nome">Nome completo</FieldLabel>
          <Input 
            id="nome" 
            name="nome"
            type="text" 
            placeholder="João Silva" 
            value={formData.nome}
            onChange={handleChange}
            required 
            disabled={loading}
            autoComplete="name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="seu@email.com" 
            value={formData.email}
            onChange={handleChange}
            required 
            disabled={loading}
            autoComplete="email"
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
            autoComplete="tel"
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
            autoComplete="new-password"
          />
          <FieldDescription>
            Use no mínimo 6 caracteres com letras e números
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmarSenha">Confirmar senha</FieldLabel>
          <Input 
            id="confirmarSenha" 
            name="confirmarSenha"
            type="password" 
            placeholder="Digite a senha novamente"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required 
            disabled={loading}
            autoComplete="new-password"
          />
        </Field>

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            disabled={loading}
            className="mt-1"
          />
          <Label 
            htmlFor="terms" 
            className="text-sm font-normal cursor-pointer leading-relaxed"
          >
            Eu aceito os{" "}
            <Link href="/terms" className="text-primary hover:underline underline-offset-4">
              Termos de Serviço
            </Link>
            {" "}e a{" "}
            <Link href="/privacy" className="text-primary hover:underline underline-offset-4">
              Política de Privacidade
            </Link>
          </Label>
        </div>

        <Field>
          <Button type="submit" disabled={loading || !acceptTerms} className="w-full">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Field>

        <FieldSeparator>Ou continue com</FieldSeparator>

        <Field>
          <Button 
            variant="outline" 
            type="button" 
            disabled={loading}
            className="w-full"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Cadastrar com GitHub
          </Button>

          <FieldDescription className="text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline underline-offset-4">
              Fazer login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

