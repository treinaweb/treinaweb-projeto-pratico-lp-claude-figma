import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uifry — Finance Bank Money App",
  description: "Download a free bundle worth $549 and join the waitlist!",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning`: the inline script below stamps `data-js` on
    // this element before React hydrates, which is by definition an attribute
    // the server markup doesn't have.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} antialiased overflow-x-clip`}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap"
        />
        <style>{`:root { --font-clash: "Clash Display"; }`}</style>
        {/* Gates the reveal system's hidden start state on JS being alive.
            Blocking and before first paint, so there's no visible→hidden flash;
            if it never runs (no JS, failed hydration), content just shows. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.js=""`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans overflow-x-clip">
        <Navbar />
        {/*
          The design lives in a 1440px Figma frame that *clips* the artwork.
          Without that frame in the browser, the decor bleeds right without
          bound (Features' glow reaches container+1500px), pulling the visual
          mass off-centre and making the page read as shifted left.

          `w-full` is required: an auto cross-axis margin on a flex item
          cancels `stretch`, so `mx-auto` alone collapses this to fit-content
          — the same bug that had the footer rendering at 1002px.

          `overflow-x-clip` (not `hidden`) doesn't create a scroll container,
          so it leaves the sticky navbar and the `-z-10` glows alone.

          The navbar stays outside: it's `sticky` and has no bleeding art, and
          it already centres itself on the viewport — same axis as this frame.
        */}
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col overflow-x-clip">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
