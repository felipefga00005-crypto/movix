import { GalleryVerticalEnd } from "lucide-react";
import { ResetPasswordForm } from "@/components/reset-password-form";
import Link from "next/link";

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { token } = await params;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Coluna Esquerda - Formulário */}
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
          <div className="w-full max-w-xs">
            <ResetPasswordForm token={token} />
          </div>
        </div>
      </div>

      {/* Coluna Direita - Imagem/Texto */}
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight">
              Crie uma nova senha
            </h2>
            <p className="text-muted-foreground text-lg">
              Escolha uma senha forte e segura para proteger sua conta.
            </p>
            <div className="mt-8 space-y-3 text-left">
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">🔒 Dica de Segurança</p>
                <p className="text-muted-foreground text-sm">
                  Use pelo menos 8 caracteres com letras maiúsculas, minúsculas
                  e números
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">⚠️ Evite</p>
                <p className="text-muted-foreground text-sm">
                  Não use senhas óbvias como datas de nascimento ou sequências
                  numéricas
                </p>
              </div>
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium">✅ Recomendado</p>
                <p className="text-muted-foreground text-sm">
                  Combine palavras aleatórias com números e símbolos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

