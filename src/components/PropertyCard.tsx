import Link from "next/link";
import Image from "next/image";
import type { Dict } from "@/lib/i18n";
import { priceLabel } from "@/lib/format";

export type PropertyCardData = {
  reference: string;
  offerType: "RENT" | "SALE";
  titleFr: string;
  titleEn: string;
  city: string;
  district: string | null;
  canton: string;
  rooms: number | null;
  bedrooms: number | null;
  livingArea: number | null;
  price: number | null;
  priceOnRequest: boolean;
  priceUnit: string;
  offMarket: boolean;
  photos: string[];
};

export function PropertyCard({
  p,
  locale,
  t,
}: {
  p: PropertyCardData;
  locale: string;
  t: Dict;
}) {
  const title = locale === "en" ? p.titleEn : p.titleFr;
  const meta: string[] = [];
  if (p.rooms != null) meta.push(`${p.rooms} ${t.listing.rooms}`);
  if (p.livingArea != null) meta.push(`${p.livingArea} m²`);
  if (p.bedrooms != null) meta.push(`${p.bedrooms} ${t.listing.bedrooms}`);

  const label = priceLabel(p, t.listing);

  return (
    <Link
      href={`/${locale}/bien/${p.reference}`}
      className="plate group block"
    >
      {/* Plate image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        {p.photos[0] && (
          <Image
            src={p.photos[0]}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="plate-img object-cover"
          />
        )}

        {/* plate number */}
        <span className="absolute top-4 left-4 font-mono text-[0.65rem] tracking-[0.2em] text-white/85 mix-blend-difference">
          {p.reference}
        </span>

        {p.offMarket && (
          <span className="absolute top-4 right-4 border border-white/70 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-white backdrop-blur-sm">
            {t.listing.offMarket}
          </span>
        )}
      </div>

      {/* Plate label */}
      <div className="pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[0.68rem] uppercase tracking-[0.2em]">
            <span className="text-bordeaux">{p.district ?? p.city}</span>
            <span className="text-mutedbrand"> · {p.canton}</span>
          </p>
          <span className="text-[0.72rem] text-ink tabular-nums whitespace-nowrap">
            {label}
          </span>
        </div>

        <h3 className="mt-2 font-display text-[1.15rem] leading-snug text-ink line-clamp-1">
          {title}
        </h3>

        {/* bordeaux rule draws on hover */}
        <span className="plate-rule mt-3 block h-px w-full bg-bordeaux" />

        <p className="mt-3 text-[0.82rem] font-light text-mutedbrand">
          {meta.join("  ·  ")}
        </p>
      </div>
    </Link>
  );
}
