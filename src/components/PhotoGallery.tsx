"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * Editorial photo gallery with full-screen lightbox.
 * - Hero image + side stack, "toutes les photos" opens the lightbox
 * - Keyboard: ← → navigate, Esc closes
 * - Minimal chrome: counter, thin bordeaux accents, calm fades
 */
export function PhotoGallery({
  photos,
  title,
  allLabel,
}: {
  photos: string[];
  title: string;
  allLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const step = useCallback(
    (d: number) => setIndex((i) => (i + d + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  if (photos.length === 0) return null;

  return (
    <>
      {/* Grid */}
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <button
          type="button"
          onClick={() => show(0)}
          className="hero-curtain group relative aspect-[16/10] cursor-zoom-in overflow-hidden bg-stone text-left"
          aria-label={title}
        >
          <Image
            src={photos[0]}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="hero-zoom object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {photos.length > 1 && (
            <span className="absolute bottom-4 right-4 border border-white/70 bg-black/30 px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors group-hover:bg-black/50">
              {allLabel} ({photos.length})
            </span>
          )}
        </button>

        <div className="hidden lg:grid grid-rows-2 gap-3">
          {photos.slice(1, 3).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => show(i + 1)}
              className="group relative cursor-zoom-in overflow-hidden bg-stone"
              aria-label={`${title} — photo ${i + 2}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {i === 1 && photos.length > 3 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 font-display text-2xl text-white">
                  +{photos.length - 3}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[#100a0b]/97 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white/80">
            <span className="font-mono text-[0.7rem] tracking-[0.25em] tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="flex h-10 w-10 items-center justify-center border border-white/25 text-lg transition-colors hover:border-white hover:text-white"
            >
              ✕
            </button>
          </div>

          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={photos[index]}
              src={photos[index]}
              alt={`${title} — ${index + 1}`}
              fill
              sizes="100vw"
              quality={90}
              className="object-contain px-4 pb-4 lg:px-20"
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white lg:flex"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white lg:flex"
                >
                  →
                </button>
              </>
            )}
          </div>

          {/* thumbnail strip */}
          {photos.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-5 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden transition-opacity ${
                    i === index
                      ? "opacity-100 ring-1 ring-[#c0a062]"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
