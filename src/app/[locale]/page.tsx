import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDict, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { localePath } from "@/lib/routes";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale);
  const l = isLocale(locale) ? locale : "fr";

  const featured = await prisma.property.findMany({
    where: { status: "active", featured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const services = [
    { title: t.home.serviceBuyTitle, text: t.home.serviceBuyText, href: localePath(l, "buy") },
    { title: t.home.serviceRentTitle, text: t.home.serviceRentText, href: localePath(l, "rent") },
    { title: t.home.serviceSellTitle, text: t.home.serviceSellText, href: localePath(l, "sell") },
    { title: t.home.serviceEstimateTitle, text: t.home.serviceEstimateText, href: localePath(l, "estimate") },
    { title: t.home.serviceRelocationTitle, text: t.home.serviceRelocationText, href: localePath(l, "relocation") },
  ];

  return (
    <>
      {/* ── Hero — clean landscape band with floating card ── */}
      <section className="relative">
        <div className="hero-curtain relative h-[56vh] min-h-[420px] w-full overflow-hidden lg:h-[66vh]">
          <Image
            src="/photos/hero_roses.jpg"
            alt="Florissant Immobilier International"
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
              className="hero-rise mt-5 font-display text-[2.3rem] leading-[1.08] text-ink sm:text-[2.9rem] lg:text-[3.2rem]"
              style={{ ["--rise-delay" as string]: "90ms" }}
            >
              {t.hero.titleA}
              <em className="text-bordeaux">{t.hero.titleEm}</em>
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
                href={localePath(l, "properties")}
                className="arrow-link bg-bordeaux px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
              >
                {t.hero.ctaProperties} <span className="arrow ml-1">→</span>
              </Link>
              <Link
                href={localePath(l, "estimate")}
                className="border border-line px-7 py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
              >
                {t.hero.ctaEstimate}
              </Link>
              <Link
                href={localePath(l, "contact")}
                className="link-underline py-3.5 text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:text-bordeaux"
              >
                {t.hero.ctaContact}
              </Link>
            </div>
          </div>
          <p className="mt-6 text-[0.68rem] uppercase tracking-[0.22em] text-mutedbrand">
            {t.hero.regions}
          </p>
        </div>
      </section>

      {/* ── Selection — admin-curated, refined empty state otherwise ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{t.home.selection}</p>
            <h2 className="mt-4 font-display text-3xl text-ink lg:text-[2.5rem]">
              {t.home.selectionSub}
            </h2>
          </div>
          {featured.length > 0 && (
            <Link
              href={localePath(l, "properties")}
              className="arrow-link text-[0.75rem] uppercase tracking-[0.2em] text-bordeaux"
            >
              {t.home.viewAll} <span className="arrow">→</span>
            </Link>
          )}
        </Reveal>

        {featured.length > 0 ? (
          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 110}>
                <PropertyCard p={p} locale={l} t={t} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal delay={100}>
            <div className="mt-12 flex flex-col items-center border border-line px-8 py-16 text-center lg:py-20">
              <span className="h-px w-10 bg-bordeaux" />
              <p className="mt-6 max-w-md text-[0.98rem] font-light leading-relaxed text-mutedbrand">
                {t.home.emptySelection}
              </p>
              <Link
                href={localePath(l, "contact")}
                className="arrow-link mt-8 text-[0.72rem] uppercase tracking-[0.2em] text-bordeaux"
              >
                {t.home.emptySelectionCta} <span className="arrow">→</span>
              </Link>
            </div>
          </Reveal>
        )}
      </section>

      {/* ── Services — editorial numbered rows ── */}
      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <Reveal>
            <p className="eyebrow">{t.home.services}</p>
            <h2 className="mt-4 font-display text-3xl text-ink lg:text-[2.2rem]">
              {t.home.servicesTitle}
            </h2>
            <div className="mt-6 h-px w-16 bg-bordeaux" />
          </Reveal>
          <div className="mt-10 border-t border-line">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <Link
                  href={s.href}
                  className="arrow-link group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-line py-6 transition-colors hover:bg-white sm:grid-cols-[4rem_14rem_1fr_auto] sm:gap-6 lg:py-7"
                >
                  <span className="font-mono text-[0.7rem] tracking-[0.2em] text-bordeaux">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-xl text-ink transition-colors group-hover:text-bordeaux lg:text-2xl">
                    {s.title}
                  </h3>
                  <p className="col-span-3 col-start-1 pl-[3rem] text-sm font-light leading-relaxed text-mutedbrand sm:col-span-1 sm:col-start-3 sm:pl-0 sm:pr-8">
                    {s.text}
                  </p>
                  <span className="hidden text-[0.72rem] uppercase tracking-[0.2em] text-bordeaux sm:block">
                    <span className="arrow inline-block">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Geographic expertise ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <Reveal>
            <p className="eyebrow">{t.home.regionsEyebrow}</p>
            <h2 className="mt-5 font-display text-3xl leading-[1.12] text-ink lg:text-[2.6rem]">
              {t.home.regionsTitleA}
              <em className="text-bordeaux">{t.home.regionsTitleEm}</em>
            </h2>
            <p className="mt-6 max-w-lg text-[1.02rem] font-light leading-relaxed text-mutedbrand">
              {t.home.regionsText}
            </p>
          </Reveal>

          <Reveal delay={150}>
            <ul className="border-t border-line">
              {site.regions.map((r) => (
                <li
                  key={r}
                  className="flex items-center gap-4 border-b border-line py-4 text-[0.95rem] font-light text-ink/85"
                >
                  <span className="h-px w-6 shrink-0 bg-bordeaux" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── Owner call-to-action ── */}
      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 text-center lg:py-20">
          <Reveal>
            <h2 className="font-display text-3xl leading-[1.15] text-ink lg:text-[2.4rem]">
              {t.home.ownerTitle}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[1.02rem] font-light leading-relaxed text-mutedbrand">
              {t.home.ownerText}
            </p>
            <Link
              href={localePath(l, "contact")}
              className="arrow-link mt-9 inline-block bg-bordeaux px-8 py-4 text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
            >
              {t.home.ownerCta} <span className="arrow ml-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1fr_360px]">
          <Reveal>
            <p className="eyebrow">{t.home.contactEyebrow}</p>
            <h2 className="mt-4 font-display text-3xl text-ink lg:text-[2.5rem]">
              {t.home.contactTitle}
            </h2>
            <p className="mt-5 max-w-xl text-[1.02rem] font-light leading-relaxed text-mutedbrand">
              {t.home.contactText}
            </p>
            <div className="mt-10">
              <ContactForm t={t} locale={l} />
            </div>
          </Reveal>

          <Reveal delay={150}>
            <aside className="h-fit border border-line bg-stone p-8">
              <h3 className="eyebrow">{t.contact.directTitle}</h3>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <span className="block text-mutedbrand">{t.contact.email}</span>
                  <a
                    href={`mailto:${site.email}`}
                    className="link-underline text-ink transition-colors hover:text-bordeaux"
                  >
                    {site.email}
                  </a>
                </li>
                <li>
                  <span className="block text-mutedbrand">{t.contact.phone}</span>
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="link-underline text-ink transition-colors hover:text-bordeaux"
                  >
                    {site.phone}
                  </a>
                </li>
                <li>
                  <span className="block text-mutedbrand">{t.home.whatsapp}</span>
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-ink transition-colors hover:text-bordeaux"
                  >
                    {site.phone}
                  </a>
                </li>
              </ul>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
