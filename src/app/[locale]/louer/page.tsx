import { ListingPage, type ListingFilters } from "@/components/ListingGrid";

export const dynamic = "force-dynamic";

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
      basePath={`/${locale}/${locale === "en" ? "rent" : "louer"}`}
    />
  );
}
