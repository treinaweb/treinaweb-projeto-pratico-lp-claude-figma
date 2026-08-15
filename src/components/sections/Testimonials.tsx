"use client";

import { useState } from "react";
import Image from "next/image";
import StarRating from "@/components/ui/StarRating";
import Reveal from "@/components/ui/Reveal";

/**
 * Orbit slot positions, as a percentage of the square orbit container's
 * side. Loosely derived from the Figma node `101:281` ("Group
 * 1000002331") ellipses `42`, `45`, `46`, which sit near the top-right,
 * left, and bottom-right of the orbit rings respectively — mirrored here
 * as three fixed tab positions so a given testimonial always orbits in
 * the same spot instead of reshuffling on click.
 */
const SLOTS = [
  { top: "4%", left: "58%" },
  { top: "36%", left: "0%" },
  { top: "78%", left: "64%" },
] as const;

const TESTIMONIALS = [
  {
    avatar: "/testimonials/avatar-1.jpg",
    name: "Aiko Tanaka",
    role: "Chief Financial Officer",
    headline: "The Best Financial Accounting App Ever!",
    quote:
      "Arcu at dictum sapien, mollis. Vulputate sit id accumsan, ultricies. In ultrices malesuada elit mauris etiam odio. Duis tristique lacus, et blandit viverra nisl velit.",
    rating: 5,
  },
  {
    avatar: "/testimonials/avatar-2.jpg",
    name: "Marcus Webb",
    role: "Product Manager",
    headline: "Finally, Budgeting That Feels Effortless",
    quote:
      "Sed mattis rhoncus, diam suspendisse sit nunc, gravida eu. Lectus eget eget ac dolor neque lorem sapien, suspendisse aliquam gravida eu lectus eget.",
    rating: 5,
  },
  {
    avatar: "/testimonials/avatar-3.jpg",
    name: "Sophie Bennett",
    role: "Freelance Designer",
    headline: "My Savings Finally Make Sense",
    quote:
      "Nunc scelerisque aliquet faucibus tincidunt eu adipiscing sociis arcu lorem porttitor, cum et convallis risus placerat aliquam nunc scelerisque.",
    rating: 4,
  },
] as const;

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = TESTIMONIALS[activeIndex];

  function selectByOffset(offset: number) {
    setActiveIndex(
      (current) =>
        (current + offset + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  }

  return (
    <section
      id="testimonials"
      className="relative mx-auto max-w-(--spacing-container) px-6 pt-8 pb-24 lg:px-0 lg:pt-[40px] lg:pb-[180px]"
    >
      <Reveal className="mx-auto max-w-[455px] text-center lg:mx-0 lg:max-w-none lg:text-left">
        <p className="font-display text-[18px] leading-[28px] font-medium tracking-[2.88px] text-accent uppercase">
          testimonial
        </p>
        <h2 className="mt-1 font-display text-[36px] leading-[40px] font-bold capitalize lg:text-[48px] lg:leading-[48px]">
          What our users say about us?
        </h2>
      </Reveal>

      <div className="mt-12 grid items-center gap-12 lg:grid-cols-[600px_1fr] lg:gap-12">
        <Reveal
          variant="zoom"
          className="relative mx-auto aspect-square w-full max-w-[420px] lg:max-w-[600px]"
        >
          <div className="absolute inset-[7%] rounded-full border border-black/10" />
          <div className="absolute inset-[3.5%] rounded-full border border-black/10" />
          <div className="absolute inset-0 rounded-full border border-black/10" />

          <div
            role="tablist"
            aria-label="Testimonials"
            className="absolute inset-0"
          >
            {TESTIMONIALS.map((testimonial, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={testimonial.name}
                  type="button"
                  role="tab"
                  id={`testimonial-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls="testimonial-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      selectByOffset(1);
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      selectByOffset(-1);
                    }
                  }}
                  className={`absolute h-[18%] w-[18%] overflow-hidden rounded-full transition-opacity ${
                    isActive
                      ? "ring-2 ring-accent ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={SLOTS[index]}
                >
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>

          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          >
            <Image
              src={active.avatar}
              alt=""
              fill
              sizes="(min-width: 1024px) 280px, 200px"
              className="object-cover"
            />
          </div>

          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 flex h-[13%] w-[13%] translate-x-[70%] -translate-y-[130%] items-center justify-center rounded-full bg-accent"
          >
            <Image src="/icons/quote.svg" alt="" width={20} height={16} />
          </div>
        </Reveal>

        <Reveal
          delay={120}
          id="testimonial-panel"
          role="tabpanel"
          aria-labelledby={`testimonial-tab-${activeIndex}`}
          className="mx-auto max-w-[442px] text-center lg:mx-0 lg:max-w-[442px] lg:text-left"
        >
          {/* Keyed on the active tab so switching testimonials replays the
              crossfade instead of swapping the text in place. */}
          <div
            key={activeIndex}
            className="animate-reveal-in motion-reduce:animate-none"
          >
            <h3 className="font-display text-[24px] leading-[32px] font-bold capitalize lg:text-[28px] lg:leading-[36px]">
              {active.headline}
            </h3>
            <StarRating
              value={active.rating}
              className="mt-4 justify-center lg:justify-start"
            />
            <p className="mt-4 font-display text-[18px] leading-[28px] font-medium text-black/50">
              &ldquo;{active.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={active.avatar}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <p className="font-display text-[16px] leading-[22px] font-semibold capitalize">
                  {active.name}
                </p>
                <p className="font-display text-[14px] leading-[20px] font-medium text-black/50">
                  {active.role}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
