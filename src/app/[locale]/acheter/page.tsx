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
    title: en ? "Properties for sale" : "Biens à vendre",
    description: en
      ? "Apartments, houses and exceptional properties for sale in Geneva, Vaud and French-speaking Switzerland."
      : "Appartements, maisons et biens d'exception à vendre à Genève, dans le canton de Vaud et en Suisse romande.",
    alternates: pageAlternates(locale, "buy"),
  };
}

export default async function BuyPage({
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
      offerType="SALE"
      filters={filters}
      basePath={localePath(locale, "buy")}
    />
  );
}
