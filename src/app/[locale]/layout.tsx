import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HtmlLang } from "@/components/HtmlLang";
import { getDict, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  return {
    title: isEn
      ? "Swiss real estate with an international perspective"
      : "L'immobilier suisse, avec une vision internationale",
    // No alternates here: canonical/hreflang are set per page so they
    // point at the actual page, not the locale root.
    openGraph: { locale: isEn ? "en_US" : "fr_CH" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://florissantimmobilier.ch";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Florissant Immobilier International",
    url: siteUrl,
    logo: `${siteUrl}/logo/icon.png`,
    image: `${siteUrl}/photos/hero_roses.jpg`,
    email: "glen@florissantimmobilier.ch",
    telephone: "+41 76 452 10 91",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Genève",
      addressCountry: "CH",
    },
    areaServed: [
      "Genève",
      "Nyon",
      "Gland",
      "Rolle",
      "Lausanne",
      "Canton de Vaud",
      "Suisse romande",
    ],
    knowsLanguage: ["fr", "en"],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HtmlLang locale={locale} />
      <Header locale={locale} t={t} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} t={t} />
    </div>
  );
}
