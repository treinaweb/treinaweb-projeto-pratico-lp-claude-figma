import Reveal from "@/components/ui/Reveal";

type Variant = "title" | "phones" | "features-phone" | "features-right";

/**
 * Caixa de cada glow — a *extensão real* do degradê, não a caixa nominal do
 * node do Figma. É `2 × (semi-eixo + 2.5σ)` em cada direção, cobrindo a união
 * das duas elipses quando há duas.
 *
 * Isso é o que torna o enquadramento verificável: como o degradê termina
 * exatamente na borda do elemento (ao contrário do SVG, cujo blur vazava para
 * fora da viewBox), "não sangrar do frame de 1440px" vira uma checagem de
 * `getBoundingClientRect()` — `left + width` tem que caber em `1265` no sistema
 * de coordenadas das seções (`frameX − 175`).
 *
 * Como os stops são todos percentuais, a caixa pode ser reescalada à vontade
 * (é o que o glow da seção 2 faz no mobile) sem tocar no CSS.
 */
const BOX: Record<Variant, { width: number; height: number; shape: string }> = {
  title: { width: 567, height: 480, shape: "glow--duo" },
  phones: { width: 615, height: 524, shape: "glow--phones" },
  "features-phone": { width: 651, height: 543, shape: "glow--duo-flip" },
  "features-right": { width: 585, height: 495, shape: "glow--duo" },
};

/** Número = px; string = unidade CSS literal (`"-3.5635%"`). */
type Length = number | string;

type GlowProps = {
  variant: Variant;
  /** Offsets no sistema de coordenadas da seção (`frameX − 175`). */
  left: Length;
  top: Length;
  /** Sobrescreve a caixa padrão — usado para escalar o glow junto do pai. */
  width?: Length;
  height?: Length;
  delay?: number;
  /** Extras de posicionamento/visibilidade — ex.: `hidden lg:block`. */
  className?: string;
};

/**
 * Camada decorativa de luz. Substitui os SVGs `glow-*.svg` /
 * `orange-detail-right.svg` e as duas elipses que vinham embutidas em
 * `iphone-section-2.svg` — ver a nota em `globals.css` para o porquê do CSS.
 *
 * Usa `variant="fade"` do Reveal de propósito: os glows só animam opacidade,
 * porque um transform aqui criaria stacking context e quebraria o `-z-10`.
 */
export default function Glow({
  variant,
  left,
  top,
  width,
  height,
  delay = 0,
  className = "",
}: GlowProps) {
  const box = BOX[variant];

  return (
    <Reveal
      aria-hidden
      variant="fade"
      delay={delay}
      className={`glow ${box.shape} pointer-events-none absolute -z-10 ${className}`}
      style={{
        left,
        top,
        width: width ?? box.width,
        height: height ?? box.height,
      }}
    />
  );
}
