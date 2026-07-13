import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Placeholder providers — visible but disabled until credentials and
// specifications are provided. API keys live in env vars, never in the DB.
const PLACEHOLDERS = [
  {
    provider: "portal-xml",
    label: "Portail immobilier (flux XML)",
    envKeyName: "PORTAL_XML_API_KEY",
  },
  {
    provider: "crm",
    label: "CRM (contacts & leads)",
    envKeyName: "CRM_API_KEY",
  },
  {
    provider: "webhook",
    label: "Webhook sortant (nouvelles demandes)",
    envKeyName: "WEBHOOK_SECRET",
  },
  {
    provider: "csv-import",
    label: "Import CSV de biens",
    envKeyName: null,
  },
];

const STATUS_LABELS: Record<string, string> = {
  not_configured: "Non configuré",
  ok: "Connecté",
  error: "Erreur",
};

export default async function IntegrationsPage() {
  for (const ph of PLACEHOLDERS) {
    await prisma.integration.upsert({
      where: { provider: ph.provider },
      update: {},
      create: ph,
    });
  }
  const integrations = await prisma.integration.findMany({
    orderBy: { createdAt: "asc" },
    include: { logs: { orderBy: { createdAt: "desc" }, take: 3 } },
  });

  return (
    <>
      <h1 className="font-display text-3xl text-bordeaux">Intégrations</h1>
      <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-mutedbrand">
        Connexions aux portails immobiliers, CRM et flux externes. Chaque intégration reste
        désactivée tant que ses identifiants (variables d&apos;environnement sur le serveur) et ses
        spécifications n&apos;ont pas été fournis. Aucune clé API n&apos;est stockée en base de données.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {integrations.map((it) => (
          <div key={it.id} className="border border-line bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl text-ink">{it.label}</h2>
              <span
                className={`shrink-0 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider ${
                  it.status === "ok"
                    ? "bg-emerald-50 text-emerald-700"
                    : it.status === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-ivory-alt text-mutedbrand"
                }`}
              >
                {STATUS_LABELS[it.status] ?? it.status}
              </span>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm font-light text-mutedbrand">
              <div className="flex justify-between gap-4">
                <dt>Import</dt>
                <dd>{it.importEnabled ? "Activé" : "Désactivé"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Export</dt>
                <dd>{it.exportEnabled ? "Activé" : "Désactivé"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Dernière synchronisation</dt>
                <dd>{it.lastSyncAt ? it.lastSyncAt.toLocaleString("fr-CH") : "—"}</dd>
              </div>
              {it.envKeyName && (
                <div className="flex justify-between gap-4">
                  <dt>Clé API attendue</dt>
                  <dd className="font-mono text-xs">{it.envKeyName}</dd>
                </div>
              )}
            </dl>
            <button
              disabled
              title="Disponible une fois l'intégration configurée"
              className="mt-5 cursor-not-allowed border border-line px-4 py-2 text-[0.72rem] uppercase tracking-[0.15em] text-mutedbrand opacity-60"
            >
              Synchroniser
            </button>
            {it.logs.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs font-light text-mutedbrand">
                {it.logs.map((l) => (
                  <li key={l.id}>
                    {l.createdAt.toLocaleString("fr-CH")} · {l.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
