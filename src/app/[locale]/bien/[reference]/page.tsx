import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { site } from "@/lib/site";
import { priceLabel, chf } from "@/lib/format";
import { publicWhere } from "@/lib/listings";
import { Reveal } from "@/components/Reveal";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PropertyCard } from "@/components/PropertyCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}): Promise<Metadata> {
  const { locale, reference } = await params;
  const p = await prisma.property.findUnique({ where: { reference } });
  if (!p) return { title: "Bien introuvable" };
  const en = locale === "en";
  const title = (en ? p.seoTitleEn : p.seoTitleFr) || (en ? p.titleEn : p.titleFr);
  const desc =
    (en ? p.seoDescEn : p.seoDescFr) ||
    (en ? p.descriptionEn : p.descriptionFr).slice(0, 160);
  return {
    title,
    description: desc,
    alternates: { canonical: `/${locale}/bien/${reference}` },
    openGraph: {
      title,
      description: desc,
      images: p.photos[0] ? [{ url: p.photos[0] }] : undefined,
    },
  };
}

function fmtDate(d: Date, locale: string) {
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; reference: string }>;
}) {
  const { locale, reference } = await params;
  const t = getDict(locale);

  const p = await prisma.property.findFirst({
    where: { reference, ...publicWhere() },
  });
  if (!p) notFound();

  const similar = await prisma.property.findMany({
    where: {
      ...publicWhere(),
      offerType: p.offerType,
      id: { not: p.id },
      AND: [{ OR: [{ city: p.city }, { canton: p.canton }] }],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 3,
  });

  const en = locale === "en";
  const title = locale === "en" ? p.titleEn : p.titleFr;
  const description = locale === "en" ? p.descriptionEn : p.descriptionFr;
  const label = priceLabel(p, t.listing);
  const backHref = `/${locale}/${p.offerType === "SALE" ? "acheter" : "louer"}`;

  const availability =
    p.availability === "date" && p.availableFrom
      ? `${t.listing.date} ${fmtDate(p.availableFrom, locale)}`
      : p.availability === "by_agreement"
        ? t.listing.by_agreement
        : t.listing.immediately;

  const facts: [string, string][] = [];
  if (p.rooms != null) facts.push([cap(t.listing.rooms), String(p.rooms)]);
  if (p.bedrooms != null) facts.push([locale === "en" ? "Bedrooms" : "Chambres", String(p.bedrooms)]);
  if (p.bathrooms != null) facts.push([locale === "en" ? "Bathrooms" : "Salles de bain", String(p.bathrooms)]);
  if (p.floor != null) facts.push([t.listing.floor, String(p.floor)]);
  if (p.buildingFloors != null)
    facts.push([locale === "en" ? "Floors in building" : "Étages de l'immeuble", String(p.buildingFloors)]);
  if (p.livingArea != null) facts.push([t.listing.livingArea, `${p.livingArea} m²`]);
  if (p.usableArea != null) facts.push([t.listing.usableArea, `${p.usableArea} m²`]);
  if (p.landArea != null)
    facts.push([locale === "en" ? "Land area" : "Surface du terrain", `${p.landArea} m²`]);
  if (p.volume != null) facts.push([t.listing.volume, `${p.volume} m³`]);
  if (p.ceilingHeight != null) facts.push([t.listing.ceilingHeight, `${p.ceilingHeight} m`]);
  if (p.yearBuilt != null) facts.push([t.listing.yearBuilt, String(p.yearBuilt)]);
  if (p.lastRenovation != null) facts.push([t.listing.lastRenovation, String(p.lastRenovation)]);
  facts.push([cap(t.listing.availability), availability]);

  const locationLine = [
    !p.hideStreet && p.street ? p.street : null,
    `${p.postalCode ?? ""} ${p.city}`.trim(),
    p.district,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <Link
        href={backHref}
        className="arrow-link text-[0.72rem] uppercase tracking-[0.2em] text-mutedbrand transition-colors hover:text-bordeaux"
      >
        <span className="arrow inline-block rotate-180">→</span> {t.listing.backToList}
      </Link>

      {/* Gallery with lightbox */}
      <div className="mt-7">
        <PhotoGallery
          photos={p.photos}
          title={title}
          allLabel={locale === "en" ? "All photos" : "Toutes les photos"}
        />
      </div>

      <div className="mt-12 grid gap-14 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.2em]">
            <span className="text-bordeaux">{p.district ?? p.city}</span>
            <span className="text-mutedbrand"> · {p.canton}</span>
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink lg:text-[2.75rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm font-light text-mutedbrand">{locationLine}</p>

          {description && (
            <p className="mt-8 max-w-2xl text-[1.05rem] font-light leading-relaxed text-ink/80">
              {description}
            </p>
          )}

          {/* Details */}
          <div className="mt-14 flex items-center gap-4">
            <span className="h-px w-8 bg-bordeaux" />
            <h2 className="eyebrow">{t.listing.details}</h2>
          </div>
          <dl className="mt-6 grid max-w-2xl gap-x-12 gap-y-0 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 border-b border-line py-3.5">
                <dt className="text-sm font-light text-mutedbrand">{k}</dt>
                <dd className="text-sm text-ink tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Features */}
          {p.features.length > 0 && (
            <>
              <div className="mt-14 flex items-center gap-4">
                <span className="h-px w-8 bg-bordeaux" />
                <h2 className="eyebrow">{t.listing.features}</h2>
              </div>
              <ul className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-light text-ink/85">
                    <span className="inline-block h-1 w-1 shrink-0 bg-bordeaux" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Price sidebar */}
        <aside className="h-fit border border-line bg-white p-8 lg:sticky lg:top-28">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-mutedbrand">
              {p.reference}
            </p>
            {p.transactionStatus !== "available" && (
              <span className="bg-bordeaux/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-bordeaux">
                {
                  {
                    reserved: en ? "Reserved" : "Réservé",
                    rented: en ? "Rented" : "Loué",
                    sold: en ? "Sold" : "Vendu",
                  }[p.transactionStatus]
                }
              </span>
            )}
          </div>
          <p className="mt-4 font-display text-[1.9rem] leading-none text-ink">{label}</p>
          {p.offerType === "RENT" && !p.priceOnRequest && (
            <>
              <p className="mt-2 text-xs font-light text-mutedbrand">
                {p.chargesIncluded ? t.listing.chargesIncluded : t.listing.chargesNotIncluded}
              </p>
              {(p.charges != null || p.grossRent != null) && (
                <dl className="mt-3 space-y-1 text-xs font-light text-mutedbrand">
                  {p.charges != null && (
                    <div className="flex justify-between gap-4">
                      <dt>{en ? "Charges" : "Charges"}</dt>
                      <dd className="tabular-nums">{chf(p.charges)}.–</dd>
                    </div>
                  )}
                  {p.grossRent != null && (
                    <div className="flex justify-between gap-4">
                      <dt>{en ? "Gross rent" : "Loyer brut"}</dt>
                      <dd className="tabular-nums">{chf(p.grossRent)}.–</dd>
                    </div>
                  )}
                </dl>
              )}
            </>
          )}
          <div className="my-6 h-px w-full bg-line" />
          <div className="space-y-3">
            <Link
              href={`/${locale}/contact?ref=${p.reference}`}
              className="arrow-link block bg-bordeaux px-6 py-3.5 text-center text-[0.75rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-bordeaux-soft"
            >
              {t.listing.contactUs} <span className="arrow ml-1">→</span>
            </Link>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
                `${en ? "Hello, I am interested in" : "Bonjour, je suis intéressé(e) par"} ${title} (${p.reference}) — ${site.url}/${locale}/bien/${p.reference}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-line px-6 py-3.5 text-center text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(`${title} (${p.reference})`)}`}
              className="block border border-line px-6 py-3.5 text-center text-[0.75rem] uppercase tracking-[0.2em] text-ink transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              {en ? "Email" : "E-mail"}
            </a>
            {p.brochureUrl && (
              <a
                href={p.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-2 text-center text-[0.72rem] uppercase tracking-[0.2em] text-bordeaux link-underline"
              >
                {en ? "Download brochure (PDF)" : "Télécharger la plaquette (PDF)"}
              </a>
            )}
            {p.videoUrl && (
              <a
                href={p.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-1 text-center text-[0.72rem] uppercase tracking-[0.2em] text-mutedbrand hover:text-bordeaux transition-colors"
              >
                {en ? "Video" : "Vidéo"}
              </a>
            )}
            {p.virtualTourUrl && (
              <a
                href={p.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-1 text-center text-[0.72rem] uppercase tracking-[0.2em] text-mutedbrand hover:text-bordeaux transition-colors"
              >
                {en ? "Virtual tour" : "Visite virtuelle"}
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <Reveal>
            <p className="eyebrow">
              {en ? "Similar properties" : "Biens similaires"}
            </p>
          </Reveal>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s, i) => (
              <Reveal key={s.id} delay={i * 110}>
                <PropertyCard p={s} locale={locale} t={t} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
