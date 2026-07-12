import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://florissant-immobilier.ch";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/acheter",
    "/louer",
    "/vendre",
    "/estimer",
    "/prestige",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ["fr", "en"]) {
    for (const path of staticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  let properties: { reference: string; updatedAt: Date }[] = [];
  try {
    properties = await prisma.property.findMany({
      where: { status: "active" },
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
