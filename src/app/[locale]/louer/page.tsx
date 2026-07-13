import type { Metadata } from "next";
import { ListingPage, type ListingFilters } from "@/components/ListingGrid";
import { localePath, pageAlternates } from "@/lib/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Properties for rent" : "Biens à louer",
    description: en
      ? "Apartments and houses for rent in Geneva, Vaud and French-speaking Switzerland."
      : "Appartements et maisons à louer à Genève, dans le canton de Vaud et en Suisse romande.",
    alternates: pageAlternates(locale, "rent"),
  };
}

export default async function RentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ListingFilters>;
}) {
  const { locale } = await params;
  const filters = await searchParams;
  return (
    <ListingPage
      locale={locale}
      offerType="RENT"
      filters={filters}
      basePath={localePath(locale, "rent")}
    />
  );
}
