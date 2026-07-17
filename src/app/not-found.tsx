import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo/icon.png" alt="" className="h-20 w-auto opacity-90" />
      <p className="eyebrow mt-8">Florissant Immobilier · International</p>
      <h1 className="mt-4 font-display text-4xl text-ink lg:text-5xl">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-md text-[1.02rem] font-light leading-relaxed text-mutedbrand">
        Cette page n&apos;existe pas ou n&apos;est plus disponible. — This page does
        not exist or is no longer available.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link
          href="/fr"
          className="bg-bordeaux px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
        >
          Accueil
        </Link>
        <Link
          href="/en"
          className="border border-line px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
        >
          English home
        </Link>
      </div>
    </div>
  );
}
