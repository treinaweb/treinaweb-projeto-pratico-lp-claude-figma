/**
 * Geometria da cena Hero → Features.
 *
 * Todos os números vêm das specs `02-hero.md` e `03-features.md`, resolvidos
 * das percentagens para px. A origem (`0,0`) é o **canto superior esquerdo do
 * device no estado hero** — é o único ponto que as duas seções compartilham, e
 * escolhê-lo como origem faz `from.x/y` serem zero por construção.
 *
 * Conversões (feitas uma vez, aqui, para não ficarem espalhadas):
 *
 * | | Hero (`STAGE.phone` em 721×904) | Features (`STAGE.device` em 724×761) |
 * |---|---|---|
 * | device left | `524 + .256491×721 = 708.93` | `-133.155 + .325981×724 = 102.86` |
 * | device top  | `-48 + .09042×904   =  33.74` | `256 + .141919×761    = 364.00` |
 * | device w    | `.491955×721 = 354.70` | `.352955×724 = 255.54` |
 * | device h    | `.774336×904 = 700.00` | `.662711×761 = 504.32` |
 *
 * As colunas de texto entram no mesmo sistema: o `h1` do Hero está em
 * `section-y 115` (o `pt-[115px]`), logo `115 − 33.74 = 81.26`; o eyebrow da
 * Features está em `section-y 384`, e o topo do palco dela em `section-y 256`,
 * que aqui é `98 − 108 = −10`, logo `384 − 266 = 118`.
 */

/** Caixa do device renderizada — a do estado hero. O resto é `scale()`. */
export const DEVICE = { width: 354.7, height: 700 } as const;

/**
 * O `y` do estado features não sai do design: centralizar o celular menor
 * (504.32) na caixa de 700 do palco é uma decisão desta cena — o Figma não tem
 * um estado "os dois na mesma altura". `(700 − 504.32) / 2 ≈ 98`.
 */
export const TRAVEL = {
  from: { x: 708.93, y: 0, scale: 1, rotate: -10 },
  to: { x: 102.86, y: 98, scale: 255.54 / 354.7, rotate: 0 },
} as const;

/**
 * Anéis (`rings.svg`, viewBox 724×761). No Hero eles renderizam com 721 de
 * largura contra um device de 354.70; na Features, com 724 contra 255.54. A
 * escala *local* (relativa ao device, que já está em `TRAVEL.scale`) é portanto
 * `larguraDosAnéis / 724 / escalaDoDevice`.
 *
 * O deslocamento entre o centro dos anéis e o centro do device é o mesmo nos
 * dois estados — `(−1.78, +20.3)` em unidades dos anéis, conferido pelas duas
 * planilhas de percentagens. Por isso ele entra multiplicado por `ringScale`.
 */
export const RINGS = {
  viewBox: { width: 724, height: 761 },
  scaleFrom: 721 / 724,
  scaleTo: 724 / 724 / (255.54 / 354.7),
  offsetX: -1.78,
  offsetY: 20.3,
} as const;

/** Colunas de texto, no sistema da cena. `x` da Features é o de ≥1440px. */
export const TEXT = {
  hero: { x: 0, y: 81.26 },
  features: { x: 555, y: 118, xCompact: 452 },
} as const;

/**
 * O glow que acompanha o celular, em coordenadas **locais do celular** — ou
 * seja, dentro da caixa de 354.7×700 que já é escalada por `TRAVEL.scale`.
 *
 * Ele precisa viajar junto: deixá-lo parado onde o Hero o desenha faz a luz
 * ficar órfã no meio da travessia, com o celular no centro da tela e uma
 * mancha vermelha sozinha à direita.
 *
 * Os valores são os da Features (`STAGE.glow` contra o palco de 724×761, com o
 * device em `236.01, 108`) divididos pela escala de chegada, para que em `p=1`
 * o glow renderize exatamente na caixa do design:
 *
 *   left = (−21.0 − 236.01) / 0.720552 = −356.68
 *   top  = (−12.2 − 108.0)  / 0.720552 = −166.81
 *
 * Conferido: `−356.68 × 0.720552 + 102.86 = −154.15`, que é onde a spec 03 põe
 * o glow no sistema da cena.
 */
export const GLOW = {
  local: { left: -356.68, top: -166.81, width: 903.47, height: 753.59 },
} as const;

/**
 * A faixa de vídeo dentro do PNG do celular, em % da caixa de 720×1421.
 *
 * Medida varrendo o alpha e as corridas de branco puro do próprio
 * `iphone-hero.png`: a tela vai de `x 38→681`, `y 30→1387`, a Dynamic Island
 * ocupa `y 49→104` e a tab bar começa em `y ≈ 1250`. A faixa abaixo é
 * exatamente o miolo entre esses dois — `x 38, y 105, 644×1115` — de forma que
 * a ilha, a tab bar e o indicador de home continuem vindo do PNG (chrome do
 * app não deve animar) e só o conteúdo seja vídeo.
 *
 * `644 / 1115` está a 0.02% de 9:16, o único aspect vertical que o
 * `gemini-omni-flash` aceita — daí a faixa fechar tão bem.
 */
export const SCREEN_BAND = {
  left: "5.2778%",
  top: "7.3892%",
  width: "89.4444%",
  height: "78.4659%",
} as const;

export const VIDEO_SRC = "/video/uifry-screen-scroll.mp4";
export const VIDEO_POSTER = "/video/uifry-screen-poster.jpg";
