// Serves one client document to the logged-in admin only.
import path from "node:path";
import { isAdmin } from "@/lib/auth";
import { readDossierFile } from "@/lib/dossier-files";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string; name: string }> }
) {
  if (!(await isAdmin())) return new Response("Non autorisé", { status: 401 });
  const { ref, name } = await params;
  const file = await readDossierFile(ref, decodeURIComponent(name));
  if (!file) return new Response("Introuvable", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": TYPES[path.extname(name).toLowerCase()] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${name.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
