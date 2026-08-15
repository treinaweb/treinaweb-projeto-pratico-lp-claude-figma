import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const FOOTER_COLUMNS = [
  {
    title: "links",
    links: [
      { label: "home", href: "#home" },
      { label: "about us", href: "#about" },
      { label: "bookings", href: "#" },
      { label: "blog", href: "#" },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "terms of use", href: "#" },
      { label: "privacy policy", href: "#" },
      { label: "cookie policy", href: "#" },
    ],
  },
  {
    title: "product",
    links: [
      { label: "take tour", href: "#" },
      { label: "live chat", href: "#" },
      { label: "reviews", href: "#" },
    ],
  },
] as const;

const LINK_CLASSES =
  "font-display text-[16px] leading-[26px] font-medium capitalize text-black transition-colors hover:text-accent";

export default function Footer() {
  return (
    // `w-full` matters: this is a flex item, and an auto cross-axis margin
    // cancels `stretch`, which was collapsing the footer to fit-content
    // (1002px) instead of the 1090px container every other section uses.
    <footer className="relative mx-auto w-full max-w-(--spacing-container) px-6 pt-16 pb-10 lg:px-0 lg:pt-20">
      <div className="flex flex-col gap-10 lg:flex-row lg:flex-wrap lg:justify-between lg:gap-x-10 lg:gap-y-10">
        <Reveal className="flex flex-col gap-6 lg:w-[173px]">
          <a href="#home" className="flex items-end gap-1" aria-label="Uifry home">
            <Image src="/logo-uifry.svg" alt="Uifry" width={106} height={35} />
            <sup className="font-sans text-[4.15px] font-extrabold text-black">
              TM
            </sup>
          </a>

          <div className="flex flex-col gap-4">
            <a href="mailto:help@frybix.com" className={`flex items-center gap-2 ${LINK_CLASSES}`}>
              <Image src="/icons/mail.svg" alt="" width={24} height={24} aria-hidden />
              help@frybix.com
            </a>
            <a href="tel:+123445667889" className={`flex items-center gap-2 ${LINK_CLASSES}`}>
              <Image src="/icons/phone.svg" alt="" width={24} height={24} aria-hidden />
              +1 234 456 678 89
            </a>
          </div>
        </Reveal>

        {FOOTER_COLUMNS.map(({ title, links }, index) => (
          <Reveal
            key={title}
            delay={(index + 1) * 80}
            className="flex flex-col gap-4"
          >
            <p className="font-display text-[24px] leading-[32px] font-bold capitalize lg:text-[32px] lg:leading-[42px]">
              {title}
            </p>
            <ul className="flex flex-col gap-4">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={LINK_CLASSES}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}

        <Reveal delay={320} className="flex flex-col gap-4 lg:w-[340px]">
          <p className="font-display text-[24px] leading-[32px] font-bold capitalize lg:text-[32px] lg:leading-[42px]">
            Newsletter
          </p>
          <p className="font-display text-[16px] leading-[26px] font-medium capitalize text-black">
            Stay up to date
          </p>
          <form className="flex items-center justify-between gap-2 rounded bg-white p-2.5 shadow-[-13px_13px_104px_0px_rgba(161,161,161,0.1)]">
            <input
              type="email"
              placeholder="Your email"
              className="w-full bg-transparent px-2 font-display text-[16px] leading-[26px] font-medium text-black/50 outline-none placeholder:text-black/50"
            />
            <button
              type="button"
              className="h-[61px] w-[160px] shrink-0 rounded bg-black font-display text-[16px] leading-[26px] font-medium capitalize text-white transition-colors hover:bg-black/80"
            >
              Subscribe
            </button>
          </form>
        </Reveal>
      </div>

      <Reveal
        variant="fade"
        className="mt-16 border-t border-black/10 pt-10 lg:mt-[92px]"
      >
        <p className="text-center font-display text-[16px] leading-[26px] font-medium capitalize text-black">
          Copyright 2022 uifry.com all rights reserved
        </p>
      </Reveal>
    </footer>
  );
}
