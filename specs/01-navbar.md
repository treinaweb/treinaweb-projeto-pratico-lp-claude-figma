# 01 — Navbar

**Node ID:** `101:222` (frame "Group 35944", 1090×60, dentro do frame de cobertura 1440px)

## Especificação do Figma

| Elemento | Valor |
|---|---|
| Container | 1090px de largura, centralizado, altura 60px, `margin-top: 40px` |
| Logo | SVG "uifry" ~106×34.4px + "TM" sobrescrito (Plus Jakarta Sans ExtraBold, 4.15px) |
| Links | `home` · `about us` · `pricing` · `features` — Clash Display 20px/26px, `capitalize`, `gap: 24px` |
| Link ativo (`home`) | Clash Display **Bold**, cor `#FF5555` |
| Links inativos | Clash Display **Medium**, cor `#000000` |
| Botão | 180×60px, fundo `#000000`, `border-radius: 4px`, texto "download" Clash Display Medium 18px/28px, branco, `capitalize` |

Asset do logo baixado para `public/logo-uifry.svg` (a URL do Figma expira em ~7 dias).

## Decisões fora do design

O Figma não tem versão mobile para este frame. Decisões tomadas nesta implementação:

- **Hover nos links**: transição de cor para `#FF5555` (`--color-accent`).
- **Breakpoint `lg` (1024px)**: abaixo disso, os links e o botão desktop somem; aparece um botão hambúrguer.
- **Menu mobile**: drawer full-screen abaixo do header, com os mesmos links (empilhados) e o botão Download. Estado controlado por `useState` em `Navbar.tsx` (client component).
- **Link ativo**: fixado em `home` por enquanto (`ACTIVE_LABEL` em `Navbar.tsx`). Trocar para scroll-spy quando as demais seções existirem.

## Arquivos

- `src/components/layout/Navbar.tsx`
- `src/components/ui/Button.tsx` (reaproveitável pelo hero/pricing)
- `src/lib/navigation.ts` (fonte única dos links, reaproveitada pelo footer)
- `src/app/globals.css` (tokens `--color-accent`, `--font-display`, `--font-sans`, `--spacing-container`)
- `src/app/layout.tsx` (fontes: Plus Jakarta Sans via `next/font/google`, Clash Display via Fontshare CDN)
- `public/logo-uifry.svg`

## Checklist de aceite

- [x] Layout desktop (1440px) confere com o screenshot do Figma: margens, altura, gap dos links, botão 180×60.
- [x] `home` em `#FF5555` bold; demais links em preto medium.
- [x] Clash Display e Plus Jakarta Sans carregando (sem fallback).
- [x] Abaixo de 1024px: hambúrguer substitui os links, drawer abre/fecha.
- [x] Navegação por teclado: logo → links → botão, foco visível.
- [x] `npm run lint` e `npx tsc --noEmit` sem erros.
