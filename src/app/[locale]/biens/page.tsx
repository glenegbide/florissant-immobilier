import type { Metadata } from "next";
import { ListingPage, type ListingFilters } from "@/components/ListingGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === "en";
  return {
    title: en ? "Our properties" : "Nos biens",
    description: en
      ? "All our properties for sale and for rent across Geneva, Vaud and French-speaking Switzerland."
      : "Tous nos biens à vendre et à louer à Genève, dans le canton de Vaud et en Suisse romande.",
    alternates: {
      canonical: en ? "/en/properties" : "/fr/biens",
      languages: { fr: "/fr/biens", en: "/en/properties" },
    },
  };
}

export default async function PropertiesPage({
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
      filters={filters}
      basePath={`/${locale}/${locale === "en" ? "properties" : "biens"}`}
    />
  );
}
