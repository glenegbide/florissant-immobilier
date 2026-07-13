"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type ContactState = { ok: boolean; error?: "generic" | "consent" | "rate" };

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Simple in-memory rate limit: max 5 messages per IP per 10 minutes.
// Resets on server restart, which is fine for a contact form.
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
  // Opportunistic cleanup so the map cannot grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

const TYPES = ["contact", "valuation", "relocation", "property", "owner"];
const PREFERRED = ["email", "phone", "whatsapp"];

export async function sendMessage(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const body = String(formData.get("body") || "").trim();

  // Honeypot: bots fill this hidden field; humans never see it.
  if (String(formData.get("company") || "").trim() !== "") {
    return { ok: true };
  }

  if (formData.get("consent") !== "on") {
    return { ok: false, error: "consent" };
  }

  if (!name || !isEmail(email) || body.length < 2) {
    return { ok: false, error: "generic" };
  }

  const h = await headers();
  const ip =
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return { ok: false, error: "rate" };
  }

  const rawType = String(formData.get("type") || "contact");
  const rawPreferred = String(formData.get("preferredContact") || "");
  const reference = String(formData.get("reference") || "").trim() || null;

  try {
    await prisma.message.create({
      data: {
        type: TYPES.includes(rawType) ? (reference ? "property" : rawType) : "contact",
        name,
        email,
        phone: String(formData.get("phone") || "").trim() || null,
        subject: String(formData.get("subject") || "").trim() || null,
        body,
        reference,
        preferredContact: PREFERRED.includes(rawPreferred) ? rawPreferred : null,
        locale: String(formData.get("locale") || "fr"),
      },
    });
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch {
    return { ok: false, error: "generic" };
  }
}
