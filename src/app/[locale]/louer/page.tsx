import { ListingPage } from "@/components/ListingGrid";

export const dynamic = "force-dynamic";

export default async function RentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ListingPage locale={locale} offerType="RENT" />;
}
