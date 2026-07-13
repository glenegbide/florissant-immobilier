"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Item = { href: string; label: string };

export function MobileMenu({
  items,
  contactHref,
  contactLabel,
  locale,
}: {
  items: Item[];
  contactHref: string;
  contactLabel: string;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-white" />
      <div className="relative flex h-[100dvh] flex-col px-6 py-6">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Florissant Immobilier</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="text-3xl leading-none text-ink"
          >
            ×
          </button>
        </div>

        <nav className="mt-14 flex flex-col gap-6">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display text-3xl text-ink"
              style={{
                transition: "opacity .5s, transform .5s",
                transitionDelay: open ? `${140 + i * 60}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(12px)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-6">
          <Link
            href={contactHref}
            onClick={() => setOpen(false)}
            className="text-[0.8rem] uppercase tracking-[0.18em] text-bordeaux"
          >
            {contactLabel}
          </Link>
          <LanguageSwitcher
            locale={locale}
            className="gap-3 text-sm"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex flex-col gap-[5px] p-1"
      >
        <span className="block h-px w-6 bg-ink" />
        <span className="block h-px w-6 bg-ink" />
        <span className="block h-px w-4 bg-ink" />
      </button>
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
