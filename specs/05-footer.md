# 05 — Footer

Grupo `101:431` (`Group 1000002347`), filho direto do frame `101:79`, em `x=175, y=5439.708984375`, 1091×406. `x=175` é a mesma borda esquerda do container de 1090px usada em toda a página, então o footer usa o **mesmo sistema de coordenadas** do restante das seções (offsets abaixo são `frameX − 175`, `frameY − 5439.708984375`).

Diferente das outras seções, o footer não vive em `page.tsx` dentro de `<main>`: é renderizado em `src/app/layout.tsx`, como irmão de `{children}`, logo depois do `<Navbar />`. Isso completa o padrão sticky-footer que o `<body>` já preparava (`min-h-full flex flex-col`, com `<main className="flex-1">`) — decisão natural dada a estrutura existente, não uma escolha nova.

## Colunas (offsets desde o topo do grupo)

| Coluna | x local | Conteúdo |
|---|---|---|
| Logo + contato | 0, largura ~173 | logo `uifry` (reaproveitado de `public/logo-uifry.svg`, mesmo padrão do `Navbar`) + `TM` sobrescrito; e-mail com ícone; telefone com ícone |
| Links | 238 | título + `home`, `about us`, `bookings`, `blog` |
| Legal | 385 | título + `terms of use`, `privacy policy`, `cookie policy` |
| Product | 558 | título + `take tour`, `live chat`, `reviews` |
| Newsletter | 751, largura 340 | título + `stay up to date` + input/botão de inscrição |

Ritmo vertical de cada coluna de links: título (line-height 42) → primeiro item, gap de 16px (42+16=58, batendo com o offset medido no Figma); itens entre si também com 16px de gap (26px de line-height + 16 = 42px de passo, confirmado nas 4 posições de `home/about us/bookings/blog`). Implementado como um único `flex flex-col gap-4` por coluna, sem `top` por elemento — mesmo princípio de "ritmo por margem/gap" já usado em `Features.tsx`.

**Layout traduzido de posições absolutas para flexbox**: o código de referência do Figma (`get_design_context`) exporta cada elemento com `position: absolute` e `calc(50% + Npx)`, que é a serialização do canvas do Figma, não um layout utilizável. Convertido para `flex flex-wrap justify-between` no container principal (5 colunas, larguras batendo com as do Figma via `lg:w-[...]` só onde a largura importa para o alinhamento — logo e newsletter) + `flex-col` empilhado no mobile. Essa tradução é exigida pelo próprio workflow de design-to-code (adaptar ao sistema de estilo do projeto), não uma fidelidade quebrada.

## Tipografia

- Título de coluna (`Links`, `Legal`, `Product`, `Newsletter`): Clash Display Bold, **32px/42px** no Figma. Não há variante mobile no design (frame único de 1440px); por consistência com o padrão já estabelecido de reduzir a escala de headings em ~75% no mobile (`h2`: 36/40 → 48/48 lg em `Features`/`Testimonials`), aplicado `text-[24px] leading-[32px] lg:text-[32px] lg:leading-[42px]`.
- Links, contato, "stay up to date", input e copyright: Clash Display Medium, **16px/26px**, `capitalize`, `text-black` — tamanho novo na LP (as outras seções usam 18px ou 20px para corpo/nav), mantido exato porque vem direto do Figma.
- Botão "Subscribe": Clash Display Medium, 16px/26px, `capitalize`, texto branco sobre `bg-black`.

## Newsletter

Caixa branca `rounded` com `shadow-[-13px_13px_104px_0px_rgba(161,161,161,0.1)]` (sombra suave do Figma, convertida para arbitrary value do Tailwind), `input[type=email]` de largura flexível + botão preto fixo `w-[160px] h-[61px]`, ambos dentro de um `<form>` com `p-2.5` (10px, que somado à altura do botão de 61px reproduz exatamente os 81px de altura da caixa no Figma — não é necessário fixar `height` no container).

**Decisão**: o botão não reaproveita `components/ui/Button.tsx` porque suas dimensões fixas (`h-[60px] w-[180px]`) não batem com as do Figma para este caso (`61×160`); em vez de forçar overrides frágeis de utilities Tailwind com a mesma especificidade, o botão foi escrito diretamente, como já é feito com outros elementos de UI pontuais no projeto (blocos de feature, cards, etc., que também não passam pelo `Button`).

**Decisão**: `<button type="button">` sem handler — não existe backend de inscrição no projeto; mantém o componente como server component (sem `"use client"`), fiel à ausência de qualquer client-side state necessário para esta seção.

## Ícones

`mail.svg` e `phone.svg` exportados do Figma (`101:460`/`101:464`) e adicionados a `public/icons/`, já com `fill="#FF5555"` embutido no path (sem stroke, ao contrário dos ícones de `Features`) — removida apenas a marcação de export do Figma (`<g id="Frame">`, atributos `preserveAspectRatio`/`style` redundantes), para bater com o padrão dos SVGs já existentes em `public/icons/`.

## Decisões fora do design

- **E-mail e telefone viraram links reais** (`mailto:help@frybix.com`, `tel:+123445667889`) — no Figma são apenas texto estático; dado que o resto da navegação do footer já é composto de âncoras, faz sentido de UX que o contato também seja clicável.
- **Typo de conteúdo corrigido**: o Figma tem "Reveiws" (erro de digitação); corrigido para "Reviews" no código — não é uma decisão de design, é uma correção de texto.
- **Hover state nos links**: `hover:text-accent`, seguindo o mesmo padrão já usado no `Navbar` (o Figma, estático, não define estado de hover).
- **Espaço acima do footer**: o Figma não define a distância entre o footer e a seção anterior (é a última seção da página, sem nada acima dela no mesmo frame para medir). Usado `pt-16 lg:pt-20`, valor arbitrário razoável — a `Testimonials` já contribui `pb-24 lg:pb-[180px]` antes dele.
- **Divisor**: o código de referência do Figma declara a borda superior da faixa de copyright como `rgba(22,22,22,0)` (alfa 0, portanto invisível), mas o screenshot mostra uma linha sutil visível — provável artefato de exportação. Usado `border-black/10`, a mesma convenção de "linha sutil" já usada nos anéis decorativos do `Testimonials`.

## Arquivos

- `src/components/layout/Footer.tsx`
- `src/app/layout.tsx` (renderiza `<Footer />` depois de `{children}`)
- `public/icons/mail.svg`, `public/icons/phone.svg`

## Checklist de aceite

- [x] `npx tsc --noEmit`, `npm run lint` e `npm run build` sem erros.
- [x] Layout desktop (~1857px) conferido visualmente contra o screenshot do Figma — 5 colunas nas mesmas posições relativas, newsletter alinhada à direita, divisor + copyright centralizado.
- [x] Mobile (~495px): colunas empilhadas, sem scroll horizontal (`scrollWidth === clientWidth`), newsletter com input full-width e botão fixo.
- [x] Console sem erros/exceções no carregamento da página.
- [x] Ícones de e-mail/telefone renderizados em 24×24, cor `#FF5555`, alinhados com o texto.
