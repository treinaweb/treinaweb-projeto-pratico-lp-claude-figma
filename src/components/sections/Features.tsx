import Image from "next/image";
import Glow from "@/components/ui/Glow";
import Reveal from "@/components/ui/Reveal";

/**
 * Decorative layers, positioned against the Figma frame (1440px wide, node
 * `101:79`). This section is `Group 1000002336` (`101:289`), a direct child
 * of that frame at x=46, y=943 — so, unlike a first pass at this section
 * assumed, its coordinates are NOT relative to some detached canvas copy:
 * they're the same frame space as the navbar and Hero.
 *
 * The section starts right where the Hero ends, frame y=687, so the values
 * below are (frameX − 175, frameY − 687) — 175 being the container's left
 * edge, same origin used throughout the page.
 *
 * Both exported SVGs were anchored by matching their internal geometry (the
 * phone rect / glow ellipses) against the matching Figma node boxes — both
 * resolved to scale 1.00.
 */
const DECOR = {
  phone: { left: -133.155, top: 256, width: 724, height: 761 },
  /**
   * Antes em `left: 992.845`, 507×444. A extensão real do degradê (semi-eixo +
   * 2.5σ, não a caixa do SVG) chegava a 1727 no frame — quase metade do glow
   * era cortada pelo `overflow-x-clip`.
   *
   * Diferente do Hero, este glow fica sobre fundo branco vazio: qualquer corte
   * nele aparece como uma borda reta bem visível, porque a rampa é interrompida
   * no meio. Por isso ele não segue o teto de 1245 do Hero — é reduzido a 80% e
   * termina em 1020, **dentro do container**, que é a única forma de nunca ser
   * cortado em nenhuma largura a partir de `lg` (em 1024px o container tem os
   * mesmos 1024 e não sobra margem nenhuma).
   */
  glowRight: { left: 552, top: 357, width: 468, height: 396 },
} as const;

/**
 * As três camadas da arte do telefone, em % do palco de 724×761 — a mesma
 * viewBox do SVG que elas substituem. Percentual e não px porque no mobile o
 * palco encolhe para 400×420 e as camadas precisam acompanhar, exatamente como
 * o `object-contain` fazia quando tudo era um arquivo só.
 *
 * `glow` cobre a união das duas elipses (ver `Glow`), por isso começa fora do
 * palco: as elipses do Figma já vazavam da viewBox.
 */
const STAGE = {
  glow: {
    /* -25.8px viraria -3.5635%; usamos -2.9% (-21px) para a cauda do degradê
       não encostar na borda esquerda do frame nas larguras mais comuns. */
    left: "-2.9%",
    top: "-1.6031%",
    width: "89.9171%",
    height: "71.3535%",
  },
  /**
   * `<rect x=239.154 y=108 w=249.246 h=504.323>` do SVG original, com a largura
   * reajustada de 249.246 para 255.54: o render novo tem proporção 0.5067 e o
   * device do export antigo tinha 0.494, então manter a largura velha faria o
   * `object-contain` encolher o celular e sobrar folga em cima e embaixo. A
   * altura e o centro horizontal (363.78) são os do design.
   */
  device: {
    left: "32.5981%",
    top: "14.1919%",
    width: "35.2955%",
    height: "66.2711%",
  },
} as const;

const FEATURES = [
  {
    icon: "/icons/star-05.svg",
    title: "Orçamento por período",
    body: "Defina um teto por semana, por mês ou por categoria. Ao chegar em 80% do limite você recebe um aviso — antes de a fatura fechar, não depois.",
  },
  {
    icon: "/icons/cube-02.svg",
    title: "Categorização automática",
    body: "Cada compra cai na categoria certa sem você digitar nada. Corrigiu uma vez? O Uifry aprende e repete o ajuste nas próximas.",
  },
  {
    icon: "/icons/cube-04.svg",
    title: "Todas as contas em um lugar",
    body: "Bancos, cartões e investimentos conectados via Open Finance. Um saldo real, atualizado a cada poucos minutos, sem planilha.",
  },
] as const;

/**
 * The `lg:pt-[384px]` below reserves room for the absolutely-placed phone art,
 * so the section box starts far above anything visible. The negative
 * `lg:scroll-mt` pulls the `#features` anchor landing down to the content.
 */
export default function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-(--spacing-container) px-6 pt-16 pb-20 lg:px-0 lg:pt-[384px] lg:pb-[169px] lg:scroll-mt-[-260px]"
    >
      {/* Right-edge glow, sits behind everything. Opacity-only reveal, same
          reasoning as the hero glows. */}
      <Glow
        variant="features-right"
        {...DECOR.glowRight}
        className="hidden lg:block"
      />

      {/* Phone artwork. Era um SVG único de 532KB (glow borrado + anéis + um
          device raster de 428×866 em base64); virou três camadas: o glow em
          CSS, os anéis em vetor puro e o device em raster de alta resolução.
          O palco continua em fluxo e centralizado no mobile e passa a absoluto
          na caixa exata do design a partir de `lg` — as camadas são
          percentuais, então acompanham os dois tamanhos sem duplicar markup. */}
      <Reveal
        aria-hidden
        variant="zoom"
        className="pointer-events-none relative mx-auto mb-10 h-[420px] w-[400px] lg:absolute lg:mx-0 lg:mb-0 lg:h-[761px] lg:w-[724px] lg:left-[-133.155px] lg:top-[256px]"
      >
        <Glow variant="features-phone" {...STAGE.glow} />

        <Image
          src="/imgs/rings.svg"
          alt=""
          fill
          sizes="(min-width: 1024px) 724px, 400px"
          className="object-contain"
        />

        <div className="absolute" style={STAGE.device}>
          <Image
            src="/imgs/iphone-section-2.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 250px, 138px"
            className="object-contain"
            priority
          />
        </div>
      </Reveal>

      {/*
        The text column sits at frame x=730 in the Figma design — 103px past
        the 1090px container's right edge (452 + 638 = 1090). We keep it flush
        with the container from `lg` up to 1439px (no clipped text), and snap
        to the exact Figma offset once the viewport reaches the 1440px frame
        width. The two ranges are written as mutually exclusive media queries
        (`max-[1439px]` bound on the first) rather than two same-specificity
        rules left to resolve by source order — Tailwind doesn't guarantee a
        custom breakpoint's generated block sorts after `lg`'s.
      */}
      <div className="relative z-10 lg:w-[638px] lg:max-[1439px]:ml-[452px] min-[1440px]:ml-[555px]">
        <Reveal>
          <p className="font-display text-[18px] leading-[28px] font-medium tracking-[2.88px] text-accent uppercase">
            recursos
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-1 font-display text-[36px] leading-[40px] font-bold lg:text-[48px] lg:leading-[48px]">
            Uifry Premium
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-col gap-8">
          {FEATURES.map(({ icon, title, body }, index) => (
            <Reveal key={index} delay={160 + index * 80}>
              <div className="flex items-center gap-2">
                <Image src={icon} alt="" width={24} height={24} aria-hidden />
                <p className="font-display text-[18px] leading-[28px] font-semibold">
                  {title}
                </p>
              </div>
              <p className="mt-3 font-display text-[18px] leading-[28px] font-medium text-black/50">
                {body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
