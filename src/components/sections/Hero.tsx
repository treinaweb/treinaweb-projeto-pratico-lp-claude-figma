import Image from "next/image";
import Button from "@/components/ui/Button";
import Glow from "@/components/ui/Glow";
import Reveal from "@/components/ui/Reveal";
import VideoModal from "@/components/ui/VideoModal";

/**
 * Decorative layers, positioned against the Figma frame (1440px wide).
 * The hero container spans frame x 175→1265 and starts at frame y 100,
 * so container-relative coords are (frameX - 175, frameY - 100).
 *
 * Every box below was anchored by matching dark-pixel bounding boxes between
 * each Figma export and a full-resolution render of the design, so the sizes
 * are the assets' true rendered sizes (blur/shadow bleed included) rather than
 * the nominal node boxes.
 *
 * Nada pode ultrapassar `left + width = 1245` — o `overflow-x-clip` do frame
 * corta o excedente. O teto é 1245 e não 1265 (a borda do frame de 1440px)
 * porque uma janela de 1440 com barra de rolagem deixa o frame em 1400, e é
 * nessa largura que o desktop mais comum roda. Dois valores saíram do Figma:
 *
 * - `phoneStage`: 546 → 524, porque 546 + 721 = 1267 cortava o anel externo;
 * - `glowPhones`: o centro da elipse andou 31px para a esquerda, porque a
 *   extensão real do degradê (não a caixa do SVG) chegava a 1277.
 *
 * Abaixo de ~1400px de frame o sangramento volta a ser cortado: o design é
 * autorado num frame de 1440 e a arte passa 155px da borda do container.
 *
 * Os glows não têm mais `width`/`height` aqui: a caixa deles é a extensão do
 * degradê e vive em `Glow`, junto dos stops que dependem dela.
 */
const DECOR = {
  glowTitle: { left: 41, top: -73 },
  glowPhones: { left: 630, top: 271 },
  /** Caixa do antigo composto de 3 celulares; agora é o palco do celular único. */
  phoneStage: { left: 524, top: -48, width: 721, height: 904 },
  badgeCard: { left: -33.5, top: 424, width: 569, height: 427 },
  starTop: { left: -120, top: 27.5, width: 46, height: 46 },
  starBottom: { left: 115, top: 480.5, width: 46, height: 46 },
} as const;

/**
 * O celular dentro do palco, em % de 721×904 — mesma técnica da Features.
 *
 * `rings.svg` entra com `object-contain` na caixa do palco: a viewBox de
 * 724×761 cabe pela largura (escala 0.99586) e sobra 73.07px em cima e embaixo.
 * O centro do slot do telefone nos anéis, (363.78, 360.16) na viewBox, cai
 * portanto em (362.28, 431.74) no palco — é nele que o celular é centralizado,
 * o que mantém o conjunto celular+anéis idêntico ao da seção 2.
 *
 * 700px de altura (× 0.5067 do render = 354.7 de largura) deixa a caixa girada
 * em 470.9×751, dentro do anel externo, que vai de ~127 a ~598 no palco.
 */
const STAGE = {
  phone: {
    left: "25.6491%",
    top: "9.042%",
    width: "49.1955%",
    height: "77.4336%",
  },
} as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="relative mx-auto max-w-(--spacing-container) px-6 pt-14 pb-20 lg:px-0 lg:pt-[115px] lg:pb-[180px]"
    >
      {/* Glows em CSS (ver globals.css): degradê dithered pelo compositor, sem o
          banding que o `feGaussianBlur` do SVG produzia. Continuam revelando só
          por opacidade — um transform transformaria cada camada `-z-10` no seu
          próprio stacking context, e é exatamente aqui que a composição já
          quebrou antes (specs/02-hero.md). */}
      <Glow
        variant="title"
        {...DECOR.glowTitle}
        className="hidden lg:block"
      />

      <Glow
        variant="phones"
        {...DECOR.glowPhones}
        delay={100}
        className="hidden lg:block"
      />

      <div className="relative z-10 mx-auto max-w-[638px] text-center lg:mx-0 lg:text-left">
        <Reveal>
          <h1 className="font-display text-[40px] leading-[44px] font-bold md:text-[52px] md:leading-[56px] lg:max-w-[618px] lg:text-[64px] lg:leading-[64px]">
            Tome as melhores decisões financeiras
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 font-display text-[16px] leading-[26px] font-medium text-black/50 lg:text-[18px] lg:leading-[28px]">
            Conecte seus bancos e cartões pelo Open Finance e acompanhe, em um
            só lugar, para onde vai cada real. O Uifry categoriza tudo sozinho e
            avisa antes de o mês apertar.
          </p>
        </Reveal>

        <Reveal
          delay={200}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:mt-6 lg:justify-start"
        >
          <Button href="#download">
            Começar grátis
            <Image
              src="/icons/arrow-right.svg"
              alt=""
              width={24}
              height={11}
              aria-hidden
            />
          </Button>

          <VideoModal />
        </Reveal>
      </div>

      {/* Foreground decorations. Hidden below lg — the design has no mobile treatment for them. */}
      <div className="hidden lg:block">
        <Reveal
          aria-hidden
          delay={250}
          className="pointer-events-none absolute"
          style={DECOR.badgeCard}
        >
          <Image
            src="/hero/badge-card.svg"
            alt=""
            fill
            sizes="569px"
            className="object-contain"
          />
        </Reveal>

        {/* Era um composto único de 3 celulares + anéis + 2 estrelas. Agora são
            duas camadas: os anéis em vetor (os mesmos da seção 2 — é o mesmo
            elemento do design) e um celular único renderizado em alta
            resolução, levemente inclinado para não ficar idêntico à seção 2. */}
        <Reveal
          aria-hidden
          variant="zoom"
          delay={150}
          className="pointer-events-none absolute"
          style={DECOR.phoneStage}
        >
          <Image
            src="/imgs/rings.svg"
            alt=""
            fill
            sizes="721px"
            className="object-contain"
          />

          <div
            className="absolute rotate-[-10deg]"
            style={STAGE.phone}
          >
            <Image
              src="/hero/iphone-hero.png"
              alt=""
              fill
              sizes="360px"
              className="object-contain"
              priority
            />
          </div>
        </Reveal>

        <Reveal
          aria-hidden
          variant="zoom"
          delay={300}
          className="pointer-events-none absolute"
          style={DECOR.starTop}
        >
          <Image src="/hero/star.svg" alt="" fill sizes="46px" />
        </Reveal>

        <Reveal
          aria-hidden
          variant="zoom"
          delay={350}
          className="pointer-events-none absolute"
          style={DECOR.starBottom}
        >
          <Image src="/hero/star.svg" alt="" fill sizes="46px" />
        </Reveal>
      </div>
    </section>
  );
}
