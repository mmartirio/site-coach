import type { Metadata } from "next";
import { BotaoCookies } from "@/components/Analytics";
import { lerSite } from "@/lib/armazenamento";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { info } = await lerSite();
  return {
    title: `Política de cookies | ${info.nome}`,
    description: `Quais cookies o site de ${info.nome} usa e como mudar suas preferências.`,
    alternates: { canonical: "/cookies" },
  };
}

type Linha = { nome: string; tipo: string; finalidade: string; duracao: string };

export default async function PoliticaDeCookies() {
  const { info, seo } = await lerSite();
  const temAnalytics = Boolean(seo.googleAnalyticsId);

  const linhas: Linha[] = [
    {
      nome: "consentimento-analytics",
      tipo: "Preferência (armazenamento local)",
      finalidade: "Guarda se você aceitou ou recusou o Google Analytics, para não perguntar de novo a cada visita.",
      duracao: "Até você limpar os dados do navegador",
    },
    ...(temAnalytics
      ? [
          {
            nome: "_ga, _ga_*",
            tipo: "Estatística (Google Analytics)",
            finalidade:
              "Contam visitas e cliques de forma agregada para entender quais conteúdos interessam mais. Só são criados se você clicar em Aceitar.",
            duracao: "Até 2 anos",
          },
        ]
      : []),
    {
      nome: "coach_admin",
      tipo: "Necessário",
      finalidade: "Mantém a sessão do painel de administração. Só existe para quem entra no painel; visitantes do site não recebem este cookie.",
      duracao: "7 dias",
    },
  ];

  return (
    <main className="pagina-legal">
      <div className="container">
        <a href="/" className="pagina-legal__voltar">
          ← Voltar ao site
        </a>
        <h1>Política de cookies</h1>
        <p>
          Cookies são pequenos arquivos que o site guarda no seu navegador. Este site de {info.nome} usa poucos cookies e
          nenhum para publicidade.
        </p>

        <h2>Cookies usados</h2>
        <div className="pagina-legal__tabela">
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tipo</th>
                <th scope="col">Para que serve</th>
                <th scope="col">Duração</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.nome}>
                  <td>
                    <code>{l.nome}</code>
                  </td>
                  <td>{l.tipo}</td>
                  <td>{l.finalidade}</td>
                  <td>{l.duracao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Suas escolhas</h2>
        {temAnalytics ? (
          <>
            <p>
              O Google Analytics só é ativado depois que você aceita no aviso de cookies. Você pode mudar sua escolha a qualquer
              momento; ao recusar, os cookies do Analytics são apagados.
            </p>
            <p>
              <BotaoCookies />
            </p>
          </>
        ) : (
          <p>No momento o site não usa cookies de estatística.</p>
        )}
        <p>
          Também é possível apagar ou bloquear cookies nas configurações do seu navegador.
          {info.email && (
            <>
              {" "}
              Dúvidas: <a href={`mailto:${info.email}`}>{info.email}</a>.
            </>
          )}
        </p>
      </div>
    </main>
  );
}
