export const FONTES = {
  "georgia": { nome: "Georgia (sem download)" },
  "sistema": { nome: "Fonte do sistema (sem download)" },
  "playfair": { nome: "Playfair Display" },
  "lora": { nome: "Lora" },
  "merriweather": { nome: "Merriweather" },
  "cormorant": { nome: "Cormorant Garamond" },
  "dm-serif": { nome: "DM Serif Display" },
  "montserrat": { nome: "Montserrat" },
  "poppins": { nome: "Poppins" },
  "inter": { nome: "Inter" },
  "raleway": { nome: "Raleway" },
  "lato": { nome: "Lato" },
  "open-sans": { nome: "Open Sans" },
  "nunito": { nome: "Nunito" },
} satisfies Record<string, { nome: string }>;

export type ChaveFonte = keyof typeof FONTES;
export const CHAVES_FONTES = Object.keys(FONTES) as [ChaveFonte, ...ChaveFonte[]];
