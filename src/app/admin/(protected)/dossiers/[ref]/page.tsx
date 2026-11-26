import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listDossierFiles } from "@/lib/dossier-files";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  "mandat-signe": "Mandat et fiche signés",
  docId: "Pièce d'identité",
  docDebts: "Attestation de non-poursuite",
  docIncome: "Fiche de salaire / revenus",
};

export default async function DossierFilesPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  if (!/^FL-[A-Z0-9]{5}$/.test(ref)) notFound();
  const [files, message] = await Promise.all([
    listDossierFiles(ref),
    prisma.message.findFirst({ where: { reference: ref }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <Link href="/admin/messages" className="text-xs uppercase tracking-[0.15em] text-mutedbrand hover:text-bordeaux">
        ← Messages
      </Link>
      <h1 className="mt-4 font-display text-3xl text-bordeaux">Dossier {ref}</h1>
      {message && (
        <p className="mt-1 text-sm font-light text-mutedbrand">
          {message.name} · {message.phone} · {message.email}
        </p>
      )}
      {message?.subject && <p className="mt-4 font-medium text-ink">{message.subject}</p>}

      <h2 className="mt-10 font-display text-xl text-ink">Documents</h2>
      {files.length === 0 ? (
        <p className="mt-4 font-light text-mutedbrand">Aucun document pour ce dossier.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border border-line bg-white">
          {files.map((f) => {
            const kind = f.name.split("-")[0] === "mandat" ? "mandat-signe" : f.name.split("-")[0];
            return (
              <li key={f.name} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{LABELS[kind] ?? "Document"}</p>
                  <p className="text-xs text-mutedbrand">
                    {f.name} · {(f.size / 1024 / 1024).toFixed(1)} Mo
                  </p>
                </div>
                <a
                  href={`/admin/dossier-file/${ref}/${encodeURIComponent(f.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-bordeaux px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-bordeaux hover:bg-bordeaux hover:text-white"
                >
                  Ouvrir
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {message && (
        <>
          <h2 className="mt-10 font-display text-xl text-ink">Informations</h2>
          <p className="mt-4 whitespace-pre-line border border-line bg-white p-5 text-sm font-light leading-relaxed text-ink/85">
            {message.body}
          </p>
        </>
      )}
    </>
  );
}
