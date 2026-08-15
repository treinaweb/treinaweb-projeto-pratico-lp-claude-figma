# 02 — Hero

O nó informado (`215:16`) é o grupo da página inteira (1440×8220). Não existe um frame "hero" isolado no Figma — os elementos abaixo são filhos diretos desse grupo, na faixa `y ≈ 50–900`.

Todas as coordenadas desta spec são **absolutas no frame de 1440px** do Figma. O container útil é o mesmo da navbar (`x: 175–1265`, 1090px, token `--spacing-container`) e a section começa em `y: 100` (logo abaixo da navbar), então os offsets no código são `(frameX − 175, frameY − 100)`.

## Coluna de texto

| Elemento | Node | Posição no frame | Especificação |
|---|---|---|---|
| Título | `101:195` | x=175, y=215, 618×128 | Clash Display **Bold**, 64px/64px, `capitalize` |
| Parágrafo | `101:196` | x=175, y=367, 638×56 | Clash Display **Medium**, 18px/28px, `capitalize`, preto `opacity: 0.5` |
| Get Started | `101:198`–`101:202` | x=175, y=447, 180×60 | Reaproveita `<Button>` da navbar + seta SVG 24px, `gap: 8` |
| Watch Video | `101:203`–`101:207` | x=395, y=462, 154×29 | Ícone play 29×29 + texto Clash Display Medium 18/28 preto, `gap: 14` |

## Decorativos

Posições e tamanhos são os do **asset renderizado** (com o sangramento de blur/sombra incluso), não a caixa nominal do node — ver metodologia abaixo.

| Elemento | Node | Posição / tamanho de render | Asset |
|---|---|---|---|
| Glow do título (vermelho→laranja) | `101:132` | x=241, y=52, 517×430 | `public/hero/glow-title.svg` |
| Glow dos celulares | `101:129` | x=860, y=107.5, 567×764 | `public/hero/glow-phones.svg` |
| Cluster de 3 iPhones + anéis + 2 estrelas | `101:181`+`101:210`+`101:216` | x=721, y=52, 721×904 | `public/hero/png-iphone-full.png` (composto único, transparência real) |
| Card preto rotacionado | `101:98` | x=141.5, y=524, 569×427 | `public/hero/badge-card.svg` |
| Estrela superior | `101:208` | x=55, y=127.5, 46×46 | `public/hero/star.svg` |
| Estrela inferior | `101:209` | x=290, y=580.5, 46×46 | `public/hero/star.svg` (mesma forma) |

## Metodologia de posicionamento

As caixas nominais dos nodes (`get_metadata`) **não** correspondem ao que o Figma renderiza: filtros de blur expandem o bounding box, e alguns nodes (as estrelas) reportam `x` deslocado ~36px do render real.

Para resolver isso de forma verificável:

1. `get_screenshot` do nó `215:16` com `maxDimension: 5887` → render do design em **1440px de largura real**, recortado na faixa da hero.
2. Para cada asset exportado, comparação do **bounding box de pixels escuros** entre o export e esse render, obtendo escala e offset exatos. Todos os assets resultaram em escala ≈1.00 (0.999–1.007).
3. Verificação final: `getBoundingClientRect()` de cada elemento na página convertido para coordenadas do frame, mais um diff pixel a pixel do screenshot contra o render do Figma — título, botão e card fecharam com **dx ≤ 2px, dy = 0**.

## Decisões fora do design

- **Decorativos como imagem, não DOM**: o cluster de iPhones, o card preto e os glows são composições complexas (rotações, máscaras, blur). Reconstruí-los em CSS divergiria facilmente do pixel.
- **Glows como SVG com alpha real, não PNG + `mix-blend-multiply`** *(revisado em 14/08/2026)*: a primeira versão usava PNGs opacos com fundo branco sólido, compensados por `mix-blend-multiply` para "descartar" o branco. Isso funciona isoladamente, mas cria um grupo de compositing no navegador — qualquer outro elemento (`badge-card.svg`, as duas `star.svg`) que fique sobre um ancestral compartilhado com um elemento em `mix-blend-multiply` passa a ser pintado contra um fundo opaco pelo próprio processo de blending, resultando em **retângulos brancos visíveis** por cima do card preto e das estrelas — mesmo essas SVGs sendo genuinamente transparentes (confirmado lendo o alpha via canvas). Corrigido exportando `101:132` e `101:129` como SVG (mesmos dois nós, duas elipses borradas cada, igual ao `orange-detail-right.svg` da seção Features) e removendo `mix-blend-multiply` das `<Image>`. Sem elemento em modo de blend, o grupo de compositing deixa de existir e o artefato não pode voltar. Os SVGs exportados já vêm dimensionados 1:1 para as mesmas caixas `DECOR` validadas (517×430 e ~567×764), então as posições não mudaram.
- **SVGs com bounding box da página inteira**: `download_assets` incluiu, em `badge-card.svg` e `star.svg`, um `<rect>` de fundo (`#392F39`) e um clip-path de 1440×5887 herdados do documento. Removidos manualmente, mantendo só os paths reais.
- **Mobile (< 1024px)**: título/parágrafo/botões centralizados, título escala (`40px` → `52px` em `md`). Todos os decorativos ficam `hidden` — o design não tem versão mobile para eles e pesariam no carregamento.
- **`overflow-x-clip` no `<body>`**: o card preto e a estrela superior sangram para fora do container (até 120px à esquerda). Trava global de overflow-x evita scroll horizontal.

### Correções feitas ao longo da implementação

Registro do que deu errado antes de chegar no estado atual, para não repetir nas próximas seções:

- **Cluster de iPhones remontado de 3 exports**: a primeira versão posicionava `101:181`, `101:210` e `101:216` separadamente. Os exports vinham opacos e com bleed de sombra inconsistente, produzindo uma caixa branca visível, celulares sobrepostos e uma borda reta espúria. Substituído pelo composto único `png-iphone-full.png`.
- **`101:132` descartado por engano**: no planejamento assumi que esse nó estava coberto por outro elemento. É justamente o **glow laranja atrás do título** — o elemento mais visível que faltava.
- **Card preto deslocado 34.65px para cima**: eu havia "compensado" a diferença entre a caixa do node (357.7 de altura) e a do export (427), assumindo que o blur expandia nos dois sentidos. O blur expande só para baixo; a posição correta é o `y` do node sem ajuste.
- **Linha de botões 23px abaixo do design**: usava `mt-[47px]` em vez do `mt-6` (24px) que o Figma pede.
- **Parágrafo sem `capitalize`**: o design aplica `text-transform: capitalize` também no parágrafo, não só no título.

## Arquivos

- `src/components/sections/Hero.tsx`
- `src/components/ui/Button.tsx` (+`gap-2` para acomodar ícone)
- `src/app/layout.tsx` (`overflow-x-clip` no body)
- `src/app/page.tsx` (renderiza `<Hero />`)
- `public/hero/*`, `public/icons/*`

## Checklist de aceite

- [x] Build (`npm run build`), lint e `tsc --noEmit` sem erros.
- [x] Título, parágrafo e botões conferidos por `getBoundingClientRect()` contra as coordenadas do Figma (batem exatamente).
- [x] Diff pixel a pixel contra o render do Figma: título, botão e card com dx ≤ 2px, dy = 0.
- [x] Glow do título e glow dos celulares presentes e posicionados.
- [x] Cluster de iPhones sem caixa branca, sobreposição ou borda reta.
- [x] Sem scroll horizontal com os decorativos sangrando do container.
- [ ] Verificação visual em viewport mobile real (< 1024px) — o `resize_window` do Chrome automation não respondeu nesta sessão; a lógica usa o mesmo padrão `hidden lg:block` já validado na navbar, mas vale um teste manual no DevTools antes de dar como definitivo.
- [x] *(14/08/2026)* Glows em SVG com alpha real: sem caixas brancas sobre o card preto ou as estrelas em nenhuma largura de viewport testada (495px, 1394px, 1638px).
