"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { headers } from "next/headers";
import { createCrmRecord, uploadCrmAttachment, type AirtableFields } from "@/lib/airtable";
import { dossierPayment, siteUrl } from "@/lib/site";
import { screen, type ScreeningResult } from "@/lib/screening";
import { readUploads, saveDossierFiles, type StoredFile } from "@/lib/dossier-files";
import { buildSignedPdf } from "@/lib/dossier-pdf";
import { createPaymentLink } from "@/lib/payrexx";

export type DossierState = {
  ok: boolean;
  error?: "generic" | "consent" | "rate" | "formula" | "signature" | "documents" | "missing";
  reference?: string;
  formula?: "A" | "B";
  firstName?: string;
  /** Inscription only: refused by the 3× income / debts / welfare check. */
  blocked?: ScreeningResult["reasons"];
  /** Inscription only: TWINT / card payment page (Payrexx), when configured. */
  payLink?: string | null;
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

const REASON_LABEL = {
  debts: "poursuites déclarées",
  welfare: "aide sociale (Hospice) déclarée",
  income: "revenus inférieurs à 3× le loyer maximum",
} as const;

// Documents asked on the inscription page → Airtable attachment field.
const DOC_FIELDS = [
  { input: "docId", airtable: "Pièces d'identité", required: true },
  { input: "docDebts", airtable: "Attestation de non-poursuite", required: true },
  { input: "docIncome", airtable: "Fiches de salaire", required: true },
] as const;

const isPng = (v: string) => v.startsWith("data:image/png;base64,") && v.length > 200 && v.length < 1_500_000;

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

  const inscription = str("mode") === "inscription";

  if (formData.get("consent") !== "on" || formData.get("mandate") !== "on") {
    return { ok: false, error: "consent" };
  }

  // The inscription page always uses formula A (CHF 360 + one month's rent).
  const formula = inscription ? "A" : str("formula");
  if (formula !== "A" && formula !== "B") return { ok: false, error: "formula" };

  const firstName = str("firstName", 80);
  const lastName = str("lastName", 80);
  const email = str("email", 160);
  const phone = str("phone", 40);
  if (!firstName || !lastName || !isEmail(email) || phone.length < 6) {
    return { ok: false, error: "generic" };
  }

  const hasSecond = formData.get("hasSecond") === "on" && str("c2LastName") !== "";
  const c2Role = str("c2Role") === "guarantor" ? "guarantor" : "co";

  // ── Inscription: required answers, signature(s) and documents ──
  const sig1 = str("signature1", 1_500_000);
  const sig2 = str("signature2", 1_500_000);
  let docs: StoredFile[] = [];
  if (inscription) {
    if (num("maxRent") === undefined || num("income") === undefined || !str("debts") || !str("welfare")) {
      return { ok: false, error: "missing" };
    }
    if (hasSecond && (!str("c2Debts") || !str("c2Welfare"))) return { ok: false, error: "missing" };
    if (!isPng(sig1) || (hasSecond && !isPng(sig2))) return { ok: false, error: "signature" };
    for (const d of DOC_FIELDS) {
      const files = await readUploads(formData, d.input);
      if (d.required && files.length === 0) return { ok: false, error: "documents" };
      docs = docs.concat(files);
    }
  }

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return { ok: false, error: "rate" };

  const locale = str("locale") === "en" ? "en" : "fr";
  const reference = makeReference();

  const check = screen({
    maxRent: num("maxRent"),
    income: num("income"),
    debts: str("debts") === "yes",
    welfare: str("welfare") === "yes",
    second: hasSecond
      ? { role: c2Role, income: num("c2Income"), debts: str("c2Debts") === "yes", welfare: str("c2Welfare") === "yes" }
      : null,
  });
  const blocked = inscription && !check.ok;
  const checkText = check.ok
    ? `Conforme — revenus ${check.ratio ?? "?"}× le loyer maximum`
    : `Bloqué — ${check.reasons.map((r) => REASON_LABEL[r]).join(", ")}` +
      (check.ratio !== null ? ` (revenus ${check.ratio}× le loyer)` : "");

  // ── Airtable fields (names must match the "Clients" table) ──
  const fields: AirtableFields = {
    Client: `${lastName} ${firstName}`,
    Statut: "Nouveau",
    "Date de soumission": new Date().toISOString(),
    Langue: locale.toUpperCase(),
    Formule: FORMULA_LABEL[formula],
    "Mandat accepté": true,
    Paiement: formula === "A" && !blocked ? "En attente" : "Non requis",
    "Montant dû": formula === "A" && !blocked ? dossierPayment.amount : 0,
    "Prénom": firstName,
    Nom: lastName,
    "Téléphone": phone,
    "E-mail": email,
    "Référence": reference,
    Source: inscription ? "Inscription relocation (site)" : "Formulaire site",
    "Contrôle dossier": check.ok ? "Conforme" : "Bloqué",
    "Motif du contrôle": checkText,
  };
  const put = (name: string, value: string | number | undefined) => {
    if (value !== undefined && value !== "") fields[name] = value;
  };
  put("Revenu / loyer max", check.ratio ?? undefined);
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
  if (str("welfare")) put("Aide sociale (Hospice)", str("welfare") === "yes" ? "Oui" : "Non");
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
    put("C2 Rôle", c2Role === "guarantor" ? "Garant" : "Conjoint·e / co-titulaire");
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
    if (str("c2Welfare")) put("C2 Aide sociale (Hospice)", str("c2Welfare") === "yes" ? "Oui" : "Non");
  }

  // ── Signed PDF + documents, stored privately on the server ──
  let pdfBytes: Uint8Array | null = null;
  let savedFiles: string[] = [];
  if (inscription) {
    const c2Label = hasSecond ? (c2Role === "guarantor" ? "Garant" : "Co-titulaire") : null;
    const yn = (k: string) => (str(k) === "yes" ? "Oui" : str(k) === "no" ? "Non" : "");
    const money = (k: string) => (num(k) !== undefined ? `CHF ${num(k)}` : "");
    try {
      pdfBytes = await buildSignedPdf({
        reference,
        date: new Date(),
        place: str("place", 80) || "Genève",
        c2Label,
        search: [
          ["Pièces", str("rooms")],
          ["Loyer maximum c.c.", money("maxRent")],
          ["Secteurs souhaités", str("areas")],
          ["Secteurs exclus", str("excludedAreas")],
          ["Entrée souhaitée", date("moveIn") ?? ""],
          ["Critères", str("criteria")],
          ["Ménage", `${num("adults") ?? "-"} adulte(s), ${num("children") ?? 0} enfant(s), animaux : ${str("pets") || "-"}`],
        ],
        rows: [
          ["Nom, prénom", `${lastName} ${firstName}`, `${str("c2LastName")} ${str("c2FirstName")}`],
          ["Date de naissance", date("birthDate") ?? "", date("c2BirthDate") ?? ""],
          ["Nationalité", str("nationality"), str("c2Nationality")],
          ["Permis", str("permit"), str("c2Permit")],
          ["Téléphone", phone, str("c2Phone")],
          ["E-mail", email, str("c2Email")],
          ["Adresse actuelle", `${str("address")} ${str("city")}`, ""],
          ["Régie actuelle / loyer", `${str("landlord")} ${money("currentRent")}`, ""],
          ["Statut / profession", `${str("workStatus")} ${str("profession")}`, str("c2Profession")],
          ["Employeur", str("employer"), str("c2Employer")],
          ["Revenu mensuel net", money("income"), money("c2Income")],
          ["Poursuites", yn("debts"), yn("c2Debts")],
          ["Aide sociale (Hospice)", yn("welfare"), yn("c2Welfare")],
        ],
        check: checkText,
        terms: [
          "Mandat de recherche de 3 mois, canton de Genève et 10 km, Nyon inclus.",
          "Frais d'ouverture de dossier CHF 360.– TVA comprise, acquis au mandataire et non déduits de la commission.",
          "Commission : un mois de loyer charges comprises (hors TVA), due à la signature d'un bail pour un bien présenté par Florissant Immobilier International.",
          "Le mandant informe le mandataire de toute candidature déposée ailleurs et, immédiatement, de tout retrait d'une candidature déposée ; à défaut, un mois de loyer charges comprises est dû.",
          "Le mandant certifie l'exactitude des renseignements et autorise leur transmission aux régies et bailleurs concernés. Conditions complètes : florissantimmobilier.ch/documents/mandat-de-recherche.pdf",
        ],
        signature1: sig1,
        signature2: hasSecond ? sig2 : null,
      });
    } catch (e) {
      console.error("[dossier] pdf failed", e);
    }
    try {
      const all = pdfBytes
        ? [...docs, { field: "mandat-signe", name: `${reference}.pdf`, type: "application/pdf", bytes: pdfBytes }]
        : docs;
      savedFiles = await saveDossierFiles(reference, all);
    } catch (e) {
      console.error("[dossier] file save failed", e);
    }
  }

  const recordId = await createCrmRecord(fields);
  const crmOk = recordId !== null;

  // Attach documents in Airtable after the response (uploads can take a few seconds).
  if (recordId && inscription) {
    after(async () => {
      if (pdfBytes) {
        await uploadCrmAttachment(recordId, "Mandat et fiche signés (PDF)", {
          name: `Inscription-${reference}.pdf`,
          type: "application/pdf",
          bytes: pdfBytes,
        });
      }
      for (const f of docs) {
        const target = DOC_FIELDS.find((d) => d.input === f.field)?.airtable;
        if (target) await uploadCrmAttachment(recordId, target, f);
      }
    });
  }

  // ── Backup copy in the admin inbox (always, even if Airtable is down) ──
  const summary = Object.entries(fields)
    .filter(([k]) => !["Client", "Statut", "Source"].includes(k))
    .map(([k, v]) => `${k} : ${v === true ? "oui" : v}`)
    .join("\n");
  const fileNote = savedFiles.length
    ? `\n\nDocuments (${savedFiles.length}) : /admin/dossiers/${reference}`
    : "";
  let dbOk = true;
  try {
    await prisma.message.create({
      data: {
        type: inscription ? "inscription" : "dossier",
        name: `${firstName} ${lastName}`,
        email,
        phone,
        reference,
        subject: `${inscription ? "Inscription relocation" : "Dossier locataire"} ${reference} — ${
          inscription ? (blocked ? "❌ BLOQUÉ" : "✅ conforme") : `Formule ${formula}`
        }${crmOk ? "" : " — ⚠ non transmis à Airtable"}`,
        body: summary + fileNote,
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

  if (blocked) return { ok: true, reference, formula, firstName, blocked: check.reasons };

  let payLink: string | null = null;
  if (inscription) {
    const base = `${siteUrl}/${locale}/inscription`;
    payLink = await createPaymentLink({
      reference,
      amountChf: dossierPayment.amount,
      purpose: `Florissant Immobilier — ouverture de dossier ${reference}`,
      email,
      firstName,
      lastName,
      successUrl: `${base}?paiement=ok&ref=${reference}`,
      failedUrl: `${base}?paiement=annule&ref=${reference}`,
    });
  }

  return { ok: true, reference, formula, firstName, payLink };
}
