"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NAV_LINKS } from "@/lib/navigation";
import Button from "@/components/ui/Button";

/**
 * Scroll thresholds for the detached state. The gap between them is
 * hysteresis: without it, resting the page right on a single threshold makes
 * the bar flip back and forth on every stray wheel tick.
 */
const DETACH_AT = 48;
const REATTACH_AT = 16;

/**
 * The bar's motion is driven by a *discrete* boolean rather than a continuous
 * scroll ratio. A one-shot state change lets the browser run a single
 * uninterrupted eased transition; mapping styles 1:1 to scrollY has no easing
 * curve at all, which is what made the earlier version feel mechanical.
 *
 * The frosted surface is a separate layer whose blur radius never changes —
 * only its opacity animates. Animating `backdrop-filter` itself forces a
 * re-rasterization of the blurred region every frame; animating opacity runs
 * on the compositor.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0].href);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;

      setIsScrolled((detached) =>
        detached ? y > REATTACH_AT : y > DETACH_AT,
      );

      // Scroll spy. A section's box can start well above anything you can see
      // — Features reserves 384px of top padding for its artwork — so the box
      // top is the wrong activation point. Each section's own
      // `scroll-margin-top` already encodes where its content really begins
      // (that's what makes anchor landings correct), so reuse it here rather
      // than keeping a second, drift-prone set of offsets.
      const line = y + window.innerHeight * 0.4;
      let current: string = NAV_LINKS[0].href;

      for (const { href } of NAV_LINKS) {
        const section = document.querySelector(href);
        if (!section) continue;

        const offset =
          parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
        const contentTop =
          section.getBoundingClientRect().top + window.scrollY - offset;

        if (contentTop <= line) current = href;
      }

      setActiveHref(current);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    // The header keeps a constant height and the bar moves inside it with a
    // transform. Animating the header's own box instead would resize an
    // in-flow element, shifting every section below it — and Chrome's scroll
    // anchoring then corrects for that shift, which re-triggers the state
    // change. That feedback loop makes anchor scrolling overshoot and drift.
    <header className="sticky top-0 z-50 h-24 w-full">
      <div
        className={`absolute inset-x-3 mx-auto flex items-center justify-between rounded-full px-6 transition-[max-width,height,transform] duration-500 ease-(--ease-fluid) motion-reduce:transition-none lg:inset-x-0 ${
          isScrolled
            ? "h-[52px] max-w-(--spacing-container-compact) translate-y-3"
            : "h-14 max-w-(--spacing-container) translate-y-10"
        }`}
      >
        {/* Frosted surface. Blur stays constant; only opacity animates. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-full border border-black/5 bg-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-opacity duration-500 ease-(--ease-fluid) motion-reduce:transition-none ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <a
          href="#home"
          className="relative z-10 flex items-end gap-1"
          aria-label="Uifry, ir para o início"
        >
          <Image
            src="/logo-uifry.svg"
            alt="Uifry"
            width={96}
            height={32}
            priority
          />
          <sup className="font-sans text-[3.76px] font-extrabold text-black">
            TM
          </sup>
        </a>

        <nav className="relative z-10 hidden lg:block" aria-label="Principal">
          <NavLinks activeHref={activeHref} />
        </nav>

        <div className="relative z-10 hidden lg:block">
          <Button href="#download" size="sm">
            Baixar app
          </Button>
        </div>

        <button
          type="button"
          className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span
            className={`h-0.5 w-6 bg-black transition-transform ${isOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-black transition-opacity ${isOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-black transition-transform ${isOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-24 z-50 flex flex-col items-center gap-8 bg-white px-6 py-10 lg:hidden">
          <NavLinks
            activeHref={activeHref}
            orientation="vertical"
            onNavigate={() => setIsOpen(false)}
          />
          <Button href="#download" onClick={() => setIsOpen(false)}>
            Baixar app
          </Button>
        </div>
      )}
    </header>
  );
}

/**
 * The active link is marked by a coral pill that slides between items. It's
 * measured from the live DOM rather than computed from the label, so it stays
 * correct across font loading and breakpoint changes.
 */
function NavLinks({
  activeHref,
  orientation = "horizontal",
  onNavigate,
}: {
  activeHref: string;
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const isHorizontal = orientation === "horizontal";

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const active = list.querySelector<HTMLAnchorElement>("[data-active='true']");
    if (!active) return;

    const next = { left: active.offsetLeft, width: active.offsetWidth };
    // Bail on unchanged geometry — the ResizeObserver below would otherwise
    // re-render on every observation.
    setIndicator((current) =>
      current.left === next.left && current.width === next.width
        ? current
        : next,
    );
  }, []);

  useEffect(() => {
    measure();
  }, [measure, activeHref]);

  // Clash Display loads from a CDN, so link widths shift after first paint.
  useEffect(() => {
    if (!isHorizontal) return;

    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    document.fonts?.ready.then(measure);

    return () => observer.disconnect();
  }, [measure, isHorizontal]);

  return (
    <ul
      ref={listRef}
      className={`relative flex ${isHorizontal ? "items-center gap-7" : "flex-col items-center gap-8 text-center"}`}
    >
      {isHorizontal && (
        <span
          aria-hidden
          className="absolute -bottom-1.5 h-[3px] rounded-full bg-accent transition-[transform,width,opacity] duration-500 ease-(--ease-fluid) motion-reduce:transition-none"
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
            opacity: indicator.width ? 1 : 0,
          }}
        />
      )}

      {NAV_LINKS.map(({ label, href }) => {
        const isActive = href === activeHref;
        return (
          <li key={label}>
            <a
              href={href}
              data-active={isActive}
              aria-current={isActive ? "true" : undefined}
              onClick={onNavigate}
              // Weight stays fixed so the label doesn't change width when it
              // becomes active — that would leave the indicator misaligned.
              className={`block font-display font-medium whitespace-nowrap transition-colors hover:text-accent ${
                isHorizontal ? "text-[17px] leading-[24px]" : "text-[20px] leading-[26px]"
              } ${isActive ? "text-accent" : "text-black"}`}
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
