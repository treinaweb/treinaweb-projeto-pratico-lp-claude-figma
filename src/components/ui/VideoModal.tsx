"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

/** 6s, 720p, 16:9, com áudio — a proporção é o que `aspect-video` assume abaixo. */
const VIDEO_SRC = "/video/uifry-app-omni.mp4";

/**
 * O gatilho "Ver o vídeo" do Hero mais o modal que ele abre.
 *
 * É um `<dialog>` nativo em vez de uma div com `position: fixed`: o
 * `showModal()` entrega de graça a top layer (nada da página consegue passar
 * por cima, nem os glows do Hero, que são o caso mais frágil aqui), o `inert`
 * no resto do documento e o foco preso dentro do modal.
 *
 * O que ele *não* entrega de forma confiável é o evento `close`. Medido neste
 * projeto: o dialog fecha (`open` vira false) sem que `close` dispare — nem
 * para o `onClose` do React, nem para um listener nativo registrado direto no
 * elemento. Por isso a limpeza (pausar o vídeo, devolver a rolagem) não fica
 * pendurada nesse evento: ela mora em `closeModal`, e todos os três caminhos
 * de saída — botão, backdrop e Esc — passam por lá. O `onClose` continua
 * ligado só como rede de segurança para o caso de o browser fechar o dialog
 * por um caminho que não seja nenhum desses três.
 *
 * O componente inteiro é o gatilho *e* o modal para que o client boundary pare
 * nesta folha — Hero continua Server Component.
 */
export default function VideoModal() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const openModal = () => {
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
    // Ainda dentro do gesto do clique, então o autoplay *com* áudio é
    // permitido. Se o browser recusar assim mesmo, os controles nativos
    // continuam ali e a promise rejeitada não pode virar unhandled rejection.
    videoRef.current?.play().catch(() => {});
  };

  const closeModal = useCallback(() => {
    document.documentElement.style.overflow = "";

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    // No-op se o dialog já estiver fechado, que é o caso quando esta função
    // chega aqui vinda do `onClose`.
    dialogRef.current?.close();
  }, []);

  // Rede de segurança: se o componente sumir com o modal aberto, ninguém
  // fecha e a página fica travada sem rolagem.
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex cursor-pointer items-center gap-[14px] font-display text-[18px] leading-[28px] font-medium transition-opacity hover:opacity-70"
      >
        <Image src="/icons/play.svg" alt="" width={29} height={29} aria-hidden />
        {/* O rótulo precisa terminar antes de ~x=609 no frame de 1440: a partir
            dali passa a fita preta do `badge-card`, e o texto (que é preto e
            fica por cima) simplesmente some. "Watch Video" tinha essa folga;
            qualquer tradução mais longa perde as últimas letras. */}
        Ver o vídeo
      </button>

      <dialog
        ref={dialogRef}
        onClose={closeModal}
        // O Esc é tratado aqui, e não no `onCancel`, pelo mesmo motivo do
        // `close`: `keydown` borbulha e a delegação do React o entrega sempre.
        // Se o browser fechar o dialog por conta própria depois disso, o
        // `close()` de `closeModal` já terá rodado e vira no-op.
        onKeyDown={(event) => {
          if (event.key === "Escape") closeModal();
        }}
        // Clicar no backdrop tem o próprio `<dialog>` como alvo: o box do modal
        // é o conteúdo, e tudo em volta dele é backdrop.
        onClick={(event) => {
          if (event.target === dialogRef.current) closeModal();
        }}
        aria-label="Vídeo de apresentação do Uifry"
        // `overflow-visible`: o padrão do `<dialog>` é `overflow: auto`, e o
        // botão de fechar (que fica meio para fora da caixa) fazia o modal
        // ganhar barra de rolagem.
        className="video-dialog m-auto w-[min(960px,92vw)] overflow-visible border-0 bg-transparent p-0"
      >
        <div className="relative">
          {/* O recorte mora no wrapper, não no `<video>`: o botão de fechar é
              irmão dele e não pode ser cortado junto. */}
          <div className="overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              controls
              playsInline
              // A landing page não deve baixar 1,6 MB de vídeo antes de alguém pedir.
              preload="none"
              className="aspect-video w-full"
            />
          </div>

          <button
            type="button"
            onClick={closeModal}
            aria-label="Fechar vídeo"
            className="absolute -top-3 -right-3 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-accent hover:text-white"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 1L13 13M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </dialog>
    </>
  );
}
