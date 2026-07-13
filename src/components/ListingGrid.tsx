import { prisma } from "@/lib/prisma";
import { getDict } from "@/lib/i18n";
import { publicWhere } from "@/lib/listings";
import { cantons } from "@/lib/admin-options";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";

export type ListingFilters = {
  offer?: string; // "SALE" | "RENT" — only offered on the all-properties page
  canton?: string;
  city?: string;
  rooms?: string; // minimum
  price?: string; // maximum
};

export async function ListingPage({
  locale,
  offerType,
  filters = {},
  basePath,
}: {
  locale: string;
  offerType?: "RENT" | "SALE";
  filters?: ListingFilters;
  basePath: string;
}) {
  const t = getDict(locale);

  const offer =
    offerType ??
    (filters.offer === "SALE" || filters.offer === "RENT"
      ? (filters.offer as "RENT" | "SALE")
      : undefined);
  const minRooms = Number(filters.rooms) || undefined;
  const maxPrice = Number(filters.price) || undefined;
  const hasFilters = Boolean(
    filters.canton || filters.city || minRooms || maxPrice || (!offerType && offer)
  );

  const properties = await prisma.property.findMany({
    where: {
      ...publicWhere(),
      ...(offer ? { offerType: offer } : {}),
      ...(filters.canton ? { canton: filters.canton } : {}),
      ...(filters.city
        ? {
            OR: [
              { city: { contains: filters.city, mode: "insensitive" } },
              { district: { contains: filters.city, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(minRooms ? { rooms: { gte: minRooms } } : {}),
      ...(maxPrice ? { price: { lte: maxPrice } } : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const title =
    offerType === "SALE"
      ? t.listing.forSalePage
      : offerType === "RENT"
        ? t.listing.forRentPage
        : t.listing.allPage;

  const inputCls =
    "border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-bordeaux";

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      <Reveal>
        <p className="eyebrow">Florissant Immobilier · International</p>
        <div className="mt-4 flex items-baseline justify-between gap-6 border-b border-line pb-8">
          <h1 className="font-display text-4xl text-ink lg:text-[3rem]">{title}</h1>
          <span className="text-[0.72rem] uppercase tracking-[0.2em] text-mutedbrand tabular-nums">
            {String(properties.length).padStart(2, "0")} {locale === "en" ? "properties" : "biens"}
          </span>
        </div>
      </Reveal>

      {/* ── Compact filter bar ── */}
      <form method="get" className="mt-8 flex flex-wrap items-center gap-3">
        {!offerType && (
          <select name="offer" defaultValue={filters.offer ?? ""} className={inputCls} aria-label={t.listing.fOffer}>
            <option value="">{t.listing.fOffer}</option>
            <option value="SALE">{t.listing.fSale}</option>
            <option value="RENT">{t.listing.fRent}</option>
          </select>
        )}
        <select name="canton" defaultValue={filters.canton ?? ""} className={inputCls} aria-label={t.listing.fCanton}>
          <option value="">{t.listing.fCanton} — {t.listing.fAll.toLowerCase()}</option>
          {cantons.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder={t.listing.fCity}
          className={inputCls + " min-w-[150px]"}
          aria-label={t.listing.fCity}
        />
        <select name="rooms" defaultValue={filters.rooms ?? ""} className={inputCls} aria-label={t.listing.fRooms}>
          <option value="">{t.listing.fRooms}</option>
          {["1.5", "2.5", "3.5", "4.5", "5.5", "6.5"].map((r) => (
            <option key={r} value={r}>
              {r}+
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          min={0}
          defaultValue={filters.price ?? ""}
          placeholder={`${t.listing.fPriceMax} (CHF)`}
          className={inputCls + " w-[170px]"}
          aria-label={t.listing.fPriceMax}
        />
        <button
          type="submit"
          className="bg-bordeaux px-5 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-bordeaux-soft"
        >
          {t.listing.fApply}
        </button>
        {hasFilters && (
          <a href={basePath} className="text-sm font-light text-mutedbrand transition-colors hover:text-bordeaux">
            {t.listing.fReset}
          </a>
        )}
      </form>

      {properties.length === 0 ? (
        <p className="mt-16 font-light text-mutedbrand">
          {hasFilters ? t.listing.noResultsFiltered : t.listing.noResults}
        </p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
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
