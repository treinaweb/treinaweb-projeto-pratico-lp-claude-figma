# 03 — Features ("Uifry Premium")

> **Correção (14/08/2026):** a versão original desta spec assumia que o grupo de origem (`229:61`) era uma cópia solta no canvas, sem relação com o frame de 1440px da página, e derivava o container por alinhamento interno do próprio grupo. **Isso estava errado** e produzia a seção 103px à esquerda e 256px acima do design real. A seção abaixo documenta o sistema de coordenadas correto, validado por decodificação pixel a pixel do render 1:1 do Figma.

O grupo real desta seção é `101:289` (`Group 1000002336`), filho direto do frame `101:79` ("App Landing Page", 1440×5887) em `x=46, y=943`. Ou seja, os nós desta seção usam o **mesmo espaço de coordenadas do frame** que a navbar (`101:222`) e o Hero — não um espaço próprio.

## Sistema de coordenadas

A seção começa logo abaixo do Hero, em **frame y=687** (fim do Hero: `y=100 + 587` de altura). Os valores de código (`DECOR`, margens) são `(frameX − 175, frameY − 687)`, com `175` sendo a borda esquerda do container, igual ao resto da página.

A coluna de texto (`101:299`) fica em **frame x=730**, 638px de largura — **103px além da borda direita do container de 1090px** (`175 + 1090 = 1265`; o texto vai até `730 + 638 = 1368`). Essa não é uma inconsistência do design: o frame do Figma tem 1440px de largura, e o texto desta seção é posicionado contra esse frame inteiro, não contra o container de 1090px usado pela navbar/Hero. Decisão tomada com o usuário: **manter fidelidade ao Figma** — o texto assume a posição exata (`x=730`) a partir de 1440px de viewport, e cai para um fallback colado à borda do container (sem cortar) entre 1024px e 1439px.

Medições de tinta no render 1:1 do Figma (PNG decodificado localmente, varredura de faixas de luminância) confirmam a tabela abaixo com exatidão:

| Elemento | Figma (frame) | Medido no browser |
|---|---|---|
| eyebrow "FEATURES" | `731, 1071` | `730, 1071` |
| `h2` "Uifry Premium" | `731, 1103` | `730, 1103` |
| título do bloco 1 | `763, 1183` | `762, 1183` |
| ícone do bloco 1 | — | `730, 1185` |

## Coluna de texto (offsets desde o topo da seção, frame y − 687)

| Elemento | Node | Topo | Especificação |
|---|---|---|---|
| Eyebrow `features` | `101:302` | 384 | Clash Display **Medium (500)**, 18px/28px, `uppercase`, `letter-spacing: 2.88px`, `#FF5555` (`text-accent`) |
| Título `uifry premium` | `101:301` | 416 | Clash Display **Bold (700)**, 48px/48px, `capitalize`, preto |
| Feature 1 — título | `101:305` | 496 | Clash Display **Semibold (600)**, 18px/28px, `capitalize`, preto |
| Feature 1 — ícone `star-05` | `101:306` | 498 | 24×24, `gap: 8` até o título |
| Feature 1 — corpo | `101:307` | 536 | Clash Display Medium, 18px/28px, `capitalize`, `text-black/50`, 638px |
| Feature 2 (`cube-02`) | `101:310`–`101:312` | 624 / 626 / 664 | idem |
| Feature 3 (`cube-04`) | `101:315`–`101:317` | 752 / 754 / 792 | idem |

Ritmo vertical (inalterado pela correção): eyebrow → título 4px (`mt-1`), título → 1º bloco 32px (`mt-8`), título do bloco → corpo 12px (`mt-3`), corpo → próximo bloco 32px (`mt-8`, passo de 128px entre blocos). Isso é implementado via `pt-[384px]` na `<section>` + margens relativas entre os elementos, não `top` absoluto por elemento.

## Decorativos

Posições/tamanhos são os do **asset renderizado**, obtidos ancorando a geometria interna de cada SVG (retângulo do telefone, elipses do glow) contra a caixa do node correspondente no Figma. Ambos resolveram escala **1.00**.

| Elemento | Node de referência | Posição (frame) | `DECOR` (offset desde o topo da seção) | Asset |
|---|---|---|---|---|
| iPhone + anéis + glow | `101:323` (telefone) e `101:95` (elipses) | `41.845, 943` | `left: -133.155, top: 256, width: 724, height: 761` | `public/imgs/iphone-section-2.svg` |
| Glow laranja direito | `101:89` | `1167.845, 1020.553` | `left: 992.845, top: 333.553, width: 507, height: 444` | `public/imgs/orange-detail-right.svg` |

Ambos conferidos por `getBoundingClientRect()` no browser: `41.9,943` e `1167.8,1020.5` — dentro de 0.1px do alvo.

## Ícones

Os 3 ícones (`star-05`, `cube-02`, `cube-04`) foram exportados via `download_assets`, mas o export trouxe apenas o layer interno `Icon` (a "folha"), sem o padding do frame de instância 24×24 que o Figma aplica (`inset-[8.33%]`/`inset-[8.93%_12.5%]`/`inset-[12.5%]`). Os SVGs em `public/icons/` foram reconstruídos com viewBox `0 0 24 24` e o path recentralizado no padding correto (1px para star-05; ~2×1.14px para cube-02; 2px para cube-04), preservando o `stroke="#FF5555" stroke-width="2"` original.

## Decisões fora do design

- **Peso 600 da Clash Display**: os títulos dos blocos de feature são Semibold, peso que o Fontshare não carregava (`layout.tsx` só pedia 500/700). Adicionado `600` à query string do link.
- **Nome de arquivo sem espaço**: `orange-detail-section-2 right.svg` renomeado para `orange-detail-right.svg` — evita a armadilha de URL-encoding de espaço em `src` do `next/image`.
- **Mobile (< `lg`)**: diferente do Hero (que esconde todo decorativo), aqui o iPhone é o único elemento visual da seção — decidido com o usuário manter o SVG do iPhone visível, empilhado e centralizado acima do texto (`h-[420px] w-[400px]`, em fluxo, `object-contain`), trocando para posicionamento absoluto no tamanho exato do design a partir de `lg`. O glow laranja da borda direita (sangramento de canto) fica `hidden lg:block`, como no Hero.
- **Um único `<Image>` para o iPhone**: a primeira versão tinha dois `<Image>` do mesmo SVG (um `lg:hidden`, um `hidden lg:block`) — o wrapper escondido por CSS não impede o download do recurso, então o asset de 545KB baixava duas vezes. Substituído por um único wrapper cujas classes mudam de posicionamento (`relative`/mobile → `lg:absolute`/desktop) em vez de duplicar o elemento.
- **Texto alinhado à esquerda em todas as larguras**: diferente do título centralizado do Hero no mobile — aqui o conteúdo é uma lista (eyebrow + título + 3 blocos), que lê melhor alinhada à esquerda mesmo em telas pequenas.
- **Duas faixas de layout desktop (`lg` e `≥1440px`)**: entre 1024px e 1439px de viewport, o texto ficaria cortado se assumisse a posição exata do Figma (`x=730`, `730+638=1368 > 1090` do container). Nessa faixa o texto fica colado à borda direita do container (`lg:max-[1439px]:ml-[452px]`); a partir de 1440px assume o offset exato do Figma (`min-[1440px]:ml-[555px]`). As duas variantes usam faixas de media query **mutuamente exclusivas** (uma com `max-[1439px]`) em vez de duas regras de mesma especificidade — Tailwind não garante que o bloco gerado para um breakpoint customizado (`--breakpoint-design`, abordagem descartada) apareça depois do de `lg` no CSS final; a tentativa inicial com `design:ml-[555px]` perdia o empate de cascata para `lg:ml-[452px]` em viewports ≥1440px.
- **`overflow-x-clip` também em `<html>`**: o glow direito e o texto agora sangram até 234px além da borda direita da seção em viewports largos — sangramento intencional (o próprio design do Figma extrapola os 1440px de frame nesse ponto). `overflow-x-clip` só no `<body>` (como já era desde o Hero) não impediu um scroll horizontal real de ~143px nesse cenário — o body ficava com a caixa corretamente recortada, mas `<html>` (o elemento de rolagem efetivo) continuava com `overflow-x: visible` e permitia `scrollTo`/roda do mouse moverem a página. Adicionado `overflow-x-clip` também em `<html>` (`layout.tsx`) para fechar a rota de scroll pela raiz, não só pelo body.

## Arquivos

- `src/components/sections/Features.tsx`
- `src/app/layout.tsx` (peso 600 da Clash Display; `overflow-x-clip` em `<html>`)
- `src/app/page.tsx` (renderiza `<Features />` depois do `<Hero />`)
- `public/imgs/iphone-section-2.svg`, `public/imgs/orange-detail-right.svg`
- `public/icons/star-05.svg`, `public/icons/cube-02.svg`, `public/icons/cube-04.svg`

## Checklist de aceite

- [x] Build (`npm run build`), lint e `tsc --noEmit` sem erros.
- [x] Eyebrow, título e os 3 blocos conferidos por `getBoundingClientRect()` contra as coordenadas do Figma em viewport ≥1440px — batem exatamente (`x=730`, `y` de 1071/1103/1183/1185/1223/1311/1351/1439/1479...).
- [x] Viewport 1024–1439px: texto sem corte, colado à borda do container (`x=627`), sem regressão nas posições verticais.
- [x] Peso 600 da Clash Display carregado (`document.fonts.check('600 18px "Clash Display"')` → `true`).
- [x] iPhone e glow laranja conferidos por `getBoundingClientRect()` contra a posição derivada do node (`41.9,943` e `1167.8,1020.5`, dentro de 0.1px do alvo).
- [x] Ícones renderizados no tamanho e posição corretos (24×24, alinhados ao centro da linha do título).
- [x] Sem caixas brancas nos decorativos do Hero (badge-card, estrelas) — ver `02-hero.md`.
- [x] Sem scroll horizontal real (`scrollWidth === clientWidth` e `scrollX` não muda após `scrollTo`) em 495px, 1394px e 1638px de viewport.
- [x] SVG do iPhone (545KB) baixado uma única vez (`performance.getEntriesByType('resource')`), não duas.
- [x] Viewport mobile (~495px): iPhone empilhado centralizado acima do texto, texto alinhado à esquerda.
- [x] Link "features" da navbar aponta para `#features`, que existe na página.
