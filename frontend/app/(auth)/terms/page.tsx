import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Movix
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            Termos de Serviço
          </h1>
          <p className="text-muted-foreground mt-2">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">
              Ao acessar e usar o Movix, você concorda em cumprir e estar
              vinculado aos seguintes termos e condições de uso. Se você não
              concordar com qualquer parte destes termos, não deverá usar nosso
              serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Uso do Serviço</h2>
            <p className="text-muted-foreground">
              O Movix é um sistema de gestão empresarial destinado ao uso
              comercial. Você concorda em usar o serviço apenas para fins
              legais e de acordo com estes Termos.
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Não usar o serviço para qualquer propósito ilegal</li>
              <li>Não tentar obter acesso não autorizado ao sistema</li>
              <li>Não interferir ou interromper o serviço</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Conta de Usuário</h2>
            <p className="text-muted-foreground">
              Você é responsável por manter a segurança de sua conta e senha. O
              Movix não pode e não será responsável por qualquer perda ou dano
              decorrente de sua falha em cumprir esta obrigação de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              O serviço e seu conteúdo original, recursos e funcionalidades são
              e permanecerão propriedade exclusiva do Movix e seus
              licenciadores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">
              Em nenhuma circunstância o Movix, nem seus diretores, funcionários,
              parceiros, agentes, fornecedores ou afiliados, serão responsáveis
              por quaisquer danos indiretos, incidentais, especiais,
              consequenciais ou punitivos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Modificações</h2>
            <p className="text-muted-foreground">
              Reservamo-nos o direito, a nosso exclusivo critério, de modificar
              ou substituir estes Termos a qualquer momento. Se uma revisão for
              material, tentaremos fornecer um aviso com pelo menos 30 dias de
              antecedência.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Contato</h2>
            <p className="text-muted-foreground">
              Se você tiver alguma dúvida sobre estes Termos, entre em contato
              conosco através do email: suporte@movix.com
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Link
              href="/privacy"
              className="text-primary hover:underline"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/login"
              className="text-primary hover:underline"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

