import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Features />
      <Testimonials />
      {/* Next sections (about, pricing) land here. */}
    </main>
  );
}
