# LP Figma — Uifry

Landing page construída a partir de um design do Figma, desenvolvida como **projeto de estudo/demonstração para a [TreinaWeb](https://www.treinaweb.com.br/)**.

O objetivo é mostrar, na prática, o caminho completo de **design → código**: partir de um layout pronto no Figma, extrair medidas, cores e tipografia, e reconstruir a página em Next.js com fidelidade ao design — documentando cada decisão em specs versionadas junto do código.

Design de origem: [App Landing Page — Finance Bank Money (Figma Community)](https://www.figma.com/pt-br/comunidade/file/1145991068621514311/app-landing-page-finance-bank-money)

## Como este projeto foi desenvolvido

A landing page foi construída em um fluxo **assistido por IA**, com o [**Claude Code**](https://claude.com/claude-code) conduzindo a implementação e as ferramentas externas conectadas via **MCP (Model Context Protocol)** — o padrão que permite ao agente falar direto com serviços como o Figma e a fal.ai, sem copiar e colar valores na mão.

### Claude Code

Agente de codificação rodando no terminal, responsável por escrever os componentes, medir o resultado no navegador e documentar cada decisão. Duas práticas se repetem no projeto:

- **Specs versionadas junto do código** — cada seção ganhou um arquivo em `specs/` registrando o node-id de origem, as medidas extraídas e, principalmente, o que foi decidido *fora* do design (responsividade, hover, interações). O histórico de decisão vive no repositório, não no chat.
- **Validação medida, não "no olho"** — o layout foi conferido comparando `getBoundingClientRect()` de cada elemento contra as coordenadas do Figma, e com diff pixel a pixel do screenshot renderizado contra o render do design. O Hero, por exemplo, fechou com `dx ≤ 2px, dy = 0`.

### Figma (via MCP)

O design não foi lido só por screenshot: o servidor MCP do Figma expôs o arquivo como dados estruturados, o que permitiu:

- `get_metadata` — a árvore de nodes com posição e tamanho de cada elemento;
- `get_design_context` — cores, tipografia e o código de referência de cada node;
- `get_screenshot` — o render 1:1 usado como referência visual e base dos diffs;
- `download_assets` — export dos SVGs e imagens direto para `public/` (as URLs do Figma expiram em ~7 dias, então os assets ficam versionados no repo).

Onde a caixa nominal do node não correspondia ao que o Figma realmente renderiza (filtros de blur expandem o bounding box), as medidas foram confirmadas por **decodificação pixel a pixel do PNG** — o método está descrito em [`specs/03-features.md`](specs/03-features.md).

### fal.ai (via MCP)

A plataforma de modelos generativos foi usada para produzir os assets que o design não tinha:

| Asset | Modelo | Onde aparece |
|---|---|---|
| 3 headshots fotorrealistas dos depoimentos | `fal-ai/gemini-3-pro-image-preview` | [`Testimonials`](src/components/sections/Testimonials.tsx) |
| Vídeo da tela do app, usado como *scrub* de scroll | `google/gemini-omni-flash/image-to-video` | [`ScrollScene`](src/components/sections/ScrollScene.tsx) |

Vale a divisão de trabalho da cena de scroll, documentada em [`specs/07-cena-scroll.md`](specs/07-cena-scroll.md): **a IA gera apenas o conteúdo da tela do celular**. O deslocamento, a rotação, a escala e a subida do texto são CSS/JS determinísticos — é isso que preserva a fidelidade ao Figma, já que um modelo de vídeo não posicionaria o celular em `left: -133.155px`.

Todos os arquivos gerados foram baixados do CDN e versionados em `public/`; nada aponta para URL remota em runtime.

### Navegador (via MCP)

A automação do Chrome fechou o ciclo: subir o `next dev`, abrir a página, medir elementos, capturar screenshots e ler o console — sem sair do agente. É o que tornou possível a verificação por medida descrita acima.

> **Nota:** as chaves e a configuração dos servidores MCP não estão no repositório. Para reproduzir o fluxo você precisa configurar seus próprios acessos ao Figma e à fal.ai — nada disso é necessário para simplesmente **rodar** o projeto, já que todos os assets gerados estão versionados.

## Tecnologias

| Ferramenta | Versão |
|---|---|
| [Next.js](https://nextjs.org) (App Router) | 16.3.0 |
| [React](https://react.dev) | 19.2.8 |
| [TypeScript](https://www.typescriptlang.org) | ^5 |
| [Tailwind CSS](https://tailwindcss.com) | ^4 |
| ESLint | ^9 |

Fontes: **Plus Jakarta Sans** (via `next/font`) e **Clash Display** (via Fontshare).

## Pré-requisitos

- **Node.js 20 ou superior** (o projeto foi desenvolvido com a v22)
- **npm** (já vem com o Node) — ou yarn/pnpm/bun, se preferir

Confira suas versões:

```bash
node -v
npm -v
```

## Passo a passo para executar

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd lp-figma
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Rode o servidor de desenvolvimento

```bash
npm run dev
```

### 4. Abra no navegador

Acesse [http://localhost:3000](http://localhost:3000).

A página recarrega sozinha a cada alteração salva — comece editando `src/app/page.tsx` ou os componentes em `src/components/`.

### 5. (Opcional) Gere a build de produção

```bash
npm run build
npm run start
```

O `start` serve a build otimizada, também em [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera a build de produção |
| `npm run start` | Serve a build de produção (rode `build` antes) |
| `npm run lint` | Roda o ESLint no projeto |

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx        # Layout raiz: fontes, metadata, Navbar e Footer
│   ├── page.tsx          # Composição da landing page
│   └── globals.css       # Estilos globais e tokens do Tailwind
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Hero, Features, ScrollScene, Testimonials
│   └── ui/               # Button, Glow, Reveal, StarRating, TravelPhone, VideoModal
└── lib/                  # Helpers de navegação e da cena de scroll

public/                   # Imagens, ícones, vídeos e SVGs exportados do Figma
specs/                    # Documentação de cada seção implementada
```

## Seções implementadas

| # | Seção | Spec |
|---|---|---|
| 01 | Navbar | [`specs/01-navbar.md`](specs/01-navbar.md) |
| 02 | Hero | [`specs/02-hero.md`](specs/02-hero.md) |
| 03 | Features | [`specs/03-features.md`](specs/03-features.md) |
| 04 | Testimonials | [`specs/04-testimonials.md`](specs/04-testimonials.md) |
| 05 | Footer | [`specs/05-footer.md`](specs/05-footer.md) |
| 06 | Animações de entrada e enquadramento | [`specs/06-animacoes-e-enquadramento.md`](specs/06-animacoes-e-enquadramento.md) |
| 07 | Cena Hero → Features com vídeo traqueado pelo scroll | [`specs/07-cena-scroll.md`](specs/07-cena-scroll.md) |

## Sobre as specs

Cada arquivo em `specs/` documenta uma seção da página e registra:

- o **node-id** de origem no Figma;
- as **medidas, cores e tipografia** extraídas do design;
- as **decisões tomadas fora do design** (responsividade, estados de hover/foco, interações);
- um **checklist de aceite**.

As specs numeradas a partir da `06` são transversais: valem para a página inteira, não para uma seção específica.

Comece por [`specs/README.md`](specs/README.md) para a visão geral.

---

Projeto criado para a **TreinaWeb** com fins didáticos — desenvolvido com Claude Code, Figma e fal.ai integrados via MCP. O design original pertence aos seus respectivos autores na Figma Community.
