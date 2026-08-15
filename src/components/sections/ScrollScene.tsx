"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import TravelPhone from "@/components/ui/TravelPhone";
import { VIDEO_SRC } from "@/lib/scene";

/**
 * Condição do modo cena. **Tem que ser idêntica à `@media` de `globals.css`** —
 * é o único acoplamento entre os dois arquivos, e ele existe porque o CSS não
 * consegue ler uma constante daqui. Mudou aqui, muda lá.
 *
 * `min-height` porque a cena empilha ~700px de arte numa tela presa: abaixo
 * disso o `--scene-fit` já teria encolhido tudo além do razoável, e a página
 * estática lê melhor. `no-preference` deixa a degradação de movimento reduzido
 * cair na mesma chave, em vez de virar um segundo caminho de código.
 */
const SCENE_MQ =
  "(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)";

/** Quanto do erro é fechado por frame. Menor = mais inércia. */
const DAMPING = 0.12;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progresso dentro de uma sub-faixa, já suavizado (smoothstep). */
const phase = (p: number, start: number, end: number) => {
  const t = clamp01((p - start) / (end - start));
  return t * t * (3 - 2 * t);
};

/**
 * Hero e Features viram uma cena só: um trilho alto com o palco preso no topo.
 * Enquanto o scroll atravessa o trilho, o celular viaja da direita para a
 * esquerda, a tela dentro dele é *scrubbada* quadro a quadro, e o texto da
 * Features sobe no lugar do texto do Hero.
 *
 * Fora do `SCENE_MQ` — mobile, tela baixa, movimento reduzido — nada disso
 * existe: `.scene__track` e `.scene__stage` são `display: contents`, somem do
 * layout, e o que sobra são as duas seções empilhadas exatamente como sempre
 * foram. Sem JS acontece o mesmo, porque o CSS da cena mora todo sob
 * `[data-js]`.
 *
 * Este é o único componente cliente da página além da navbar; Hero e Features
 * continuam Server Components e chegam aqui como `children`.
 */
export default function ScrollScene({
  hero,
  features,
}: {
  hero: ReactNode;
  features: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * Os âncoras `#home` / `#features` precisam trocar de dono conforme o modo.
   *
   * No modo estático eles são as próprias `<section>`, como sempre. No modo
   * cena as seções ficam dentro do palco `sticky`, e aí o `rect.top + scrollY`
   * que o scroll-spy da navbar usa (`Navbar.tsx`) para de distinguir uma da
   * outra — as duas ficam paradas na mesma posição o tempo todo, e "recursos"
   * acenderia junto com "início" no instante em que a cena prende. Os marcadores
   * abaixo vivem no *trilho*, que continua rolando normalmente, e por isso é
   * neles que o id tem que estar quando a cena está ativa.
   *
   * O SSR sai com os ids nas seções: sem JS é essa a marcação correta, e é ela
   * que faz os links da navbar funcionarem antes da hidratação.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = window.matchMedia(SCENE_MQ);

    const applyAnchors = () => {
      for (const name of ["home", "features"]) {
        const section = root.querySelector(`[data-section="${name}"]`);
        const marker = root.querySelector(`[data-scene-anchor="${name}"]`);
        if (!section || !marker) continue;

        if (media.matches) {
          section.removeAttribute("id");
          marker.id = name;
        } else {
          marker.removeAttribute("id");
          section.id = name;
        }
      }
    };

    applyAnchors();
    media.addEventListener("change", applyAnchors);
    return () => media.removeEventListener("change", applyAnchors);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const media = window.matchMedia(SCENE_MQ);
    let frame = 0;
    let running = false;
    let value = 0;
    let srcAttached = false;

    const write = (p: number) => {
      root.style.setProperty("--p", p.toFixed(4));
      root.style.setProperty("--p-phone", phase(p, 0.1, 0.62).toFixed(4));
      root.style.setProperty("--p-hero", phase(p, 0.05, 0.38).toFixed(4));
      // O crossfade dos glows fecha cedo, junto com o início da viagem: o glow
      // do Hero é o único que fica parado, então quanto antes ele sair, menos
      // tempo a luz passa dissociada do celular.
      root.style.setProperty("--p-glow", phase(p, 0.1, 0.42).toFixed(4));
      root.style.setProperty("--p-feat", phase(p, 0.45, 0.88).toFixed(4));
    };

    const scrub = (p: number) => {
      const video = videoRef.current;
      // `readyState >= 2` (HAVE_CURRENT_DATA) é o mínimo para um seek fazer
      // sentido; antes disso `duration` ainda pode ser NaN.
      if (!video || video.readyState < 2) return;

      const { duration } = video;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const target = p * duration;
      // Buscar de novo o mesmo quadro só ocupa o decodificador. O MP4 é 24fps
      // e todo keyframe, então meio quadro é a menor distância que ainda muda
      // alguma coisa na tela.
      if (Math.abs(video.currentTime - target) > 1 / 48) {
        video.currentTime = target;
      }
    };

    const tick = () => {
      frame = 0;
      if (!running) return;

      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const target = span > 0 ? clamp01(-rect.top / span) : 0;

      // Amortecimento: a cena persegue o scroll em vez de colar nele. É o que
      // tira o aspecto mecânico de mapear 1:1, e de quebra esconde a latência
      // do seek do vídeo.
      value += (target - value) * DAMPING;
      if (Math.abs(target - value) < 0.0005) value = target;

      write(value);
      scrub(value);

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    /**
     * A cena é a primeira coisa da página, então o trilho já está visível no
     * load e não existe "carregar quando chegar perto" — o observador
     * dispararia de imediato. O que dá para fazer é sair da frente do primeiro
     * paint: a busca do MP4 é adiada para a ociosidade, com o poster (recorte
     * exato da mesma faixa do PNG) cobrindo o buraco até lá.
     *
     * O `timeout` do `requestIdleCallback` é o teto: numa aba que nunca fica
     * ociosa o vídeo ainda começa a baixar em 2s.
     */
    const attachSource = () => {
      const video = videoRef.current;
      if (!video || srcAttached) return;
      srcAttached = true;

      const load = () => {
        video.src = VIDEO_SRC;
        video.load();
      };

      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(load, { timeout: 2000 });
      } else {
        setTimeout(load, 400);
      }

      // iOS não decodifica um vídeo que nunca foi tocado, e seeks num vídeo
      // "frio" simplesmente não pintam. Um play/pause dentro do primeiro gesto
      // do usuário destrava o decodificador; se o browser recusar, os seeks
      // seguem funcionando em todo lugar que não seja iOS.
      const unlock = () => {
        video.play().then(() => video.pause()).catch(() => {});
      };
      document.addEventListener("pointerdown", unlock, {
        once: true,
        passive: true,
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!media.matches) return;
        if (entry.isIntersecting) {
          attachSource();
          start();
        } else {
          stop();
        }
      },
      { rootMargin: "50% 0px" },
    );

    const onModeChange = () => {
      if (media.matches) return;
      // Saiu do modo cena: solta o loop e devolve as variáveis ao estado
      // inicial, senão um resize deixaria o texto da Features preso em
      // `opacity: 0` na volta.
      stop();
      write(0);
    };

    observer.observe(track);
    media.addEventListener("change", onModeChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onModeChange);
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className="scene">
      <div ref={trackRef} className="scene__track">
        {/* Zero-altura, absolutos contra o trilho. Só carregam o id no modo
            cena — ver o efeito acima. O `--scene-anchor-top` é o ponto do
            trilho em que a navbar deve considerar a seção "chegada". */}
        <span
          data-scene-anchor="home"
          className="scene__anchor"
          style={{ top: 0 }}
        />
        <span
          data-scene-anchor="features"
          className="scene__anchor"
          style={{ top: "55%" }}
        />

        <div className="scene__stage">
          <div className="scene__box">
            <div className="scene__hero">{hero}</div>
            <div className="scene__features">{features}</div>
            <TravelPhone videoRef={videoRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
