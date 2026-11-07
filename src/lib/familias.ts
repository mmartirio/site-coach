import type { ChaveFonte } from "./fontes";

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const FAMILIAS: Record<ChaveFonte, string> = {
  georgia: SERIF,
  sistema: SANS,
  playfair: `"Playfair Display", ${SERIF}`,
  lora: `Lora, ${SERIF}`,
  merriweather: `Merriweather, ${SERIF}`,
  cormorant: `"Cormorant Garamond", ${SERIF}`,
  "dm-serif": `"DM Serif Display", ${SERIF}`,
  montserrat: `Montserrat, ${SANS}`,
  poppins: `Poppins, ${SANS}`,
  inter: `Inter, ${SANS}`,
  raleway: `Raleway, ${SANS}`,
  lato: `Lato, ${SANS}`,
  "open-sans": `"Open Sans", ${SANS}`,
  nunito: `Nunito, ${SANS}`,
};
