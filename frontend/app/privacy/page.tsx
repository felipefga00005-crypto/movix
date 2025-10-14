import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
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
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground mt-2">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">1. Informações que Coletamos</h2>
            <p className="text-muted-foreground">
              Coletamos informações que você nos fornece diretamente ao usar o
              Movix:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Informações de conta (nome, email, senha)</li>
              <li>Dados de clientes, produtos e fornecedores que você cadastra</li>
              <li>Informações de uso e logs de acesso</li>
              <li>Dados de comunicação conosco</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. Como Usamos suas Informações</h2>
            <p className="text-muted-foreground">
              Usamos as informações coletadas para:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Processar transações e enviar notificações relacionadas</li>
              <li>Responder a comentários, perguntas e solicitações</li>
              <li>Enviar informações técnicas, atualizações e mensagens administrativas</li>
              <li>Monitorar e analisar tendências, uso e atividades</li>
              <li>Detectar, prevenir e resolver problemas técnicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Compartilhamento de Informações</h2>
            <p className="text-muted-foreground">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais
              com terceiros, exceto nas seguintes circunstâncias:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir com obrigações legais</li>
              <li>Para proteger os direitos e segurança do Movix e de nossos usuários</li>
              <li>Com prestadores de serviços que nos auxiliam (sob acordos de confidencialidade)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Segurança dos Dados</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de segurança técnicas e organizacionais
              apropriadas para proteger suas informações pessoais contra acesso
              não autorizado, alteração, divulgação ou destruição:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação segura com hash de senhas</li>
              <li>Controle de acesso baseado em perfis</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares dos dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Seus Direitos</h2>
            <p className="text-muted-foreground">
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="text-muted-foreground list-disc space-y-2 pl-6">
              <li>Acessar e receber uma cópia de seus dados</li>
              <li>Corrigir dados imprecisos ou incompletos</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Opor-se ao processamento de seus dados</li>
              <li>Solicitar a portabilidade de seus dados</li>
              <li>Retirar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Retenção de Dados</h2>
            <p className="text-muted-foreground">
              Retemos suas informações pessoais pelo tempo necessário para
              cumprir os propósitos descritos nesta Política de Privacidade,
              a menos que um período de retenção mais longo seja exigido ou
              permitido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Cookies e Tecnologias Similares</h2>
            <p className="text-muted-foreground">
              Usamos cookies e tecnologias similares para coletar informações
              sobre sua navegação e melhorar sua experiência. Você pode
              configurar seu navegador para recusar cookies, mas isso pode
              afetar a funcionalidade do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta Política de Privacidade periodicamente.
              Notificaremos você sobre quaisquer alterações publicando a nova
              Política de Privacidade nesta página e atualizando a data de
              "Última atualização".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Contato</h2>
            <p className="text-muted-foreground">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre
              nossas práticas de privacidade, entre em contato conosco:
            </p>
            <p className="text-muted-foreground">
              Email: privacidade@movix.com<br />
              Telefone: (11) 1234-5678
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <Link
              href="/terms"
              className="text-primary hover:underline"
            >
              Termos de Serviço
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

