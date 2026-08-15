"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

type Variant = "rise" | "zoom" | "fade";

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  /** `rise` = fade + 24px up · `zoom` = fade + scale · `fade` = opacity only. */
  variant?: Variant;
  /** Stagger, in ms, applied as the transition delay. */
  delay?: number;
};

/**
 * Wraps its children in a div that fades in the first time it reaches the
 * viewport. The motion itself lives in globals.css (`[data-reveal]`); this
 * component only decides *when* to flip the switch.
 *
 * It forwards `className` and `style`, so the rendered div can *be* the
 * positioned element rather than an extra box around it — that's what lets the
 * hero's absolutely-placed decor layers animate without their geometry moving.
 *
 * Keeping the client boundary here means Hero, Features and Footer stay Server
 * Components; their children are still rendered on the server and passed in.
 *
 * `data-revealed` is written straight to the node instead of being held in
 * React state: it's a one-way, one-shot presentational flag that nothing else
 * reads, so routing it through a re-render would only add a render pass.
 */
export default function Reveal({
  variant = "rise",
  delay = 0,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reveal = () => element.setAttribute("data-revealed", "");

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal();
        // One-shot: nothing re-animates on the way back up.
        observer.disconnect();
      },
      // The bottom inset keeps a block from firing while it's still a sliver
      // at the edge of the screen. Anything already on screen at mount — the
      // hero — intersects immediately, so it animates on load for free.
      { threshold: 0.1, rootMargin: "0px 0px -15% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal={variant}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}
