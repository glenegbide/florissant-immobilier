// Minimal Airtable client for the CRM base ("Florissant CRM" → table "Clients").
// The access token lives in the AIRTABLE_TOKEN environment variable, never in code.
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appYhduckxKToARmG";
const TABLE = process.env.AIRTABLE_TABLE || "Clients";

export type AirtableFields = Record<string, string | number | boolean>;

export function airtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_TOKEN);
}

/** Creates one record. Returns true on success; never throws. */
export async function createCrmRecord(fields: AirtableFields): Promise<boolean> {
  const token = process.env.AIRTABLE_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // typecast lets Airtable match select options by name.
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.error("[airtable] create failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[airtable] create error", e);
    return false;
  }
}
