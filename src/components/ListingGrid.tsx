import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";

export async function ListingPage({
  locale,
  offerType,
}: {
  locale: string;
  offerType?: "RENT" | "SALE";
}) {
  const t = getDict(locale);
  const properties = await prisma.property.findMany({
    where: { status: "active", ...(offerType ? { offerType } : {}) },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const title =
    offerType === "SALE"
      ? t.listing.forSalePage
      : offerType === "RENT"
        ? t.listing.forRentPage
        : t.listing.allPage;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <Reveal>
        <p className="eyebrow">Florissant Immobilier · International</p>
        <div className="mt-4 flex items-baseline justify-between gap-6 border-b border-line pb-8">
          <h1 className="font-display text-4xl text-ink lg:text-[3rem]">{title}</h1>
          <span className="text-[0.72rem] uppercase tracking-[0.2em] text-mutedbrand tabular-nums">
            {String(properties.length).padStart(2, "0")}{" "}
            {locale === "en" ? "properties" : "biens"}
          </span>
        </div>
      </Reveal>

      {properties.length === 0 ? (
        <p className="mt-16 font-light text-mutedbrand">{t.listing.noResults}</p>
      ) : (
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 110}>
              <PropertyCard p={p} locale={locale} t={t} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
