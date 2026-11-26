// Payrexx (Swiss payment provider: TWINT, cards, PostFinance).
// Configured with PAYREXX_INSTANCE (the "xxx" in xxx.payrexx.com) and PAYREXX_SECRET
// (Payrexx admin → API). Without them, the site only offers bank transfer.
import { createHmac } from "node:crypto";

const API = "https://api.payrexx.com/v1.0";

export function payrexxConfigured(): boolean {
  return Boolean(process.env.PAYREXX_INSTANCE && process.env.PAYREXX_SECRET);
}

function sign(query: string): string {
  return createHmac("sha256", process.env.PAYREXX_SECRET || "").update(query).digest("base64");
}

async function call(method: "GET" | "POST", resource: string, params: Record<string, string> = {}) {
  const instance = process.env.PAYREXX_INSTANCE || "";
  const body = new URLSearchParams(params).toString();
  const signed = new URLSearchParams(params);
  signed.set("ApiSignature", sign(body));
  const url = `${API}/${resource}/?instance=${encodeURIComponent(instance)}`;
  const res = await fetch(method === "GET" ? `${url}&ApiSignature=${encodeURIComponent(sign(""))}` : url, {
    method,
    headers: {
      "X-API-KEY": process.env.PAYREXX_SECRET || "",
      ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? signed.toString() : undefined,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as
    | { status?: string; data?: Record<string, unknown>[]; message?: string }
    | null;
  if (!res.ok || json?.status !== "success") {
    console.error("[payrexx]", resource, res.status, json?.message);
    return null;
  }
  return json.data ?? [];
}

/** Creates a payment page and returns its link, or null. */
export async function createPaymentLink(opts: {
  reference: string;
  amountChf: number;
  purpose: string;
  email: string;
  firstName: string;
  lastName: string;
  successUrl: string;
  failedUrl: string;
}): Promise<string | null> {
  if (!payrexxConfigured()) return null;
  try {
    const data = await call("POST", "Gateway", {
      amount: String(Math.round(opts.amountChf * 100)),
      currency: "CHF",
      purpose: opts.purpose,
      referenceId: opts.reference,
      successRedirectUrl: opts.successUrl,
      failedRedirectUrl: opts.failedUrl,
      cancelRedirectUrl: opts.failedUrl,
      "fields[email][value]": opts.email,
      "fields[forename][value]": opts.firstName,
      "fields[surname][value]": opts.lastName,
    });
    const link = data?.[0]?.link;
    return typeof link === "string" && link.startsWith("https://") ? link : null;
  } catch (e) {
    console.error("[payrexx] gateway error", e);
    return null;
  }
}

/** Asks Payrexx (never trusts the webhook body) whether a payment page was paid. */
export async function gatewayPaid(gatewayId: string): Promise<{ paid: boolean; reference?: string }> {
  if (!payrexxConfigured() || !/^\d+$/.test(gatewayId)) return { paid: false };
  try {
    const data = await call("GET", `Gateway/${gatewayId}`);
    const g = data?.[0] as { status?: string; referenceId?: string } | undefined;
    return { paid: g?.status === "confirmed", reference: g?.referenceId };
  } catch (e) {
    console.error("[payrexx] check error", e);
    return { paid: false };
  }
}
