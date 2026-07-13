import { ListingPage, type ListingFilters } from "@/components/ListingGrid";

export const dynamic = "force-dynamic";

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
      basePath={`/${locale}/${locale === "en" ? "buy" : "acheter"}`}
    />
  );
}
