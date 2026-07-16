import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";

// Serves files uploaded at runtime (property photos, plans, brochures).
// The standalone production server only serves public/ assets that existed
// at build time, so /uploads/* needs its own handler.

const ROOT = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const abs = path.normalize(path.join(ROOT, ...segments));
  // Never step outside the uploads directory.
  if (!abs.startsWith(ROOT + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  let info;
  try {
    info = await stat(abs);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!info.isFile()) return new Response("Not found", { status: 404 });

  const type = TYPES[path.extname(abs).toLowerCase()] ?? "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream;

  return new Response(stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(info.size),
      // File names are unique (timestamp + random), so cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
