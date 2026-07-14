import type { Metadata } from "next";
import { Libre_Bodoni, Geist } from "next/font/google";
import "./globals.css";

// Display face: Libre Bodoni (prestigious Didone), loaded into the
// existing --font-playfair variable used by the .font-display styles.
const playfair = Libre_Bodoni({
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://florissantimmobilier.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Florissant Immobilier International — L'immobilier suisse, avec une vision internationale",
    template: "%s · Florissant Immobilier",
  },
  description:
    "Agence immobilière suisse : vente, location, estimation et relocation à Genève, Nyon, Gland, Rolle, Lausanne et dans toute la Suisse romande.",
  keywords: [
    "immobilier Genève",
    "immobilier Vaud",
    "immobilier Nyon",
    "immobilier Lausanne",
    "agence immobilière Suisse romande",
    "vente appartement Genève",
    "location Genève",
    "estimation immobilière",
    "relocation Suisse",
    "real estate Geneva",
    "real estate Vaud",
  ],
  authors: [{ name: "Florissant Immobilier International" }],
  openGraph: {
    type: "website",
    siteName: "Florissant Immobilier International",
    title: "Florissant Immobilier International",
    description:
      "L'immobilier suisse, avec une vision internationale — vente, location, estimation et relocation en Suisse romande.",
    locale: "fr_CH",
    alternateLocale: "en_US",
    images: [{ url: "/photos/hero_roses.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Florissant Immobilier International",
    description: "L'immobilier suisse, avec une vision internationale.",
    images: ["/photos/hero_roses.jpg"],
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
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
