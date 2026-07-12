import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { chf } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-bordeaux">Biens immobiliers</h1>
          <p className="mt-1 text-sm font-light text-mutedbrand">
            {properties.length} bien{properties.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/nouveau"
          className="bg-bordeaux px-6 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-white hover:bg-bordeaux-soft transition-colors"
        >
          + Nouveau bien
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto bg-white border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] uppercase tracking-[0.15em] text-mutedbrand">
              <th className="px-4 py-3 font-medium">Photo</th>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Offre</th>
              <th className="px-4 py-3 font-medium">Lieu</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-ivory/60">
                <td className="px-4 py-3">
                  <div className="relative h-12 w-16 overflow-hidden bg-ivory-alt">
                    {p.photos[0] && (
                      <Image src={p.photos[0]} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-mutedbrand">{p.reference}</td>
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="truncate text-ink">{p.titleFr}</p>
                  {p.featured && (
                    <span className="text-[0.65rem] uppercase tracking-wider text-gold">Sélection</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.offerType === "SALE"
                        ? "inline-block bg-bordeaux/10 text-bordeaux px-2 py-0.5 text-xs"
                        : "inline-block bg-gold/15 text-[#8a6d33] px-2 py-0.5 text-xs"
                    }
                  >
                    {p.offerType === "SALE" ? "Vente" : "Location"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink">
                  {p.city}
                  {p.district ? ` · ${p.district}` : ""}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink">
                  {p.priceOnRequest || p.price == null
                    ? "Sur demande"
                    : `${chf(p.price)}${p.offerType === "RENT" ? ".–/mois" : ""}`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.status === "active"
                        ? "text-emerald-700 text-xs"
                        : "text-mutedbrand text-xs"
                    }
                  >
                    {p.status === "active" ? "En ligne" : p.status === "draft" ? "Brouillon" : "Archivé"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/${p.id}`} className="text-bordeaux hover:underline">
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
