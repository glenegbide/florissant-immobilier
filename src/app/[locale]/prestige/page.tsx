import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Prestige Collection" : "Collection Prestige",
    description: en
      ? "A confidential selection of exceptional properties, shared only with our distinguished clients."
      : "Une sélection confidentielle de biens d'exception, présentée uniquement à nos clients privilégiés.",
  };
}

export default async function PrestigePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const en = locale === "en";

  const offMarket = await prisma.property.findMany({
    where: { status: "active", offMarket: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* Dark editorial hero — the one deliberately darker moment of the site */}
      <section className="bg-bordeaux-deep text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <Reveal>
              <p className="text-[0.65rem] font-normal uppercase tracking-[0.3em] text-[#c9a86a]">
                {en ? "Prestige Collection" : "Collection Prestige"}
              </p>
              <h1 className="mt-5 font-display text-4xl leading-[1.1] lg:text-[3.2rem]">
                {en ? "Some properties are " : "Certains biens ne "}
                <em className="text-[#c9a86a]">
                  {en ? "never advertised." : "s'affichent jamais."}
                </em>
              </h1>
              <p className="mt-6 max-w-lg text-[1.02rem] font-light leading-relaxed text-white/75">
                {en
                  ? "Our most exceptional mandates are shared off market, in complete confidence, with a small circle of qualified buyers. Tell us what you are looking for — if it exists, we will know."
                  : "Nos mandats les plus exceptionnels circulent hors marché, en toute confidentialité, auprès d'un cercle restreint d'acquéreurs qualifiés. Dites-nous ce que vous recherchez — si le bien existe, nous le saurons."}
              </p>
              <Link
                href={`/${locale}/contact`}
                className="arrow-link mt-9 inline-block border border-[#c9a86a] px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-[#c9a86a] transition-colors hover:bg-[#c9a86a] hover:text-bordeaux-deep"
              >
                {en ? "Access the collection" : "Accéder à la collection"}{" "}
                <span className="arrow ml-1">→</span>
              </Link>
            </Reveal>
            <Reveal delay={150} className="relative">
              <div className="pointer-events-none absolute -bottom-3 -right-3 hidden h-full w-full border border-[#c9a86a]/40 lg:block" />
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/photos/salon_furnished.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Off-market listings if any are published */}
      {offMarket.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <Reveal>
            <p className="eyebrow">
              {en ? "Currently available" : "Actuellement disponibles"}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {offMarket.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 110}>
                <PropertyCard p={p} locale={locale} t={t} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
