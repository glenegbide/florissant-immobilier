// Private storage for client documents (ID, debt certificate, pay slips, signed mandate).
// Files live OUTSIDE public/: they are only served to the logged-in admin.
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Resolved at call time so the build does not try to trace the folder.
function root(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "private", "dossiers");
}

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // per file
export const MAX_FILES_PER_FIELD = 6;
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"]);

export type StoredFile = { field: string; name: string; type: string; bytes: Uint8Array };

const REF_RE = /^FL-[A-Z0-9]{5}$/;

function safeName(name: string): string {
  const base = name.normalize("NFKD").replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_");
  return base.slice(-80) || "document";
}

/** Reads the uploaded files of one form field. Ignores empty or invalid entries. */
export async function readUploads(formData: FormData, field: string): Promise<StoredFile[]> {
  const out: StoredFile[] = [];
  for (const v of formData.getAll(field).slice(0, MAX_FILES_PER_FIELD)) {
    if (typeof v === "string" || v.size === 0) continue;
    if (v.size > MAX_FILE_BYTES) continue;
    const type = v.type || "application/octet-stream";
    if (!ALLOWED.has(type)) continue;
    out.push({ field, name: safeName(v.name), type, bytes: new Uint8Array(await v.arrayBuffer()) });
  }
  return out;
}

/** Writes files to private/dossiers/<ref>/ with a field prefix. Returns saved file names. */
export async function saveDossierFiles(ref: string, files: StoredFile[]): Promise<string[]> {
  if (!REF_RE.test(ref)) return [];
  const dir = path.join(/*turbopackIgnore: true*/ root(), ref);
  await mkdir(dir, { recursive: true });
  const saved: string[] = [];
  let i = 0;
  for (const f of files) {
    i++;
    const name = `${f.field}-${i}-${f.name}`;
    await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), f.bytes);
    saved.push(name);
  }
  return saved;
}

export async function listDossierFiles(ref: string): Promise<{ name: string; size: number }[]> {
  if (!REF_RE.test(ref)) return [];
  const dir = path.join(/*turbopackIgnore: true*/ root(), ref);
  try {
    const names = await readdir(dir);
    return Promise.all(
      names.sort().map(async (name) => ({ name, size: (await stat(path.join(/*turbopackIgnore: true*/ dir, name))).size }))
    );
  } catch {
    return [];
  }
}

export async function readDossierFile(ref: string, name: string): Promise<Buffer | null> {
  if (!REF_RE.test(ref) || name.includes("/") || name.includes("\\") || name.startsWith(".")) {
    return null;
  }
  try {
    return await readFile(path.join(/*turbopackIgnore: true*/ root(), ref, name));
  } catch {
    return null;
  }
}
