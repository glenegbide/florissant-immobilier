export function chf(amount: number): string {
  // Swiss format: CHF 1'950'000
  return "CHF " + amount.toLocaleString("de-CH").replace(/’/g, "'");
}

export function priceLabel(
  p: {
    price: number | null;
    priceOnRequest: boolean;
    offerType: "RENT" | "SALE";
    priceUnit: string;
  },
  t: { priceOnRequest: string; perMonth: string; perWeek: string; perDay: string }
): string {
  if (p.priceOnRequest || p.price == null) return t.priceOnRequest;
  const base = chf(p.price);
  if (p.offerType === "SALE") return base;
  const unit =
    p.priceUnit === "week" ? t.perWeek : p.priceUnit === "day" ? t.perDay : t.perMonth;
  return `${base}.–${unit}`;
}
