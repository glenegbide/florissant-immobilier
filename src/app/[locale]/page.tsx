import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);

  const featured = await prisma.property.findMany({
    where: { status: "active", featured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <>
      {/* ── Hero — clean landscape band with floating card ── */}
      <section className="relative">
        <div className="hero-curtain relative h-[56vh] min-h-[420px] w-full overflow-hidden lg:h-[66vh]">
          <Image
            src="/photos/hero_roses.jpg"
            alt="Florissant Immobilier — Genève"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="hero-zoom object-cover object-[60%_40%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-20 -mt-24 max-w-2xl border border-line bg-white p-8 lg:-mt-28 lg:p-12">
            <p
              className="eyebrow hero-rise"
              style={{ ["--rise-delay" as string]: "0ms" }}
            >
              {t.hero.pretitle}
            </p>
            <h1
              className="hero-rise mt-5 font-display text-[2.4rem] leading-[1.05] text-ink sm:text-5xl lg:text-[3.5rem]"
              style={{ ["--rise-delay" as string]: "90ms" }}
            >
              {t.hero.titleA}
              <em className="text-bordeaux">{t.hero.titleEm}</em>
              {t.hero.titleB}
            </h1>
            <div
              className="hero-rise mt-6 h-px w-16 bg-bordeaux"
              style={{ ["--rise-delay" as string]: "180ms" }}
            />
            <p
              className="hero-rise mt-6 max-w-md text-[1.05rem] font-light leading-relaxed text-mutedbrand"
              style={{ ["--rise-delay" as string]: "240ms" }}
            >
              {t.hero.subtitle}
            </p>
            <div
              className="hero-rise mt-8 flex flex-wrap items-center gap-4"
              style={{ ["--rise-delay" as string]: "320ms" }}
            >
              <Link
                href={`/${locale}/acheter`}
                className="arrow-link bg-bordeaux px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
              >
                {t.hero.ctaBuy} <span className="arrow ml-1">→</span>
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="border border-line px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
              >
                {t.hero.ctaContact}
              </Link>
            </div>
          </div>
          <p className="mt-6 text-[0.68rem] uppercase tracking-[0.22em] text-mutedbrand">
            Genève · Suisse romande · International
          </p>
        </div>
      </section>

      {/* ── Selection (only when properties exist) ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-18 lg:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t.home.selection}</p>
              <h2 className="mt-4 font-display text-3xl text-ink lg:text-[2.5rem]">
                {t.home.selectionSub}
              </h2>
            </div>
            <Link
              href={`/${locale}/acheter`}
              className="arrow-link text-[0.75rem] uppercase tracking-[0.2em] text-bordeaux"
            >
              {t.home.viewAll} <span className="arrow">→</span>
            </Link>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 110}>
                <PropertyCard p={p} locale={locale} t={t} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Services ── */}
      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <Reveal className="flex flex-col items-center text-center">
            <p className="eyebrow">{t.home.services}</p>
            <AnimatedText
              text={t.home.servicesTitle}
              className="mt-3 items-center"
              textClassName="font-display text-3xl font-normal text-ink lg:text-[2.2rem]"
              underlineClassName="text-bordeaux"
              underlineDuration={1.8}
            />
          </Reveal>
          <div className="mt-10 grid gap-px bg-line sm:grid-cols-3">
            {[
              { title: t.home.serviceSaleTitle, text: t.home.serviceSaleText, href: `/${locale}/vendre` },
              { title: t.home.serviceRentTitle, text: t.home.serviceRentText, href: `/${locale}/louer` },
              { title: t.home.serviceIntlTitle, text: t.home.serviceIntlText, href: `/${locale}/prestige` },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 110} className="h-full">
                <Link
                  href={s.href}
                  className="arrow-link group flex h-full flex-col bg-stone p-7 transition-colors duration-500 hover:bg-white lg:p-8"
                >
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] text-bordeaux">
                    0{i + 1}
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-ink">{s.title}</h3>
                  <p className="mt-2.5 text-sm font-light leading-relaxed text-mutedbrand">
                    {s.text}
                  </p>
                  <span className="mt-5 text-[0.72rem] uppercase tracking-[0.2em] text-bordeaux">
                    <span className="arrow inline-block">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
