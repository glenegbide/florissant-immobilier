import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicWhere } from "@/lib/listings";
import { pageSlugs, type PageKey } from "@/lib/routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://florissantimmobilier.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: PageKey[] = [
    "buy",
    "rent",
    "sell",
    "estimate",
    "relocation",
    "properties",
    "about",
    "contact",
    "legal",
    "privacy",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ["fr", "en"] as const) {
    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
    for (const key of pages) {
      entries.push({
        url: `${siteUrl}/${locale}/${pageSlugs[key][locale]}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  let properties: { reference: string; updatedAt: Date }[] = [];
  try {
    properties = await prisma.property.findMany({
      where: publicWhere(),
      select: { reference: true, updatedAt: true },
    });
  } catch {
    // DB unavailable at build time — static routes are still emitted.
  }

  for (const locale of ["fr", "en"]) {
    for (const p of properties) {
      entries.push({
        url: `${siteUrl}/${locale}/bien/${p.reference}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
