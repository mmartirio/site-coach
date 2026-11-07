import type { Tema } from "./schema";

export type Cores = Omit<Tema, "fonteTitulos" | "fonteTexto">;
export type TemaPronto = { id: string; nome: string; escuro: boolean; cores: Cores };

export const TEMAS: TemaPronto[] = [
  {
    id: "ameixa",
    nome: "Ameixa (original)",
    escuro: false,
    cores: {
      corPrimaria: "#7a3e65", corPrimariaEscura: "#5a2a4a", corDestaque: "#e8a87c", corTexto: "#2d2a32", corTextoSuave: "#6b6570",
      corFundo: "#fffaf6", corFundoSuave: "#f6ece6", corTitulos: "#5a2a4a", corCartao: "#fdf6f9", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "rose",
    nome: "Rosé",
    escuro: false,
    cores: {
      corPrimaria: "#b04a6f", corPrimariaEscura: "#843452", corDestaque: "#f0b99a", corTexto: "#33262b", corTextoSuave: "#75636a",
      corFundo: "#fffafa", corFundoSuave: "#fbeef1", corTitulos: "#843452", corCartao: "#fff4f7", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "lavanda",
    nome: "Lavanda",
    escuro: false,
    cores: {
      corPrimaria: "#6b5ca5", corPrimariaEscura: "#4a3f7a", corDestaque: "#f4a7b9", corTexto: "#2b2838", corTextoSuave: "#6a6680",
      corFundo: "#fcfbff", corFundoSuave: "#f0edf9", corTitulos: "#4a3f7a", corCartao: "#f6f3fd", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "oceano",
    nome: "Oceano",
    escuro: false,
    cores: {
      corPrimaria: "#1f5f8b", corPrimariaEscura: "#143f5e", corDestaque: "#f2a65a", corTexto: "#1e2a33", corTextoSuave: "#5b6b77",
      corFundo: "#f7fafc", corFundoSuave: "#e8f1f7", corTitulos: "#143f5e", corCartao: "#f1f7fc", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "petroleo",
    nome: "Azul-petróleo",
    escuro: false,
    cores: {
      corPrimaria: "#0f766e", corPrimariaEscura: "#0b4f4a", corDestaque: "#f59e0b", corTexto: "#1f2a2a", corTextoSuave: "#5b6b6a",
      corFundo: "#f8fbfa", corFundoSuave: "#e6f2f0", corTitulos: "#0b4f4a", corCartao: "#f0f8f6", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "salvia",
    nome: "Sálvia",
    escuro: false,
    cores: {
      corPrimaria: "#3f6b4f", corPrimariaEscura: "#2a4a36", corDestaque: "#d9a441", corTexto: "#22302a", corTextoSuave: "#5f6d64",
      corFundo: "#fbfaf5", corFundoSuave: "#eef2e8", corTitulos: "#2a4a36", corCartao: "#f5f8ef", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "terracota",
    nome: "Terracota",
    escuro: false,
    cores: {
      corPrimaria: "#a84f2a", corPrimariaEscura: "#7f3a1f", corDestaque: "#e9c46a", corTexto: "#2f2622", corTextoSuave: "#6e5f58",
      corFundo: "#fffaf4", corFundoSuave: "#f7ebe1", corTitulos: "#7f3a1f", corCartao: "#fdf3ea", corTextoBotao: "#ffffff",
    },
  },
  {
    id: "grafite",
    nome: "Grafite e dourado",
    escuro: false,
    cores: {
      corPrimaria: "#2f3640", corPrimariaEscura: "#1b1f24", corDestaque: "#c9a227", corTexto: "#1f2328", corTextoSuave: "#5f6670",
      corFundo: "#ffffff", corFundoSuave: "#f2f2f0", corTitulos: "#1b1f24", corCartao: "#faf9f5", corTextoBotao: "#ffffff",
    },
  },

  {
    id: "noite-ameixa",
    nome: "Noite ameixa",
    escuro: true,
    cores: {
      corPrimaria: "#e0a3c8", corPrimariaEscura: "#c27aa6", corDestaque: "#f0b48a", corTexto: "#f3edf5", corTextoSuave: "#b9adbf",
      corFundo: "#16121a", corFundoSuave: "#1f1925", corTitulos: "#f6dcea", corCartao: "#2a2231", corTextoBotao: "#1c1220",
    },
  },
  {
    id: "noite-oceano",
    nome: "Noite oceano",
    escuro: true,
    cores: {
      corPrimaria: "#7cc4f0", corPrimariaEscura: "#4f9fd0", corDestaque: "#f2b36d", corTexto: "#e8f0f6", corTextoSuave: "#a7b6c2",
      corFundo: "#0f1720", corFundoSuave: "#16212c", corTitulos: "#d6ecfa", corCartao: "#1d2a37", corTextoBotao: "#0b1520",
    },
  },
  {
    id: "noite-dourada",
    nome: "Noite dourada",
    escuro: true,
    cores: {
      corPrimaria: "#e0bf5a", corPrimariaEscura: "#c9a227", corDestaque: "#d98e5a", corTexto: "#f2f2f2", corTextoSuave: "#b0b0b5",
      corFundo: "#121212", corFundoSuave: "#1b1b1d", corTitulos: "#f5e7b8", corCartao: "#242427", corTextoBotao: "#17140a",
    },
  },
];

const CHAVES_CORES = Object.keys(TEMAS[0].cores) as (keyof Cores)[];

export function temaAtivo(tema: Tema): TemaPronto | null {
  return TEMAS.find((t) => CHAVES_CORES.every((k) => t.cores[k].toLowerCase() === tema[k].toLowerCase())) ?? null;
}

export function aplicarTema(tema: Tema, pronto: TemaPronto): Tema {
  return { ...tema, ...pronto.cores };
}
