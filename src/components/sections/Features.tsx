import Image from "next/image";
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
  glowRight: { left: 992.845, top: 333.553, width: 507, height: 444 },
} as const;

const FEATURES = [
  {
    icon: "/icons/star-05.svg",
    title: "Budgeting Intervals",
    body: "Cum et convallis risus placerat aliquam, nunc. Scelerisque aliquet faucibus tincidunt eu adipiscing sociis arcu lorem porttitor.",
  },
  {
    icon: "/icons/cube-02.svg",
    title: "Budgeting Intervals",
    body: "Cum et convallis risus placerat aliquam, nunc. Scelerisque aliquet faucibus tincidunt eu adipiscing sociis arcu lorem porttitor.",
  },
  {
    icon: "/icons/cube-04.svg",
    title: "Budgeting Intervals",
    body: "Cum et convallis risus placerat aliquam, nunc. Scelerisque aliquet faucibus tincidunt eu adipiscing sociis arcu lorem porttitor.",
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
      <Reveal
        aria-hidden
        variant="fade"
        className="pointer-events-none absolute -z-10 hidden lg:block"
        style={DECOR.glowRight}
      >
        <Image
          src="/imgs/orange-detail-right.svg"
          alt=""
          fill
          className="object-contain"
        />
      </Reveal>

      {/* Phone artwork: single image, in-flow and centered on mobile; switches
          to absolute at its exact design box from lg (avoids double-fetching
          the same SVG for two breakpoints). */}
      <Reveal
        aria-hidden
        variant="zoom"
        className="pointer-events-none relative mx-auto mb-10 h-[420px] w-[400px] lg:absolute lg:mx-0 lg:mb-0 lg:h-[761px] lg:w-[724px] lg:left-[-133.155px] lg:top-[256px]"
      >
        <Image
          src="/imgs/iphone-section-2.svg"
          alt=""
          fill
          className="object-contain"
          priority
        />
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
            features
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-1 font-display text-[36px] leading-[40px] font-bold capitalize lg:text-[48px] lg:leading-[48px]">
            Uifry Premium
          </h2>
        </Reveal>

        <div className="mt-8 flex flex-col gap-8">
          {FEATURES.map(({ icon, title, body }, index) => (
            <Reveal key={index} delay={160 + index * 80}>
              <div className="flex items-center gap-2">
                <Image src={icon} alt="" width={24} height={24} aria-hidden />
                <p className="font-display text-[18px] leading-[28px] font-semibold capitalize">
                  {title}
                </p>
              </div>
              <p className="mt-3 font-display text-[18px] leading-[28px] font-medium capitalize text-black/50">
                {body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
