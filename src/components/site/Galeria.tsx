"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Imagem } from "./Imagem";

export type Foto = { id: string; src: string; legenda: string };

/** Grade de fotos; clicar abre a foto em tela cheia, com setas (e teclado) para navegar. */
export function Galeria({ fotos }: { fotos: Foto[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  const ir = useCallback(
    (passo: number) => setAberta((i) => (i === null ? i : (i + passo + fotos.length) % fotos.length)),
    [fotos.length],
  );

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (aberta !== null && !d.open) d.showModal?.();
    if (aberta === null && d.open) d.close();
  }, [aberta]);

  useEffect(() => {
    if (aberta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta, ir]);

  const atual = aberta !== null ? fotos[aberta] : null;

  return (
    <>
      <ul className="galeria">
        {fotos.map((f, i) => (
          <li key={f.id}>
            <button type="button" className="galeria__item" onClick={() => setAberta(i)} aria-label={`Ampliar foto${f.legenda ? `: ${f.legenda}` : ` ${i + 1}`}`}>
              <Imagem src={f.src} alt={f.legenda} sizes="(max-width: 760px) 50vw, 260px" largura={600} altura={600} />
              {f.legenda && <span className="galeria__legenda">{f.legenda}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        className="galeria__tela"
        aria-label="Foto ampliada"
        onClose={() => setAberta(null)}
        onClick={(e) => e.target === e.currentTarget && setAberta(null)}
      >
        {atual && (
          <figure>
            <Imagem src={atual.src} alt={atual.legenda} sizes="100vw" largura={1600} altura={1067} />
            {(atual.legenda || fotos.length > 1) && (
              <figcaption>
                {atual.legenda}
                {fotos.length > 1 && <span> · {aberta! + 1} de {fotos.length}</span>}
              </figcaption>
            )}
          </figure>
        )}
        <button type="button" className="galeria__fechar" onClick={() => setAberta(null)} aria-label="Fechar">
          ✕
        </button>
        {fotos.length > 1 && (
          <>
            <button type="button" className="galeria__seta galeria__seta--ant" onClick={() => ir(-1)} aria-label="Foto anterior">
              ‹
            </button>
            <button type="button" className="galeria__seta galeria__seta--prox" onClick={() => ir(1)} aria-label="Próxima foto">
              ›
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
