import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import ScrollScene from "@/components/sections/ScrollScene";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero e Features entram como slots, não como children soltos: a cena
          precisa envolver cada um num wrapper próprio para animá-los em
          separado, e passá-los assim mantém os dois como Server Components. */}
      <ScrollScene hero={<Hero />} features={<Features />} />
      <Testimonials />
      {/* Next sections (about, pricing) land here. */}
    </main>
  );
}
