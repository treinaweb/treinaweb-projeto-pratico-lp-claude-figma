# 04 — Testimonials ("What Our Users Say About Us?")

Seção **inspirada** no grupo `101:240` (`Group 1000002334`) do Figma, não uma cópia fiel — pedido explícito do usuário: 3 depoimentos (o Figma mostra só 1 em destaque), ranking com estrelas (inexistente no design) e avatares gerados por IA (o projeto não tinha nenhuma foto de pessoa em `public/`).

## Layout escolhido

Entre as duas composições discutidas com o usuário (grid de 3 cards vs. órbita fiel ao Figma), foi escolhida a **órbita clicável**: anéis concêntricos à esquerda com os 3 avatares como abas (`role="tablist"`), o avatar ativo ampliado no círculo central com o badge de aspas vermelho, e a coluna direita (`role="tabpanel"`) trocando de conteúdo (headline, estrelas, citação, autor) conforme a aba ativa. Decisão tomada via `AskUserQuestion`, com preview ASCII de cada alternativa.

## Coordenadas de referência (Figma)

Grupo `101:240`, 1185×821, dentro do frame `101:79`. Sub-nós usados como referência de proporção (não copiados 1:1, pois a composição interativa redistribui o espaço):

- Cabeçalho `101:241` (eyebrow `101:243` + título `101:242`), centralizado acima da órbita.
- Anéis `101:277`–`101:280` (`Ellipse 2155/2156/2157`): 3 círculos concêntricos levemente deslocados — viraram `div`s `absolute inset-[0%|3.5%|7%] rounded-full border border-black/10`, sem imagem.
- Avatares orbitais `101:282`–`101:286` (`Ellipse 41/42/43/44/45`): posições aproximadas por 3 slots percentuais fixos (`SLOTS` em `Testimonials.tsx`), um por depoimento — a pessoa **não troca de posição** ao ser selecionada, só o estado visual (anel vermelho vs. opacidade reduzida).
- Badge de aspas `101:248`+`101:288`: círculo vermelho `bg-accent` ancorado na borda superior-direita do círculo central, com `/icons/quote.svg` (aspas brancas, recriadas a partir do vetor `101:288`).
- Coluna de depoimento `101:245` (headline `101:247`, corpo `101:246`, autor `101:275`): mantida na mesma ordem, com `<StarRating>` inserido entre headline e citação (elemento novo, sem equivalente no Figma).

## Tipografia e cores

Reaproveitada integralmente a escala já usada em `Features.tsx`:

- Eyebrow: Clash Display Medium, 18px/28px, `uppercase`, `tracking-[2.88px]`, `text-accent` (`#FF5555`).
- H2: Clash Display Bold, 36px/40px mobile → 48px/48px `lg`, `capitalize`.
- Headline do depoimento: Clash Display Bold, 24px/32px mobile → 28px/36px `lg`.
- Citação: Clash Display Medium, 18px/28px, `text-black/50`.
- Nome do autor: Clash Display Semibold 16px/22px; cargo: Clash Display Medium 14px/20px, `text-black/50`.

## Decisões fora do design

- **Eyebrow em `#FF5555`, não preta**: o Figma (`101:243`) usa preto para "TESTIMONIAL", mas o resto da LP (Features) usa a eyebrow sempre em vermelho — decisão do usuário priorizar consistência interna da página sobre fidelidade a esse detalhe específico do Figma.
- **3 depoimentos com órbita interativa em vez de 1 estático**: exige `"use client"` (segundo componente client do projeto, depois do `Navbar`) e `useState` para o índice ativo. Os 3 avatares orbitais são o único conjunto de controles (`role="tab"` + `aria-selected` + `aria-controls`); a coluna direita é o `tabpanel` correspondente, com `aria-labelledby` apontando pro tab ativo. Navegação por teclado: `ArrowLeft`/`ArrowRight` com roving `tabIndex`.
- **`StarRating` com SVG inline, não `next/image`**: único componente da LP a fugir da convenção de ícone-como-arquivo. Justificativa: a contagem de estrelas preenchidas é dinâmica (`value` 0–5), a cor precisa vir de `currentColor` para reaproveitar uma única definição de path entre estado cheio/vazio, e o grupo de 5 estrelas precisa de um único `aria-label` (`"N out of 5 stars"`) — nenhum desses três requisitos combina bem com arquivos SVG estáticos servidos via `<Image>`.
- **Avatares gerados por IA** (`fal-ai/gemini-3-pro-image-preview`, MCP do fal.ai): 3 headshots fotorrealistas 1:1, 1K, JPEG, fundo neutro claro, luz de estúdio suave. A primeira geração da 3ª pessoa trouxe um refletor/tripé visível no fundo; regenerada com o prompt reforçando "completely plain seamless background, no props, no equipment, no light stands" até sair limpa. Arquivos salvos em `public/testimonials/avatar-{1,2,3}.jpg` (baixados do CDN do fal via `Invoke-WebRequest`, sem manter URLs remotas — `next.config.ts` não tem `images.remotePatterns`).
- **Ratings variados (5, 5, 4)**: para exercitar visualmente o estado de estrela vazia do `StarRating`, já que o Figma não define um valor de referência.
- **Mobile**: órbita e coluna de texto empilham (`grid` de 1 coluna, sem `lg:grid-cols-[600px_1fr]`), cabeçalho e depoimento centralizados (`text-center` até `lg`). Órbita usa `aspect-square` com `max-w` menor no mobile — nenhuma imagem duplicada entre breakpoints, só o tamanho do container muda.

## Regras do Next 16 respeitadas

- Nenhum uso de `priority`/`preload` — a seção fica abaixo da dobra.
- Toda `<Image fill>` recebe `sizes` (avatar central, avatares orbitais, avatar do autor).
- Nenhum `quality` custom — usa o default (75) permitido por `images.qualities`.
- Avatares são arquivos locais em `public/testimonials/`, sem query string.

## Arquivos

- `src/components/sections/Testimonials.tsx`
- `src/components/ui/StarRating.tsx`
- `public/icons/quote.svg`
- `public/testimonials/avatar-1.jpg`, `avatar-2.jpg`, `avatar-3.jpg`
- `src/app/page.tsx` (renderiza `<Testimonials />` depois do `<Features />`)

## Checklist de aceite

- [x] `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros.
- [x] Clique em cada um dos 3 avatares orbitais troca headline, estrelas, citação, nome, cargo e a foto do círculo central.
- [x] Teclado: `Tab` alcança a órbita; `ArrowLeft`/`ArrowRight` percorre as 3 abas.
- [x] Viewport mobile (~495px): sem scroll horizontal (`scrollWidth === clientWidth`), órbita e texto empilhados e centralizados.
- [x] Console sem erros de hidratação; únicos warnings são o padrão pré-existente de `next/image` (aspect ratio via CSS reset) já presente no Navbar/Hero antes desta mudança.
- [x] 3 avatares fotorrealistas, fundo neutro, sem props/equipamentos visíveis em quadro.
