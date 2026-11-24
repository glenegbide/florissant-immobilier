"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createCrmRecord, type AirtableFields } from "@/lib/airtable";
import { dossierPayment } from "@/lib/site";

export type DossierState = {
  ok: boolean;
  error?: "generic" | "consent" | "rate" | "formula";
  reference?: string;
  formula?: "A" | "B";
  firstName?: string;
};

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Max 5 submissions per IP per 10 minutes (in memory, like the contact form).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

function makeReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return "FL-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const FORMULA_LABEL = {
  A: "A — CHF 360 + 1 mois de loyer",
  B: "B — 12 % du loyer annuel",
} as const;

export async function submitDossier(
  _prev: DossierState,
  formData: FormData
): Promise<DossierState> {
  const str = (k: string, max = 300) =>
    String(formData.get(k) || "").trim().slice(0, max);
  const num = (k: string): number | undefined => {
    const raw = str(k).replace(/['’\s]/g, "").replace(",", ".");
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
  };
  const date = (k: string): string | undefined => {
    const v = str(k);
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
  };

  // Honeypot: bots fill this hidden field; humans never see it.
  if (str("company") !== "") return { ok: true, reference: "FL-00000", formula: "B" };

  if (formData.get("consent") !== "on" || formData.get("mandate") !== "on") {
    return { ok: false, error: "consent" };
  }

  const formula = str("formula");
  if (formula !== "A" && formula !== "B") return { ok: false, error: "formula" };

  const firstName = str("firstName", 80);
  const lastName = str("lastName", 80);
  const email = str("email", 160);
  const phone = str("phone", 40);
  if (!firstName || !lastName || !isEmail(email) || phone.length < 6) {
    return { ok: false, error: "generic" };
  }

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return { ok: false, error: "rate" };

  const locale = str("locale") === "en" ? "en" : "fr";
  const reference = makeReference();
  const hasSecond = formData.get("hasSecond") === "on" && str("c2LastName") !== "";

  // ── Airtable fields (names must match the "Clients" table) ──
  const fields: AirtableFields = {
    Client: `${lastName} ${firstName}`,
    Statut: "Nouveau",
    "Date de soumission": new Date().toISOString(),
    Langue: locale.toUpperCase(),
    Formule: FORMULA_LABEL[formula],
    "Mandat accepté": true,
    Paiement: formula === "A" ? "En attente" : "Non requis",
    "Montant dû": formula === "A" ? dossierPayment.amount : 0,
    "Prénom": firstName,
    Nom: lastName,
    "Téléphone": phone,
    "E-mail": email,
    "Référence": reference,
    Source: "Formulaire site",
  };
  const put = (name: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "") fields[name] = value;
  };
  put("Date de naissance", date("birthDate"));
  put("Nationalité", str("nationality"));
  put("État civil", str("civilStatus"));
  put("Permis de séjour", str("permit"));
  put("Échéance du permis", date("permitExpiry"));
  put("Adresse actuelle", str("address"));
  put("NPA / Localité", str("city"));
  put("Régie ou bailleur actuel", str("landlord"));
  put("Loyer actuel", num("currentRent"));
  put("Dans le logement depuis", str("since"));
  put("Motif du changement", str("reason"));
  put("Statut professionnel", str("workStatus"));
  put("Profession", str("profession"));
  put("Employeur", str("employer"));
  put("Adresse de l'employeur", str("employerAddress"));
  put("En poste depuis", str("employedSince"));
  put("Revenu mensuel net", num("income"));
  put("Autres revenus", num("otherIncome"));
  put("Poursuites", str("debts") === "yes" ? "Oui" : "Non");
  put("Nombre de pièces", str("rooms"));
  put("Loyer maximum", num("maxRent"));
  put("Secteurs souhaités", str("areas", 1000));
  put("Secteurs exclus", str("excludedAreas", 1000));
  put("Date d'entrée souhaitée", date("moveIn"));
  put("Critères spécifiques", str("criteria", 2000));
  put("Adultes", num("adults"));
  put("Enfants", num("children"));
  put("Animaux", str("pets"));
  put("Véhicules", num("vehicles"));
  if (hasSecond) {
    put("C2 Rôle", str("c2Role") === "guarantor" ? "Garant" : "Conjoint·e / co-titulaire");
    put("C2 Prénom", str("c2FirstName", 80));
    put("C2 Nom", str("c2LastName", 80));
    put("C2 Téléphone", str("c2Phone", 40));
    put("C2 E-mail", isEmail(str("c2Email")) ? str("c2Email") : "");
    put("C2 Date de naissance", date("c2BirthDate"));
    put("C2 Nationalité", str("c2Nationality"));
    put("C2 Permis de séjour", str("c2Permit"));
    put("C2 Profession", str("c2Profession"));
    put("C2 Employeur", str("c2Employer"));
    put("C2 Revenu mensuel net", num("c2Income"));
    put("C2 Poursuites", str("c2Debts") === "yes" ? "Oui" : "Non");
  }

  const crmOk = await createCrmRecord(fields);

  // ── Backup copy in the admin inbox (always, even if Airtable is down) ──
  const summary = Object.entries(fields)
    .filter(([k]) => !["Client", "Statut", "Source"].includes(k))
    .map(([k, v]) => `${k} : ${v === true ? "oui" : v}`)
    .join("\n");
  let dbOk = true;
  try {
    await prisma.message.create({
      data: {
        type: "dossier",
        name: `${firstName} ${lastName}`,
        email,
        phone,
        subject: `Dossier locataire ${reference} — Formule ${formula}${
          crmOk ? "" : " — ⚠ non transmis à Airtable"
        }`,
        body: summary,
        preferredContact: "whatsapp",
        locale,
      },
    });
    revalidatePath("/admin/messages");
    revalidatePath("/admin", "layout");
  } catch (e) {
    console.error("[dossier] backup save failed", e);
    dbOk = false;
  }

  // The submission must be stored somewhere, otherwise ask the client to retry.
  if (!crmOk && !dbOk) return { ok: false, error: "generic" };

  return { ok: true, reference, formula, firstName };
}
