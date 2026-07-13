import { ListingPage } from "@/components/ListingGrid";

export const dynamic = "force-dynamic";

export default async function BuyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ListingPage locale={locale} offerType="SALE" />;
}
