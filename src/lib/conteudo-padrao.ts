import type { Bloco, Item, Secao, Site, TipoBloco, TipoSecao } from "./schema";

export function novoId(prefixo = "s"): string {
  return `${prefixo}-${Math.random().toString(36).slice(2, 10)}`;
}

export function novoItem(parcial: Partial<Item> = {}): Item {
  return { id: novoId("i"), icone: "", titulo: "", texto: "", lista: [], imagem: "", data: "", local: "", link: "", formato: "palestra", duracao: "", preco: "", ...parcial };
}

export const NOMES_BLOCO: Record<TipoBloco, string> = { subtitulo: "Subtítulo", texto: "Texto", imagem: "Imagem", botao: "Botão" };

export function novoBloco<T extends TipoBloco>(tipo: T): Extract<Bloco, { tipo: T }> {
  const id = novoId("b");
  const blocos: { [K in TipoBloco]: Extract<Bloco, { tipo: K }> } = {
    subtitulo: { id, tipo: "subtitulo", texto: "Novo subtítulo", posicao: "antes" },
    texto: { id, tipo: "texto", texto: "Escreva aqui o texto.", posicao: "depois" },
    imagem: { id, tipo: "imagem", imagem: "", legenda: "", largura: "normal", posicao: "depois" },
    botao: { id, tipo: "botao", texto: "Fale comigo", destino: "whatsapp", link: "", mensagemWhatsapp: "Olá! Vim pelo site.", estilo: "cheio", posicao: "depois" },
  };
  return blocos[tipo];
}

const NOMES_TIPO: Record<TipoSecao, string> = {
  texto: "Texto e imagem",
  cards: "Cards",
  eventos: "Palestras e treinamentos",
  galeria: "Galeria",
  cta: "Chamada (CTA)",
  etapas: "Etapas",
  contato: "Contato",
};
export const nomeDoTipo = (t: TipoSecao) => NOMES_TIPO[t];

export function novaSecao(tipo: TipoSecao): Secao {
  const base = { id: novoId(), titulo: `Nova seção (${NOMES_TIPO[tipo]})`, visivel: true, noMenu: false, fundo: "claro" as const, blocos: [] };
  switch (tipo) {
    case "texto":
      return { ...base, tipo, texto: "Escreva aqui o conteúdo da seção.", imagem: "", imagemLado: "esquerda" };
    case "cards":
      return { ...base, tipo, introducao: "", itens: [novoItem({ icone: "sparkles", titulo: "Novo card", texto: "Descrição do card." })] };
    case "eventos":
      return {
        ...base,
        tipo,
        titulo: "Palestras e treinamentos",
        introducao: "",
        botaoTexto: "Inscreva-se",
        itens: [novoItem({ formato: "palestra", titulo: "Nova palestra", texto: "Descrição da palestra." })],
      };
    case "cta":
      return {
        ...base,
        tipo,
        fundo: "destaque",
        titulo: "Pronta para dar o próximo passo?",
        texto: "Agende uma conversa gratuita e descubra como posso ajudar.",
        botaoTexto: "Agendar conversa",
        destino: "whatsapp",
        link: "",
        mensagemWhatsapp: "Olá! Vim pelo site e quero agendar uma conversa.",
        botao2Texto: "",
        botao2Link: "",
      };
    case "galeria":
      return { ...base, tipo, titulo: "Galeria", introducao: "", itens: [] };
    case "etapas":
      return { ...base, tipo, introducao: "", itens: [novoItem({ titulo: "Primeira etapa", texto: "Descrição da etapa." })] };
    case "contato":
      return { ...base, tipo, fundo: "destaque", titulo: "Vamos conversar?", texto: "", botaoTexto: "Falar no WhatsApp", mensagemWhatsapp: "Olá! Vim pelo site." };
  }
}

export const conteudoPadrao: Site = {
  tema: {
    corPrimaria: "#7a3e65",
    corPrimariaEscura: "#5a2a4a",
    corDestaque: "#e8a87c",
    corTexto: "#2d2a32",
    corTextoSuave: "#6b6570",
    corFundo: "#fffaf6",
    corFundoSuave: "#f6ece6",
    corTitulos: "#5a2a4a",
    corCartao: "#fdf6f9",
    corTextoBotao: "#ffffff",
    fonteTitulos: "georgia",
    fonteTexto: "sistema",
  },
  info: {
    nome: "Nome da Coach",
    titulo: "Coach Pessoal e Profissional",
    descricao: "Coaching pessoal e profissional, treinamentos e palestras.",
    email: "contato@seudominio.com.br",
    whatsapp: "5511999999999",
    instagram: "https://instagram.com/seuperfil",
  },
  topo: {
    rotulo: "Coach Pessoal e Profissional",
    titulo: "Clareza para decidir. Coragem para agir.",
    subtitulo: "Coaching individual, treinamentos e palestras para quem quer crescer na vida e na carreira.",
    botaoTexto: "Agendar conversa gratuita",
    mensagemWhatsapp: "Olá! Gostaria de agendar uma conversa inicial.",
    imagem: "",
    blocos: [],
  },
  secoes: [
    {
      id: "sobre",
      tipo: "texto",
      titulo: "Sobre mim",
      visivel: true,
      noMenu: true,
      fundo: "claro",
      blocos: [],
      imagem: "",
      imagemLado: "esquerda",
      texto:
        "Ajudo pessoas e equipes a ganharem clareza, tomarem decisões com confiança e transformarem objetivos em resultados concretos.\n\nMeu trabalho une escuta atenta, ferramentas de coaching e um plano de ação prático, respeitando o seu ritmo e a sua história.",
    },
    {
      id: "servicos",
      tipo: "cards",
      titulo: "Serviços",
      visivel: true,
      noMenu: true,
      fundo: "suave",
      blocos: [],
      introducao: "",
      itens: [
        novoItem({
          id: "i-coach",
          icone: "brain",
          titulo: "Coach Pessoal e Profissional",
          texto: "Sessões individuais para quem quer evoluir na carreira, mudar de rumo ou reorganizar a vida com mais propósito.",
          lista: [
            "Transição e desenvolvimento de carreira",
            "Autoconhecimento e inteligência emocional",
            "Definição de metas e plano de ação",
            "Sessões online ou presenciais",
          ],
        }),
        novoItem({
          id: "i-treinamentos",
          icone: "target",
          titulo: "Treinamentos e Palestras",
          texto: "Conteúdos sob medida para empresas, escolas e eventos que querem engajar e desenvolver pessoas.",
          lista: [
            "Liderança e comunicação",
            "Produtividade e gestão do tempo",
            "Motivação e alta performance de equipes",
            "Workshops in company",
          ],
        }),
      ],
    },
    {
      id: "treinamentos-e-palestras",
      tipo: "eventos",
      titulo: "Treinamentos e Palestras",
      visivel: true,
      noMenu: true,
      fundo: "claro",
      blocos: [],
      introducao: "Próximos eventos. Clique no card para fazer a sua inscrição.",
      botaoTexto: "Inscreva-se",
      itens: [
        novoItem({
          id: "i-evento-1",
          formato: "treinamento",
          titulo: "Liderança com Propósito",
          texto: "Um encontro prático para líderes que querem engajar equipes com clareza, empatia e foco em resultados.",
          imagem: "/imagens/evento-1.svg",
          data: "Sábado, 05/12 · 9h às 13h",
          local: "Online, ao vivo",
          duracao: "4 horas",
          lista: ["Comunicação que engaja", "Feedback e conversas difíceis", "Plano de ação para a sua equipe"],
          link: "",
        }),
        novoItem({
          id: "i-evento-2",
          formato: "palestra",
          titulo: "Produtividade sem Ansiedade",
          texto: "Como organizar a rotina, priorizar o que importa e manter o equilíbrio entre vida pessoal e profissional.",
          imagem: "/imagens/evento-2.svg",
          data: "Quinta, 10/12 · 19h",
          local: "São Paulo (SP)",
          link: "",
        }),
      ],
    },
    {
      id: "cta-empresas",
      tipo: "cta",
      titulo: "Leve esta transformação para a sua empresa",
      visivel: true,
      noMenu: false,
      fundo: "destaque",
      blocos: [],
      texto: "Palestras e treinamentos sob medida para equipes e lideranças. Conte o seu desafio e receba uma proposta.",
      botaoTexto: "Solicitar proposta",
      destino: "whatsapp",
      link: "",
      mensagemWhatsapp: "Olá! Quero levar uma palestra ou um treinamento para a minha empresa.",
      botao2Texto: "Ver serviços",
      botao2Link: "#servicos",
    },
    {
      id: "como-funciona",
      tipo: "etapas",
      titulo: "Como funciona",
      visivel: true,
      noMenu: true,
      fundo: "suave",
      blocos: [],
      introducao: "",
      itens: [
        novoItem({ id: "i-etapa-1", titulo: "Conversa inicial", texto: "Um bate-papo gratuito para entender o seu momento e seus objetivos." }),
        novoItem({ id: "i-etapa-2", titulo: "Plano personalizado", texto: "Definimos juntos o formato, a frequência e as metas do processo." }),
        novoItem({ id: "i-etapa-3", titulo: "Acompanhamento", texto: "Sessões com ferramentas práticas e tarefas entre os encontros." }),
        novoItem({ id: "i-etapa-4", titulo: "Resultados", texto: "Avaliamos a evolução e consolidamos as conquistas." }),
      ],
    },
    {
      id: "contato",
      tipo: "contato",
      titulo: "Vamos conversar?",
      visivel: true,
      noMenu: true,
      fundo: "destaque",
      blocos: [],
      texto: "A primeira conversa é gratuita e sem compromisso.",
      botaoTexto: "Falar no WhatsApp",
      mensagemWhatsapp: "Olá! Vim pelo site e gostaria de saber mais.",
    },
  ],
  rodape: "",
  seo: { urlSite: "", googleVerificacao: "", googleAnalyticsId: "", imagemCompartilhamento: "" },
};
