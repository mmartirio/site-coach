# Site Coach

Landing page para coach (**Coach Pessoal e Profissional** e **Treinamentos e Palestras**) com painel para editar
textos, imagens, seções, cores e fontes sem mexer no código.

[![CI/CD](https://github.com/mmartirio/site-coach/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/mmartirio/site-coach/actions/workflows/ci-cd.yml)

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Zod · Lucide · Jest + Testing Library · Husky · Docker · GitHub Actions

## Começando (Windows)

```powershell
.\iniciar.ps1              # instala, roda typecheck + testes e sobe o "npm run dev"
.\iniciar.ps1 -SemTestes   # pula typecheck e testes
.\iniciar.ps1 -Producao    # build de produção + "npm start"
.\iniciar.ps1 -Docker      # sobe via docker compose
```

- Site: http://localhost:3010 · Painel: http://localhost:3010/admin
- Na primeira execução o script cria o acesso ao painel em `.env.local` (ou `.env` no modo Docker):
  e-mail `admin@coach.local` e uma senha aleatória, mostrada na tela.
- A porta é fixa (3010). Se estiver ocupada, o script mostra qual processo está usando e para.
- Se o PowerShell bloquear scripts: `powershell -ExecutionPolicy Bypass -File .\iniciar.ps1`

Em outros sistemas: `npm install`, copie `.env.example` para `.env.local`, defina `ADMIN_EMAIL` e `ADMIN_PASSWORD`
e rode `npm run dev`.

## Painel (`/admin`)

Login com **e-mail e senha** (`ADMIN_EMAIL` e `ADMIN_PASSWORD`), com botão para mostrar a senha. A sessão dura 7 dias e é encerrada ao trocar
qualquer um dos dois.

| Aba | O que dá para alterar |
| --- | --- |
| Seções | Topo (fixo) e as seções da página: criar, editar, reordenar, duplicar, ocultar e excluir |
| Cores e fontes | Temas prontos (8 claros e 3 escuros), ajuste cor por cor e fontes de títulos e texto |
| Informações | Nome, WhatsApp, e-mail, Instagram, rodapé, Google e compartilhamento |

**Tipos de seção:** Texto e imagem · Cards (com ícones Lucide) · Palestras e treinamentos · Galeria · Etapas ·
Chamada (CTA) · Contato.

**Em qualquer seção (inclusive no topo)** dá para acrescentar blocos de **subtítulo, texto, imagem e botão**,
acima ou abaixo do conteúdo.

- **Palestras e treinamentos:** cada card tem tipo (palestra ou treinamento), imagem, data, local, duração,
  investimento, descrição, "o que você vai aprender" e link de inscrição. Com link, o card inteiro é clicável.
- **Galeria:** envio de várias fotos de uma vez; no site, as fotos ampliam em tela cheia com navegação.
- **CTA:** faixa com título, texto e botões para o WhatsApp (com mensagem pronta) ou para um link.

A pré-visualização ao lado atualiza enquanto se edita; nada vai para o site até clicar em **Salvar e publicar** (ou Ctrl+S).

### Onde ficam os dados

- Conteúdo: `data/site.json` (se não existir, o site usa o padrão de [`src/lib/conteudo-padrao.ts`](src/lib/conteudo-padrao.ts)).
- Imagens enviadas: `data/uploads/` (PNG, JPG, WEBP ou GIF, até 5 MB).
- A pasta `data/` não vai para o git. No Docker ela fica no volume `site-dados`. **Faça backup dessa pasta.**
- Conteúdo salvo em versões anteriores continua válido: campos novos recebem valores padrão.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `ADMIN_EMAIL` | sim | E-mail de acesso ao painel |
| `ADMIN_PASSWORD` | sim | Senha do painel |
| `SESSION_SECRET` | não | Segredo da sessão. Sem ele, é derivado do e-mail e da senha |
| `COOKIE_SECURE` | não | `false` só para testar por http num IP da rede (em produção o login exige HTTPS) |
| `SITE_URL` | não | Endereço público. O campo "Endereço do site" do painel tem prioridade |
| `DATA_DIR` | não | Pasta dos dados (padrão: `./data`; no Docker, `/app/data`) |

## Google (Search Console, Analytics) e desempenho

Configurado no painel, aba **Informações › Google e compartilhamento**:

| Campo | Para quê |
| --- | --- |
| Endereço do site | URL oficial (https). Vai no sitemap, no link canônico e no compartilhamento |
| Código de verificação | Search Console › verificar por **Tag HTML** (pode colar a tag inteira) |
| ID do Google Analytics | GA4, formato `G-XXXXXXXXXX` |
| Imagem ao compartilhar | 1200×630. Sem ela: foto do topo; sem foto: imagem gerada em `/og` |

- **Search Console:** depois de verificar, envie `https://SEU-SITE/sitemap.xml`. O `robots.txt` libera o site e
  bloqueia `/admin` e `/api`. A página tem Open Graph/Twitter e dados estruturados (schema.org `ProfessionalService`).
- **Analytics e LGPD:** o script do Google só carrega depois que o visitante clica em **Aceitar** no aviso de cookies.
  A [política de cookies](src/app/cookies/page.tsx) fica em `/cookies`, com link no aviso e no rodapé, e permite mudar a
  escolha. Eventos enviados: `generate_lead` (WhatsApp, e-mail) e `select_content` (inscrição em palestra/treinamento).
- **PageSpeed:** a página só leva as **duas fontes do tema**, servidas pelo próprio site (`public/fontes`, com cache
  de 1 ano) e com a fonte dos títulos pré-carregada; o tema padrão não baixa fonte nenhuma. Imagens são geradas no
  servidor com otimização do Next (AVIF/WebP, tamanho por tela, carregamento sob demanda; a foto do topo tem prioridade),
  sem JavaScript no navegador. Galeria e Analytics só carregam JavaScript quando existem na página.
  As animações de rolagem são só CSS (`animation-timeline: view()`) e respeitam "reduzir movimento".
- **Fontes:** para atualizar ou trocar as fontes do painel, rode `node scripts/baixar-fontes.mjs` (baixa os arquivos
  `.woff2` do Google Fonts e gera `src/lib/fontes-css.ts`). O build não precisa de internet.

## CI/CD

O workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) roda em todo push e pull request.
Cada etapa só começa se a anterior passar, então **nenhum deploy acontece sem os testes**:

1. **Testes:** `npm ci`, typecheck, Jest e build de produção.
2. **Imagem Docker:** monta a imagem e testa o container rodando (página, dados estruturados, `robots.txt`,
   `sitemap.xml`, `/cookies`, `/og`, login com e-mail, painel e upload protegidos). Na branch `main`, publica a
   imagem testada em `ghcr.io/mmartirio/site-coach` com as tags `latest` e o SHA do commit.
3. **Deploy (opcionais):** na `main`, **Deploy na Vercel** (depois dos testes) e **Deploy** por SSH num servidor próprio
   (depois da imagem testada). Cada um só roda quando está configurado e confere o site publicado.

O Dependabot abre pull requests semanais com atualizações de npm, Actions e Docker; eles passam pelo mesmo pipeline.

### Ligando o deploy

O deploy fica desligado até a variável `DEPLOY_HOST` existir. Em **Settings › Secrets and variables › Actions** do repositório:

| Tipo | Nome | Valor |
| --- | --- | --- |
| Variable | `DEPLOY_HOST` | Endereço do servidor |
| Variable | `DEPLOY_USER` | Usuário SSH |
| Variable | `DEPLOY_PORT` | Porta SSH (opcional, padrão 22) |
| Variable | `DEPLOY_PATH` | Pasta no servidor (opcional, padrão `~/site-coach`) |
| Variable | `SITE_URL` | Endereço público, para a conferência pós-deploy |
| Secret | `DEPLOY_SSH_KEY` | Chave privada SSH com acesso ao servidor |
| Secret | `GHCR_TOKEN` | Token com `read:packages` (dispensável se o pacote no GHCR for público) |

No servidor: Docker com Compose e um arquivo `.env` na pasta de deploy com `ADMIN_EMAIL`, `ADMIN_PASSWORD` e,
de preferência, `SITE_URL`. O site sobe na porta 3010; coloque um proxy com HTTPS (Nginx, Caddy, Traefik) na frente.
O ambiente `producao` pode exigir aprovação manual em **Settings › Environments**.

## Vercel (vitrine)

O site também está publicado na Vercel: https://site-coach-tree.vercel.app (funções em São Paulo, `gru1`, via [`vercel.json`](vercel.json)).

- A Vercel não guarda arquivos de forma permanente, então **lá o painel não salva** (mostra um aviso). O conteúdo exibido é o
  padrão do código. Para editar o site pelo painel, use a hospedagem com Docker.
- O GitHub **não** está conectado à Vercel de propósito: o deploy acontece pelo pipeline, no job **Deploy na Vercel**,
  que só roda depois dos testes. Para ligá-lo, em **Settings › Secrets and variables › Actions**:

| Tipo | Nome | Valor |
| --- | --- | --- |
| Secret | `VERCEL_TOKEN` | Token criado em https://vercel.com/account/tokens |
| Variable | `VERCEL_ORG_ID` | `team_ixpieGZZ5eMNIvPCNeggC19Y` |
| Variable | `VERCEL_PROJECT_ID` | `prj_iUA4uAB5BjarB7BlmM8ZW6wV5PPe` |
| Variable | `VERCEL_URL_PRODUCAO` | `https://site-coach-tree.vercel.app` |

Deploy manual (depois de `npm test` passar): `vercel deploy --prod`. O `.vercelignore` impede o envio de `.env.local` e `data/`.

## Docker

```bash
cp .env.example .env        # defina ADMIN_EMAIL e ADMIN_PASSWORD
docker compose up --build   # http://localhost:3010
```

Em produção, use `docker-compose.prod.yml`, que baixa a imagem publicada pelo CI em vez de montar localmente.

## Comandos

```bash
npm install        # instala dependências e ativa o hook do Husky
npm run dev        # http://localhost:3010
npm test           # testes (Jest)
npm run typecheck  # checagem de tipos
npm run build      # build de produção
```

O hook `pre-commit` do Husky roda typecheck e testes antes de cada commit.

## Estrutura

```
src/
  app/
    page.tsx, layout.tsx      site público (lê data/site.json) e metadados de SEO
    admin/                    painel: login, editor, ações de salvar
    api/admin/upload/         envio de imagens (exige login)
    uploads/[arquivo]/        serve as imagens enviadas
    cookies/                  política de cookies
    og/, sitemap.ts, robots.ts imagem de compartilhamento, sitemap e robots
  components/
    site/                     renderização do site, seções, galeria, imagens
    Analytics.tsx             Google Analytics com consentimento
  lib/                        schema (validação), conteúdo padrão, temas, fontes, ícones, SEO, sessão, armazenamento
__tests__/                    testes do site, painel, validação, sessão, temas, SEO e cookies
.github/                      CI/CD e Dependabot
```
