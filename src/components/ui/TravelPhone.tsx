"use client";

import Image from "next/image";
import type { RefObject } from "react";
import Glow from "@/components/ui/Glow";
import { GLOW, SCREEN_BAND, VIDEO_POSTER, VIDEO_SRC } from "@/lib/scene";

/**
 * O celular que atravessa a cena Hero → Features.
 *
 * Só existe no modo cena (ver `globals.css`): abaixo de `lg`, sem JS ou com
 * `prefers-reduced-motion`, quem aparece são os dois celulares estáticos que o
 * Hero e a Features sempre tiveram. Por isso este componente não tenta ser
 * genérico — ele é a versão animada, e as outras duas ficam onde estavam, com
 * a marcação que as specs 02 e 03 já validaram pixel a pixel.
 *
 * Quatro camadas, e a ordem importa:
 *
 * 0. o glow, que viaja junto — em `-z-10` dentro do próprio celular, então
 *    fica atrás das outras três sem sair da caixa;
 * 1. os anéis, atrás e **sem rotação** (no Hero eles também não giram — só o
 *    device gira dentro deles);
 * 2. o PNG do device, que gira;
 * 3. o vídeo, colado na faixa de conteúdo da tela.
 *
 * Todo o movimento é `transform`, lido de `--p-phone` / `--p-rings` pelo CSS —
 * nada aqui muda layout, então a cena inteira roda no compositor.
 */
export default function TravelPhone({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  return (
    <div aria-hidden className="scene__phone">
      <Glow variant="features-phone" {...GLOW.local} className="scene-glow-feat" />

      <div className="scene__rings">
        <Image
          src="/imgs/rings.svg"
          alt=""
          fill
          sizes="724px"
          className="object-contain"
        />
      </div>

      <div className="scene__device">
        <Image
          src="/hero/iphone-hero.png"
          alt=""
          fill
          sizes="360px"
          className="object-contain"
          priority
        />

        {/*
          `preload="none"` e sem `src` no HTML: o arquivo só é buscado quando o
          trilho chega perto (ver `ScrollScene`), pelo mesmo motivo do
          `VideoModal` — a landing não deve baixar megabytes de vídeo antes de
          alguém chegar na cena. Até lá o poster cobre a faixa, então não há
          buraco branco na tela do celular.

          Sem `controls` e sem `autoPlay`: este vídeo nunca *toca*. O único
          jeito de ele avançar é alguém escrever `currentTime`.
        */}
        <video
          ref={videoRef}
          poster={VIDEO_POSTER}
          muted
          playsInline
          preload="none"
          disableRemotePlayback
          tabIndex={-1}
          className="scene__screen object-cover"
          style={SCREEN_BAND}
        />
      </div>
    </div>
  );
}

/** Exportado só para o `ScrollScene` não reimportar a constante. */
export { VIDEO_SRC };
