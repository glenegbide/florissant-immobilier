import { ListingPage } from "@/components/ListingGrid";

export default async function RentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ListingPage locale={locale} offerType="RENT" />;
}
