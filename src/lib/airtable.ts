// Minimal Airtable client for the CRM base ("Florissant CRM" → table "Clients").
// The access token lives in the AIRTABLE_TOKEN environment variable, never in code.
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appYhduckxKToARmG";
const TABLE = process.env.AIRTABLE_TABLE || "Clients";

export type AirtableFields = Record<string, string | number | boolean>;

export function airtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_TOKEN);
}

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

/** Creates one record. Returns its id on success, null otherwise; never throws. */
export async function createCrmRecord(fields: AirtableFields): Promise<string | null> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: "POST",
        headers: headers(token),
        // typecast lets Airtable match select options by name.
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error("[airtable] create failed", res.status, await res.text());
      return null;
    }
    const json = (await res.json()) as { records?: { id: string }[] };
    return json.records?.[0]?.id ?? null;
  } catch (e) {
    console.error("[airtable] create error", e);
    return null;
  }
}

/** Updates the record whose "Référence" equals ref. Returns true on success. */
export async function updateCrmByReference(ref: string, fields: AirtableFields): Promise<boolean> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token || !/^FL-[A-Z0-9]{5}$/.test(ref)) return false;
  try {
    const formula = encodeURIComponent(`{Référence} = "${ref}"`);
    const found = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?maxRecords=1&filterByFormula=${formula}`,
      { headers: headers(token), signal: AbortSignal.timeout(10000), cache: "no-store" }
    );
    if (!found.ok) return false;
    const id = ((await found.json()) as { records?: { id: string }[] }).records?.[0]?.id;
    if (!id) return false;
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${id}`,
      {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify({ fields, typecast: true }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );
    if (!res.ok) console.error("[airtable] update failed", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[airtable] update error", e);
    return false;
  }
}

/** Attaches one file (max 5 MB, Airtable's limit) to an attachment field. */
export async function uploadCrmAttachment(
  recordId: string,
  fieldName: string,
  file: { name: string; type: string; bytes: Uint8Array }
): Promise<boolean> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token || file.bytes.byteLength > 5 * 1024 * 1024) return false;
  try {
    const res = await fetch(
      `https://content.airtable.com/v0/${BASE_ID}/${recordId}/${encodeURIComponent(fieldName)}/uploadAttachment`,
      {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({
          contentType: file.type || "application/octet-stream",
          filename: file.name,
          file: Buffer.from(file.bytes).toString("base64"),
        }),
        signal: AbortSignal.timeout(30000),
        cache: "no-store",
      }
    );
    if (!res.ok) console.error("[airtable] upload failed", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[airtable] upload error", e);
    return false;
  }
}
