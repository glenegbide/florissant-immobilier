import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://florissant-immobilier.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Florissant Immobilier · International — L'immobilier d'exception à Genève",
    template: "%s · Florissant Immobilier",
  },
  description:
    "Agence immobilière de prestige à Genève. Vente, location, gestion et estimation de biens d'exception en Suisse romande et à l'international.",
  keywords: [
    "immobilier Genève",
    "agence immobilière Genève",
    "immobilier de prestige",
    "vente appartement Genève",
    "location Genève",
    "estimation immobilière",
    "luxury real estate Geneva",
  ],
  authors: [{ name: "Florissant Immobilier" }],
  openGraph: {
    type: "website",
    siteName: "Florissant Immobilier · International",
    title: "Florissant Immobilier · International",
    description:
      "L'immobilier d'exception à Genève — vente, location et gestion de biens de prestige.",
    locale: "fr_CH",
    alternateLocale: "en_US",
    images: [{ url: "/photos/hero_roses.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Florissant Immobilier · International",
    description: "L'immobilier d'exception à Genève.",
    images: ["/photos/hero_roses.jpg"],
  },
  alternates: {
    canonical: "/fr",
    languages: { fr: "/fr", en: "/en" },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
