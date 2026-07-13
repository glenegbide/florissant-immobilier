import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { chf } from "@/lib/format";
import { cantons } from "@/lib/admin-options";
import { duplicateProperty, archiveProperty } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  active: "En ligne",
  draft: "Brouillon",
  hidden: "Masqué",
  archived: "Archivé",
};

const TX_LABELS: Record<string, string> = {
  reserved: "Réservé",
  rented: "Loué",
  sold: "Vendu",
};

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; offer?: string; canton?: string }>;
}) {
  const { q = "", status = "", offer = "", canton = "" } = await searchParams;

  const properties = await prisma.property.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { reference: { contains: q, mode: "insensitive" } },
              { titleFr: { contains: q, mode: "insensitive" } },
              { titleEn: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { district: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(offer === "RENT" || offer === "SALE" ? { offerType: offer as "RENT" | "SALE" } : {}),
      ...(canton ? { canton } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const selectCls =
    "border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-bordeaux";

  return (
    <>
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-bordeaux">Biens immobiliers</h1>
          <p className="mt-1 text-sm font-light text-mutedbrand">
            {properties.length} bien{properties.length > 1 ? "s" : ""}
            {q || status || offer || canton ? " (filtrés)" : ""}
          </p>
        </div>
        <Link
          href="/admin/nouveau"
          className="bg-bordeaux px-6 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-white hover:bg-bordeaux-soft transition-colors"
        >
          + Nouveau bien
        </Link>
      </div>

      {/* ── Search & filters ── */}
      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher : référence, titre, ville…"
          className="min-w-[240px] flex-1 border border-line bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-bordeaux"
        />
        <select name="status" defaultValue={status} className={selectCls}>
          <option value="">Tous statuts</option>
          <option value="active">En ligne</option>
          <option value="draft">Brouillon</option>
          <option value="hidden">Masqué</option>
          <option value="archived">Archivé</option>
        </select>
        <select name="offer" defaultValue={offer} className={selectCls}>
          <option value="">Vente & location</option>
          <option value="SALE">Vente</option>
          <option value="RENT">Location</option>
        </select>
        <select name="canton" defaultValue={canton} className={selectCls}>
          <option value="">Tous cantons</option>
          {cantons.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-line px-4 py-2 text-sm text-ink hover:border-bordeaux hover:text-bordeaux transition-colors"
        >
          Filtrer
        </button>
        {(q || status || offer || canton) && (
          <Link href="/admin" className="text-sm text-mutedbrand hover:text-bordeaux">
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto bg-white border border-line">
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
            {properties.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center font-light text-mutedbrand">
                  Aucun bien ne correspond à ces critères.
                </td>
              </tr>
            )}
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
                      p.status === "active" ? "text-emerald-700 text-xs" : "text-mutedbrand text-xs"
                    }
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                    {TX_LABELS[p.transactionStatus] ? ` · ${TX_LABELS[p.transactionStatus]}` : ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-3 text-xs">
                    <Link href={`/admin/${p.id}`} className="text-bordeaux hover:underline">
                      Modifier
                    </Link>
                    <Link
                      href={`/fr/bien/${p.reference}`}
                      target="_blank"
                      className="text-mutedbrand hover:text-bordeaux"
                    >
                      Voir
                    </Link>
                    <form action={duplicateProperty}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-mutedbrand hover:text-bordeaux">
                        Dupliquer
                      </button>
                    </form>
                    {p.status !== "archived" && (
                      <form action={archiveProperty}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-mutedbrand hover:text-bordeaux">
                          Archiver
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
