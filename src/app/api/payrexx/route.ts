// Payrexx webhook: called by Payrexx when a payment changes status.
// Set it in Payrexx → Webhooks: https://florissantimmobilier.ch/api/payrexx
// The body is never trusted: the payment status is re-read from the Payrexx API.
import { gatewayPaid } from "@/lib/payrexx";
import { updateCrmByReference } from "@/lib/airtable";

export const dynamic = "force-dynamic";

function pick(obj: unknown, ...keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

export async function POST(req: Request) {
  let body: unknown = null;
  const type = req.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) {
      body = await req.json();
    } else {
      // Form-encoded: transaction[invoice][paymentRequestId]=…
      const form = await req.formData();
      const flat: Record<string, string> = {};
      form.forEach((v, k) => (flat[k] = String(v)));
      body = {
        transaction: {
          id: flat["transaction[id]"],
          invoice: { paymentRequestId: flat["transaction[invoice][paymentRequestId]"] },
        },
      };
    }
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const gatewayId = String(pick(body, "transaction", "invoice", "paymentRequestId") ?? "");
  const transactionId = String(pick(body, "transaction", "id") ?? "");
  if (!gatewayId) return new Response("ignored", { status: 200 });

  const { paid, reference } = await gatewayPaid(gatewayId);
  if (paid && reference) {
    await updateCrmByReference(reference, {
      Paiement: "Payé",
      "Mode de paiement": "TWINT",
      "Paiement en ligne": "TWINT / carte",
      "Date de paiement": new Date().toISOString().slice(0, 10),
      "Référence transaction": transactionId || gatewayId,
      Statut: "Recherche en cours",
    });
  }
  return new Response("ok", { status: 200 });
}
