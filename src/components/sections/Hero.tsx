import Image from "next/image";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

/**
 * Decorative layers, positioned against the Figma frame (1440px wide).
 * The hero container spans frame x 175→1265 and starts at frame y 100,
 * so container-relative coords are (frameX - 175, frameY - 100).
 *
 * Every box below was anchored by matching dark-pixel bounding boxes between
 * each Figma export and a full-resolution render of the design, so the sizes
 * are the assets' true rendered sizes (blur/shadow bleed included) rather than
 * the nominal node boxes.
 */
const DECOR = {
  glowTitle: { left: 66, top: -48, width: 517, height: 430 },
  glowPhones: { left: 685, top: 7.5, width: 567, height: 764 },
  phones: { left: 546, top: -48, width: 721, height: 904 },
  badgeCard: { left: -33.5, top: 424, width: 569, height: 427 },
  starTop: { left: -120, top: 27.5, width: 46, height: 46 },
  starBottom: { left: 115, top: 480.5, width: 46, height: 46 },
} as const;

export default function Hero() {
  return (
    <section
      id="home"
      className="relative mx-auto max-w-(--spacing-container) px-6 pt-14 pb-20 lg:px-0 lg:pt-[115px] lg:pb-[180px]"
    >
      {/* Glows exported as transparent SVGs (real alpha, no white backing) — no blend mode needed.
          They reveal on opacity alone: a transform would turn each `-z-10`
          layer into its own stacking context, and this is exactly the spot
          where compositing has bitten before (specs/02-hero.md). */}
      <Reveal
        aria-hidden
        variant="fade"
        className="pointer-events-none absolute -z-10 hidden lg:block"
        style={DECOR.glowTitle}
      >
        <Image
          src="/hero/glow-title.svg"
          alt=""
          fill
          className="object-contain"
          priority
        />
      </Reveal>

      <Reveal
        aria-hidden
        variant="fade"
        delay={100}
        className="pointer-events-none absolute -z-10 hidden lg:block"
        style={DECOR.glowPhones}
      >
        <Image
          src="/hero/glow-phones.svg"
          alt=""
          fill
          className="object-contain"
        />
      </Reveal>

      <div className="relative z-10 mx-auto max-w-[638px] text-center lg:mx-0 lg:text-left">
        <Reveal>
          <h1 className="font-display text-[40px] leading-[44px] font-bold capitalize md:text-[52px] md:leading-[56px] lg:max-w-[618px] lg:text-[64px] lg:leading-[64px]">
            Make the best financial decisions
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-6 font-display text-[16px] leading-[26px] font-medium capitalize text-black/50 lg:text-[18px] lg:leading-[28px]">
            Cum et convallis risus placerat aliquam, nunc. Scelerisque aliquet
            faucibus tincidunt eu adipiscing sociis arcu lorem porttitor.
          </p>
        </Reveal>

        <Reveal
          delay={200}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:mt-6 lg:justify-start"
        >
          <Button href="#download">
            Get Started
            <Image
              src="/icons/arrow-right.svg"
              alt=""
              width={24}
              height={11}
              aria-hidden
            />
          </Button>

          <a
            href="#watch-video"
            className="inline-flex items-center gap-[14px] font-display text-[18px] leading-[28px] font-medium capitalize transition-opacity hover:opacity-70"
          >
            <Image
              src="/icons/play.svg"
              alt=""
              width={29}
              height={29}
              aria-hidden
            />
            Watch Video
          </a>
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
          <Image src="/hero/badge-card.svg" alt="" fill className="object-contain" />
        </Reveal>

        {/* Single pre-composited export: 3 phones + rings + its own 2 stars, with real transparency. */}
        <Reveal
          aria-hidden
          variant="zoom"
          delay={150}
          className="pointer-events-none absolute"
          style={DECOR.phones}
        >
          <Image
            src="/hero/png-iphone-full.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </Reveal>

        <Reveal
          aria-hidden
          variant="zoom"
          delay={300}
          className="pointer-events-none absolute"
          style={DECOR.starTop}
        >
          <Image src="/hero/star.svg" alt="" fill />
        </Reveal>

        <Reveal
          aria-hidden
          variant="zoom"
          delay={350}
          className="pointer-events-none absolute"
          style={DECOR.starBottom}
        >
          <Image src="/hero/star.svg" alt="" fill />
        </Reveal>
      </div>
    </section>
  );
}
