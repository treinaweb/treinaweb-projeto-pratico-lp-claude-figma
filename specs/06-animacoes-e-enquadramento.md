# 06 — Animações de entrada e enquadramento da página

Primeira spec sem node-id: nada aqui vem do Figma. O design é um frame estático de 1440px, sem protótipo nem variantes de movimento, então tanto o enquadramento quanto as animações são decisões de implementação — registradas aqui pelo mesmo motivo das outras specs.

## Parte 1 — Enquadramento

### O problema medido

Antes desta mudança, com viewport de 1553px:

| Medida | Antes | Depois |
|---|---|---|
| largura do `<footer>` | **1002px** | 1090px |
| tinta visível de `#features` (`left → right`) | `98 → 1731`, centro **1066** | recortada na borda do frame |
| tinta visível de `#home` | `112 → 1499`, centro **942** | recortada na borda do frame |
| centro do viewport | 920 | 920 |

Duas causas independentes:

1. **Footer colapsado.** `<footer className="mx-auto max-w-(--spacing-container)">` é filho direto de `<body className="flex flex-col">`. Margem `auto` no eixo cruzado de um flex item **cancela o `stretch`**, então a largura resolvia para `fit-content` (1002px) em vez dos 1090px que todas as outras seções usam — o footer ficava mais estreito e fora da grade. Corrigido com `w-full`.

2. **Sangramento sem frame.** O design vive num frame Figma de 1440px que **recorta** os decorativos. No browser esse recorte não existia: o glow de Features tem caixa até `container + 1500px` e o cluster de iPhones até `container + 1267px`, tudo escorrendo para a direita até a borda da janela. A massa visual ficava ~140px à direita do centro do viewport, e o texto — que sempre esteve corretamente centralizado — *parecia* jogado à esquerda. Em monitores ultrawide o efeito piora, porque o sangramento cresce sem limite.

### A solução

`src/app/layout.tsx` ganhou um frame de 1440px envolvendo `{children}` e `<Footer />`:

```tsx
<div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-x-clip">
```

- **`w-full` é obrigatório**, pelo mesmo motivo do bug do footer: sem ele, `mx-auto` colapsaria este div para `fit-content`.
- **`flex-1 flex-col`** preserva o sticky-footer que `<main className="flex-1">` já pressupõe (`05-footer.md`).
- **`overflow-x-clip`, não `hidden`**: `clip` não cria scroll container, então não quebra o `position: sticky` da navbar nem introduz scroll interno; e não cria stacking context, então os glows em `-z-10` continuam pintando atrás do conteúdo.
- **`<Navbar />` fica fora do frame**, de propósito: é `sticky top-0`, não tem arte sangrando, e já se centraliza sozinho no viewport — mesmo eixo do frame.
- **`overflow-x-clip` no `<html>` permanece** como backstop (razão em `03-features.md`).

Geometricamente o container de 1090px não se moveu: 1090 centralizado em 1440 centralizado no viewport ≡ 1090 centralizado no viewport. O que muda é que o sangramento passa a ser recortado na borda do frame, na mesma posição relativa em que o Figma recorta. Medido a 1841px de viewport: frame em `201 → 1641` (1440px, margens iguais), e o glow de Features tem 235px cortados em vez de pintar até a borda da janela.

`Features.tsx` **não** mudou: o `min-[1440px]:ml-[555px]` continua correto, porque a largura do frame é exatamente `min(viewport, 1440)`, que é a condição da própria media query. O texto vai de frame-x 730 a 1368 — dentro do frame, fiel ao `x=730` do Figma documentado em `03-features.md`.

## Parte 2 — Sistema de reveal

### Escolhas

- **CSS + `IntersectionObserver`, sem biblioteca.** O projeto tem zero dependências de runtime além de `next`/`react`, e o `Navbar` já estabeleceu o padrão de movimento (transição CSS discreta + `--ease-fluid` + `motion-reduce:`). Uma lib de animação custaria ~35kb gz e obrigaria `"use client"` nas seções.
- **Três variantes**, aplicadas 25 vezes na página: `rise` (fade + 24px de subida, 16 usos), `zoom` (fade + `scale(0.96)`, 5 usos), `fade` (só opacidade, 4 usos).
- **`fade` nos glows, deliberadamente.** `02-hero.md` registra um histórico caro de artefatos de compositing nesses elementos `-z-10`; um `transform` transformaria cada um em stacking context próprio. Opacidade não mexe nisso.
- **One-shot.** O observer é desconectado na primeira interseção — nada re-anima ao rolar de volta.
- **Duração 700ms, stagger de 80–100ms**, com `--ease-fluid` (o mesmo easeOutQuint da navbar).

### `src/components/ui/Reveal.tsx`

Client component que renderiza uma `<div>` e encaminha `className`/`style`, de modo que a div **seja** o elemento posicionado em vez de uma caixa extra em volta — é isso que permite envolver os decorativos absolutos do Hero sem mover a geometria deles. Hero, Features e Footer continuam Server Components; só o wrapper é cliente.

`data-revealed` é escrito direto no nó com `setAttribute`, não guardado em estado React. É uma flag presentacional de mão única que ninguém mais lê, então passar por re-render só acrescentaria um render — e o `eslint-plugin-react-hooks` do Next 16 reprova `setState` síncrono dentro de effect (`react-hooks/set-state-in-effect`), que era a primeira versão.

### Gate `[data-js]`

Todo o estado escondido é escopado em `[data-js] [data-reveal]`, e o atributo é posto no `<html>` por um script inline bloqueante no `<head>`. Sem esse gate, uma hidratação que falhe deixaria a página inteira em `opacity: 0` permanentemente. Verificado: o HTML do SSR sai com 25 `data-reveal`, zero `data-revealed` e **sem** `data-js` — ou seja, sem JS tudo aparece normalmente.

O script roda antes do primeiro paint (não há flash visível→escondido), mas por definição cria um atributo que o markup do servidor não tem. Daí o `suppressHydrationWarning` no `<html>` — sem ele o React 19 emite "A tree hydrated but some attributes... didn't match".

### `prefers-reduced-motion`

Regra global com `!important` zera `opacity`, `transform`, `transition` e `animation` de qualquer `[data-reveal]`. Confirmada no CSSOM compilado.

## Onde foi aplicado

| Seção | Aplicação |
|---|---|
| Hero | h1 / parágrafo / botões em cascata (0·100·200ms); glows em `fade`; iPhones `zoom` 150ms; card preto `rise` 250ms; estrelas `zoom` 300/350ms |
| Features | eyebrow 0ms, h2 80ms, três blocos em 160/240/320ms; celular `zoom`; glow `fade` |
| Testimonials | cabeçalho `rise`; órbita `zoom`; painel `rise` 120ms; **e** crossfade ao trocar de aba (`key={activeIndex}` + `animate-reveal-in`, com `motion-reduce:animate-none`) |
| Footer | 5 colunas em cascata (0–320ms); barra de copyright em `fade` |
| Navbar | **não tocado** — já tinha seu próprio sistema, e serviu de referência de estilo |

`--animate-reveal-in` e o keyframe `reveal-in` vivem no `@theme` do `globals.css`, seguindo a convenção Tailwind v4 já usada por `--ease-fluid`.

## Checklist de aceite

- [x] `npm run build`, `npx tsc --noEmit` e `npm run lint` sem erros.
- [x] `<footer>` com 1090px e `left` idêntico ao das `<section>` (376px a 1841 de viewport) — antes eram 1002px.
- [x] Frame com `min(viewport, 1440)` e margens iguais: `201 → 1641` a 1841px de viewport.
- [x] `document.documentElement.scrollWidth === clientWidth` — sem scroll horizontal.
- [x] `overflow-x: clip` resolvido no frame; glow de Features recortado 235px em vez de pintar até a borda da janela.
- [x] Navbar `sticky` sobrevive ao frame (barra permanece em `top: 40px` com a página rolada).
- [x] Sem caixas brancas sobre o card preto ou as estrelas (regressão de compositing de `02-hero.md`) — conferido por zoom no screenshot com tudo revelado.
- [x] Contrato de CSS conferido nos 25 elementos nas duas direções: com `data-revealed` → `opacity: 1` / `transform: none`; sem → `opacity: 0`.
- [x] Reveal no carregamento: 9 elementos (os do Hero, acima da dobra) revelados sozinhos numa aba nova.
- [x] Regra de `prefers-reduced-motion` presente no CSS compilado, com `!important` em opacity/transform/transition/animation.
- [x] Sem JS: HTML do SSR sem `data-js` no `<html>`, logo sem estado escondido.
- [ ] **Reveal durante o scroll conferido a olho.** A aba do Chrome automation ficou em `visibilityState: "hidden"` nesta sessão, e o navegador congela `IntersectionObserver`, `requestAnimationFrame` e transições CSS em abas ocultas — não deu para observar a cascata rolando a página. Toda a lógica foi verificada por outros meios (linhas acima), mas vale rolar a página manualmente uma vez.
- [ ] Verificação em viewport mobile real (< 1024px) — mesma pendência herdada de `02-hero.md`.
