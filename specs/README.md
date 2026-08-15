# Specs

Este diretório documenta a implementação da LP a partir do design do Figma:

[App Landing Page — Finance Bank Money](https://www.figma.com/design/Cqy9Vptjf00lyai2EfSCkY/App-Landing-Page-Finance-Bank-Money--Community-)

## Convenção

Uma spec por seção da página, numeradas na ordem em que aparecem no layout — mais, a partir da 06, specs transversais (que valem para a página inteira, não para uma seção). Cada arquivo registra:

- o node-id de origem no Figma;
- as medidas, cores e tipografia extraídas do design;
- decisões tomadas fora do design (responsivo, estados de hover/foco, interações);
- um checklist de aceite.

## Seções

| # | Seção | Node ID | Status |
|---|---|---|---|
| 01 | Navbar | `101:222` | ✅ Implementado |
| 02 | Hero | `101:195`, `101:196`, `101:197`, `101:98`, `101:129`, `101:181`, `101:210`, `101:216`, `101:208`/`101:209` | ✅ Implementado |
| 03 | Features | `101:289` (`Group 1000002336`, filho do frame `101:79`) | ✅ Implementado |
| 04 | Testimonials | `101:240` (`Group 1000002334`, seção inspirada — não fiel) | ✅ Implementado |
| 05 | Footer | `101:431` (`Group 1000002347`) | ✅ Implementado |
| 06 | Animações de entrada e enquadramento *(transversal)* | — (fora do Figma) | ✅ Implementado |
