import {
  Cormorant_Garamond, DM_Serif_Display, Inter, Lato, Lora, Merriweather, Montserrat, Nunito, Open_Sans, Playfair_Display, Poppins, Raleway,
} from "next/font/google";
import type { ChaveFonte } from "./fontes";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"] });
const lora = Lora({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"] });
const merriweather = Merriweather({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], display: "swap", preload: false, weight: ["400"] });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const poppins = Poppins({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const raleway = Raleway({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const lato = Lato({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });
const nunito = Nunito({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"] });

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const FAMILIAS: Record<ChaveFonte, string> = {
  georgia: SERIF,
  sistema: SANS,
  playfair: `${playfair.style.fontFamily}, ${SERIF}`,
  lora: `${lora.style.fontFamily}, ${SERIF}`,
  merriweather: `${merriweather.style.fontFamily}, ${SERIF}`,
  cormorant: `${cormorant.style.fontFamily}, ${SERIF}`,
  "dm-serif": `${dmSerif.style.fontFamily}, ${SERIF}`,
  montserrat: `${montserrat.style.fontFamily}, ${SANS}`,
  poppins: `${poppins.style.fontFamily}, ${SANS}`,
  inter: `${inter.style.fontFamily}, ${SANS}`,
  raleway: `${raleway.style.fontFamily}, ${SANS}`,
  lato: `${lato.style.fontFamily}, ${SANS}`,
  "open-sans": `${openSans.style.fontFamily}, ${SANS}`,
  nunito: `${nunito.style.fontFamily}, ${SANS}`,
};
