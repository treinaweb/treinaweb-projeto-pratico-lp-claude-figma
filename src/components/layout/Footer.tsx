import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

/**
 * As três colunas + o bloco da newsletter (340px) só cabem na mesma fileira até
 * ~1090px, a largura do container. Os títulos saem em 32px e as colunas medem
 * pelo item mais largo, então rótulos longos ("Política de privacidade",
 * "Navegação") estouram a conta e empurram a newsletter para uma segunda linha
 * — que é o que acontecia na tradução literal do design em inglês. Daí os
 * rótulos curtos aqui.
 */
const FOOTER_COLUMNS = [
  {
    title: "Links",
    links: [
      { label: "Início", href: "#home" },
      { label: "Sobre nós", href: "#about" },
      { label: "Carreiras", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Jurídico",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
  {
    title: "Produto",
    links: [
      { label: "Fazer um tour", href: "#" },
      { label: "Fale conosco", href: "#" },
      { label: "Avaliações", href: "#" },
    ],
  },
] as const;

// Sem `capitalize`: em pt-BR os rótulos são escritos em sentence case direto no
// dado acima, em vez de serem title-cased pelo CSS como no design em inglês.
const LINK_CLASSES =
  "font-display text-[16px] leading-[26px] font-medium text-black transition-colors hover:text-accent";

export default function Footer() {
  return (
    // `w-full` matters: this is a flex item, and an auto cross-axis margin
    // cancels `stretch`, which was collapsing the footer to fit-content
    // (1002px) instead of the 1090px container every other section uses.
    <footer className="relative mx-auto w-full max-w-(--spacing-container) px-6 pt-16 pb-10 lg:px-0 lg:pt-20">
      <div className="flex flex-col gap-10 lg:flex-row lg:flex-wrap lg:justify-between lg:gap-x-10 lg:gap-y-10">
        <Reveal className="flex flex-col gap-6 lg:w-[173px]">
          <a
            href="#home"
            className="flex items-end gap-1"
            aria-label="Uifry, ir para o início"
          >
            <Image src="/logo-uifry.svg" alt="Uifry" width={106} height={35} />
            <sup className="font-sans text-[4.15px] font-extrabold text-black">
              TM
            </sup>
          </a>

          <div className="flex flex-col gap-4">
            <a
              href="mailto:oi@uifry.com.br"
              className={`flex items-center gap-2 ${LINK_CLASSES}`}
            >
              <Image src="/icons/mail.svg" alt="" width={24} height={24} aria-hidden />
              oi@uifry.com.br
            </a>
            <a
              href="tel:+551140028922"
              className={`flex items-center gap-2 ${LINK_CLASSES}`}
            >
              <Image src="/icons/phone.svg" alt="" width={24} height={24} aria-hidden />
              (11) 4002-8922
            </a>
          </div>
        </Reveal>

        {FOOTER_COLUMNS.map(({ title, links }, index) => (
          <Reveal
            key={title}
            delay={(index + 1) * 80}
            className="flex flex-col gap-4"
          >
            <p className="font-display text-[24px] leading-[32px] font-bold lg:text-[32px] lg:leading-[42px]">
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
          <p className="font-display text-[24px] leading-[32px] font-bold lg:text-[32px] lg:leading-[42px]">
            Newsletter
          </p>
          <p className="font-display text-[16px] leading-[26px] font-medium text-black">
            Dicas de finanças toda quinta. Sem spam.
          </p>
          <form className="flex items-center justify-between gap-2 rounded bg-white p-2.5 shadow-[-13px_13px_104px_0px_rgba(161,161,161,0.1)]">
            <input
              type="email"
              placeholder="Seu e-mail"
              aria-label="Seu e-mail"
              className="w-full bg-transparent px-2 font-display text-[16px] leading-[26px] font-medium text-black/50 outline-none placeholder:text-black/50"
            />
            <button
              type="button"
              className="h-[61px] w-[160px] shrink-0 rounded bg-black font-display text-[16px] leading-[26px] font-medium text-white transition-colors hover:bg-black/80"
            >
              Quero receber
            </button>
          </form>
        </Reveal>
      </div>

      <Reveal
        variant="fade"
        className="mt-16 border-t border-black/10 pt-10 lg:mt-[92px]"
      >
        <p className="text-center font-display text-[16px] leading-[26px] font-medium text-black">
          © 2026 Uifry Tecnologia Ltda. — CNPJ 12.345.678/0001-90. Todos os
          direitos reservados.
        </p>
      </Reveal>
    </footer>
  );
}
