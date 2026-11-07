import {
  Anchor, Award, BadgeCheck, BookOpen, Brain, Briefcase, Calendar, ChartLine, Clock, Coffee, Compass, Crown, Eye, Feather, Flag,
  Gem, Globe, Goal, GraduationCap, HandHeart, Handshake, Heart, Infinity as InfinityIcon, Key, Leaf, Lightbulb, ListChecks, MapPin,
  MessageCircle, Mic, Monitor, Mountain, NotebookPen, Presentation, Puzzle, Rocket, Route, ShieldCheck, Smile, Sparkles, Sprout, Star,
  Sun, Target, TrendingUp, Trophy, User, Users, Video, Zap, type LucideIcon,
} from "lucide-react";

// Ícones Lucide disponíveis no painel. Importados um a um para não levar a biblioteca inteira ao navegador.
// A chave é o que fica salvo no site.json; "nome" e "busca" aparecem no seletor do painel.
export const ICONES: Record<string, { Icone: LucideIcon; nome: string; busca?: string }> = {
  brain: { Icone: Brain, nome: "Mente", busca: "cérebro pensamento autoconhecimento" },
  target: { Icone: Target, nome: "Alvo", busca: "meta objetivo foco" },
  goal: { Icone: Goal, nome: "Meta", busca: "objetivo bandeira" },
  sparkles: { Icone: Sparkles, nome: "Brilho", busca: "destaque especial mágica" },
  heart: { Icone: Heart, nome: "Coração", busca: "amor emoção cuidado" },
  "hand-heart": { Icone: HandHeart, nome: "Cuidado", busca: "acolhimento apoio" },
  smile: { Icone: Smile, nome: "Sorriso", busca: "felicidade bem-estar" },
  user: { Icone: User, nome: "Pessoa", busca: "individual sessão" },
  users: { Icone: Users, nome: "Equipe", busca: "grupo time pessoas" },
  handshake: { Icone: Handshake, nome: "Parceria", busca: "acordo empresa" },
  briefcase: { Icone: Briefcase, nome: "Carreira", busca: "trabalho profissional empresa" },
  "trending-up": { Icone: TrendingUp, nome: "Crescimento", busca: "evolução resultado subir" },
  "chart-line": { Icone: ChartLine, nome: "Resultados", busca: "gráfico desempenho performance" },
  rocket: { Icone: Rocket, nome: "Foguete", busca: "lançamento alta performance" },
  zap: { Icone: Zap, nome: "Energia", busca: "raio motivação produtividade" },
  lightbulb: { Icone: Lightbulb, nome: "Ideia", busca: "lâmpada criatividade" },
  compass: { Icone: Compass, nome: "Bússola", busca: "direção propósito rumo" },
  route: { Icone: Route, nome: "Caminho", busca: "jornada trajetória" },
  mountain: { Icone: Mountain, nome: "Montanha", busca: "desafio superação" },
  flag: { Icone: Flag, nome: "Bandeira", busca: "conquista chegada" },
  trophy: { Icone: Trophy, nome: "Troféu", busca: "vitória conquista" },
  award: { Icone: Award, nome: "Prêmio", busca: "certificado reconhecimento" },
  "badge-check": { Icone: BadgeCheck, nome: "Certificado", busca: "selo verificado qualidade" },
  star: { Icone: Star, nome: "Estrela", busca: "destaque favorito" },
  crown: { Icone: Crown, nome: "Coroa", busca: "liderança" },
  gem: { Icone: Gem, nome: "Joia", busca: "valor diamante" },
  key: { Icone: Key, nome: "Chave", busca: "solução acesso" },
  puzzle: { Icone: Puzzle, nome: "Quebra-cabeça", busca: "solução estratégia" },
  "shield-check": { Icone: ShieldCheck, nome: "Segurança", busca: "confiança proteção" },
  anchor: { Icone: Anchor, nome: "Âncora", busca: "estabilidade equilíbrio" },
  infinity: { Icone: InfinityIcon, nome: "Infinito", busca: "contínuo" },
  eye: { Icone: Eye, nome: "Visão", busca: "olhar clareza" },
  sprout: { Icone: Sprout, nome: "Broto", busca: "crescimento desenvolvimento" },
  leaf: { Icone: Leaf, nome: "Folha", busca: "equilíbrio natureza" },
  sun: { Icone: Sun, nome: "Sol", busca: "energia positividade" },
  feather: { Icone: Feather, nome: "Pena", busca: "leveza escrita" },
  "message-circle": { Icone: MessageCircle, nome: "Conversa", busca: "diálogo comunicação" },
  mic: { Icone: Mic, nome: "Microfone", busca: "palestra fala" },
  presentation: { Icone: Presentation, nome: "Apresentação", busca: "palestra treinamento quadro" },
  "graduation-cap": { Icone: GraduationCap, nome: "Formação", busca: "curso estudo capelo" },
  "book-open": { Icone: BookOpen, nome: "Livro", busca: "conhecimento leitura" },
  "notebook-pen": { Icone: NotebookPen, nome: "Caderno", busca: "anotações exercícios" },
  "list-checks": { Icone: ListChecks, nome: "Plano de ação", busca: "lista tarefas checklist" },
  calendar: { Icone: Calendar, nome: "Agenda", busca: "data calendário" },
  clock: { Icone: Clock, nome: "Tempo", busca: "relógio gestão do tempo" },
  "map-pin": { Icone: MapPin, nome: "Local", busca: "presencial endereço" },
  globe: { Icone: Globe, nome: "Mundo", busca: "online internacional" },
  monitor: { Icone: Monitor, nome: "Online", busca: "computador tela remoto" },
  video: { Icone: Video, nome: "Vídeo", busca: "online chamada" },
  coffee: { Icone: Coffee, nome: "Café", busca: "conversa bate-papo" },
};

// Emojis usados antes dos ícones Lucide: conteúdo salvo com eles continua aparecendo com o ícone equivalente.
const EMOJI_PARA_ICONE: Record<string, string> = {
  "🧠": "brain", "🎯": "target", "✨": "sparkles", "💬": "message-circle", "❤️": "heart", "🚀": "rocket",
  "💡": "lightbulb", "🏆": "trophy", "⭐": "star", "📚": "book-open", "🎓": "graduation-cap", "🎤": "mic", "🤝": "handshake",
};

export function iconePorNome(nome: string): LucideIcon | null {
  const chave = ICONES[nome] ? nome : EMOJI_PARA_ICONE[nome.trim()];
  return chave ? ICONES[chave].Icone : null;
}

/** Ícone Lucide pelo nome salvo. Valores desconhecidos (ex.: um emoji antigo) aparecem como texto. */
export function Icone({ nome, className, tamanho = 28 }: { nome: string; className?: string; tamanho?: number }) {
  const Comp = iconePorNome(nome);
  if (Comp) return <Comp className={className} size={tamanho} strokeWidth={1.75} aria-hidden="true" />;
  return nome ? (
    <span className={className} aria-hidden="true">
      {nome}
    </span>
  ) : null;
}
