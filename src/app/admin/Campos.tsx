"use client";
import { useState, type ReactNode } from "react";
import { Icone, ICONES } from "@/lib/icones";
import { TAMANHO_MAXIMO_IMAGEM } from "@/lib/imagens";

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <label className="adm-campo">
      <span>{rotulo}</span>
      {children}
      {dica && <small>{dica}</small>}
    </label>
  );
}

type Basico = { rotulo: string; valor: string; onChange: (v: string) => void; dica?: string; placeholder?: string };

export function CampoTexto({ rotulo, valor, onChange, dica, placeholder, tipo = "text" }: Basico & { tipo?: string }) {
  return (
    <Campo rotulo={rotulo} dica={dica}>
      <input type={tipo} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Campo>
  );
}

export function CampoArea({ rotulo, valor, onChange, dica, placeholder, linhas = 4 }: Basico & { linhas?: number }) {
  return (
    <Campo rotulo={rotulo} dica={dica}>
      <textarea rows={linhas} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Campo>
  );
}

export function CampoCor({ rotulo, valor, onChange }: Omit<Basico, "dica" | "placeholder">) {
  return (
    <label className="adm-cor">
      <input type="color" value={valor} onChange={(e) => onChange(e.target.value)} />
      <span>
        {rotulo}
        <small>{valor.toUpperCase()}</small>
      </span>
    </label>
  );
}

export async function enviarImagem(arquivo: File): Promise<{ url: string } | { erro: string }> {
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) return { erro: `"${arquivo.name}" é maior que 5 MB.` };
  try {
    const fd = new FormData();
    fd.append("arquivo", arquivo);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.url) return { erro: j.erro ?? "Falha no envio." };
    return { url: j.url };
  } catch {
    return { erro: "Falha no envio. Verifique a conexão." };
  }
}

export function CampoImagem({ rotulo, valor, onChange }: Omit<Basico, "dica" | "placeholder">) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setErro("");
    setEnviando(true);
    const r = await enviarImagem(arquivo);
    setEnviando(false);
    if ("url" in r) onChange(r.url);
    else setErro(r.erro);
  }

  return (
    <div className="adm-campo">
      <span>{rotulo}</span>
      <div className="adm-imagem">
        {valor ? <img src={valor} alt="" /> : <div className="adm-imagem__vazia">Sem imagem</div>}
        <div className="adm-imagem__acoes">
          <label className={`adm-btn ${enviando ? "adm-btn--off" : ""}`}>
            {enviando ? "Enviando..." : valor ? "Trocar imagem" : "Enviar imagem"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden disabled={enviando} onChange={enviar} />
          </label>
          {valor && (
            <button type="button" className="adm-btn adm-btn--texto" onClick={() => onChange("")}>
              Remover
            </button>
          )}
          <small>PNG, JPG, WEBP ou GIF, até 5 MB.</small>
        </div>
      </div>
      {erro && <p className="adm-erro">{erro}</p>}
    </div>
  );
}

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SeletorIcone({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const termo = normalizar(busca.trim());
  const lista = Object.entries(ICONES).filter(
    ([chave, i]) => !termo || normalizar(`${chave} ${i.nome} ${i.busca ?? ""}`).includes(termo),
  );
  const atual = ICONES[valor];

  return (
    <div className="adm-campo">
      <span>Ícone</span>
      <div className="adm-icone-atual">
        <span className="adm-icone-atual__previa">{valor ? <Icone nome={valor} tamanho={24} /> : "—"}</span>
        <span className="adm-icone-atual__nome">{atual?.nome ?? (valor ? "Ícone antigo (emoji)" : "Sem ícone")}</span>
        <button type="button" className="adm-btn" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>
          {aberto ? "Fechar" : "Trocar ícone"}
        </button>
      </div>
      {aberto && (
        <div className="adm-icones">
          <input type="search" placeholder="Buscar: carreira, equipe, meta..." value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
          <div className="adm-icones__grade" role="listbox" aria-label="Ícones">
            <button
              type="button"
              role="option"
              aria-selected={!valor}
              className={`adm-icones__opcao ${!valor ? "ativo" : ""}`}
              onClick={() => { onChange(""); setAberto(false); }}
              title="Sem ícone"
            >
              <span className="adm-icones__vazio">∅</span>
              <small>Nenhum</small>
            </button>
            {lista.map(([chave, { Icone: Comp, nome }]) => (
              <button
                key={chave}
                type="button"
                role="option"
                aria-selected={valor === chave}
                className={`adm-icones__opcao ${valor === chave ? "ativo" : ""}`}
                onClick={() => { onChange(chave); setAberto(false); }}
                title={nome}
              >
                <Comp size={22} strokeWidth={1.75} aria-hidden="true" />
                <small>{nome}</small>
              </button>
            ))}
          </div>
          {lista.length === 0 && <p className="adm-ajuda">Nenhum ícone encontrado para “{busca}”.</p>}
        </div>
      )}
    </div>
  );
}

export function Alternar({ rotulo, valor, onChange }: { rotulo: string; valor: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="adm-alternar">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} />
      <span>{rotulo}</span>
    </label>
  );
}
