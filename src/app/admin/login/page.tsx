import { redirect } from "next/navigation";
import { estaLogado } from "@/lib/auth";
import { painelConfigurado } from "@/lib/sessao";
import { entrar } from "../actions";
import { CampoSenha } from "../CampoSenha";

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  if (await estaLogado()) redirect("/admin");
  const { erro } = await searchParams;

  return (
    <main className="adm-login">
      <form action={entrar} className="adm-login__caixa">
        <h1>Painel do site</h1>
        {!painelConfigurado() ? (
          <p className="adm-erro">
            O painel está desativado: defina as variáveis <code>ADMIN_EMAIL</code> e <code>ADMIN_PASSWORD</code> (no arquivo{" "}
            <code>.env.local</code> ou no Docker) e reinicie o servidor.
          </p>
        ) : (
          <>
            <label className="adm-campo">
              <span>E-mail</span>
              <input type="email" name="email" required autoFocus autoComplete="username" />
            </label>
            <label className="adm-campo">
              <span>Senha</span>
              <CampoSenha />
            </label>
            {erro && <p className="adm-erro">E-mail ou senha incorretos.</p>}
            <button className="adm-btn adm-btn--primario" type="submit">
              Entrar
            </button>
          </>
        )}
        <a href="/" className="adm-link">
          ← Voltar ao site
        </a>
      </form>
    </main>
  );
}
