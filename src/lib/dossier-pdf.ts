// Signed mandate + application sheet as a one-page PDF (pdf-lib, no native deps).
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const BURG = rgb(0x7a / 255, 0x1f / 255, 0x3d / 255);
const GREY = rgb(0.35, 0.35, 0.35);
const LIGHT = rgb(0xf4 / 255, 0xed / 255, 0xef / 255);

// Standard PDF fonts only cover WinAnsi: replace what they cannot draw.
function clean(s: string): string {
  return (s || "")
    .replace(/[≥]/g, ">=")
    .replace(/[≤]/g, "<=")
    .replace(/[‐-‒]/g, "-")
    .replace(/[^\x20-\x7E -ÿ–—‘’“”•…€]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fit(s: string, f: PDFFont, size: number, max: number) {
  let t = clean(s).replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3.$2.$1");
  while (t && f.widthOfTextAtSize(t, size) > max) t = t.slice(0, -1);
  return t;
}

function wrap(s: string, f: PDFFont, size: number, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of clean(s).split(" ")) {
    const next = line ? `${line} ${w}` : w;
    if (f.widthOfTextAtSize(next, size) > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export type PdfInput = {
  reference: string;
  date: Date;
  rows: [label: string, c1: string, c2: string][];
  search: [label: string, value: string][];
  check: string;
  terms: string[];
  place: string;
  signature1: string | null; // data:image/png;base64,…
  signature2: string | null;
  c2Label: string | null;
};

export async function buildSignedPdf(d: PdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Inscription relocation ${d.reference} — Florissant Immobilier International`);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const W = 595.28, H = 841.89, M = 48, CW = W - 2 * M;

  let page: PDFPage = pdf.addPage([W, H]);
  let y = H - 46;
  const chrome = (p: PDFPage) => {
    p.drawText("Florissant immobilier", { x: M, y: H - 40, size: 13, font: bold, color: BURG });
    p.drawText("I N T E R N A T I O N A L", { x: M, y: H - 50, size: 6, font: reg, color: GREY });
    p.drawLine({ start: { x: M, y: 40 }, end: { x: W - M, y: 40 }, thickness: 1, color: BURG });
    const foot = "La Voie Creuse 3C, 1202 Genève · 076 452 10 91 · info@florissantimmobilier.ch";
    p.drawText(foot, { x: W / 2 - reg.widthOfTextAtSize(foot, 7) / 2, y: 28, size: 7, font: reg, color: GREY });
  };
  chrome(page);
  const need = (h: number) => {
    if (y - h < 56) {
      page = pdf.addPage([W, H]);
      chrome(page);
      y = H - 70;
    }
  };

  y -= 30;
  page.drawText("Inscription relocation — mandat de recherche", { x: M, y, size: 16, font: serif, color: BURG });
  y -= 14;
  const when = d.date.toLocaleString("fr-CH", { timeZone: "Europe/Zurich" });
  page.drawText(clean(`Référence ${d.reference} · rempli et signé en ligne le ${when}`), { x: M, y, size: 8.5, font: reg, color: GREY });
  y -= 10;

  const band = (t: string) => {
    need(18);
    y -= 16;
    page.drawRectangle({ x: M, y, width: CW, height: 14, color: BURG });
    page.drawText(clean(t.toUpperCase()), { x: M + 5, y: y + 4, size: 7.5, font: bold, color: rgb(1, 1, 1) });
  };

  band("Recherche");
  for (const [l, v] of d.search) {
    need(13);
    y -= 12.5;
    page.drawText(fit(l, reg, 8.5, 140), { x: M + 4, y: y + 3, size: 8.5, font: reg, color: GREY });
    page.drawText(fit(v || "-", reg, 8.5, CW - 150), { x: M + 150, y: y + 3, size: 8.5, font: reg });
  }

  band("Candidat(s)");
  const LW = 150, VW = (CW - LW) / 2;
  need(13);
  y -= 13;
  page.drawRectangle({ x: M, y, width: CW, height: 13, color: LIGHT });
  page.drawText("CANDIDAT 1", { x: M + LW + 4, y: y + 3.5, size: 7, font: bold, color: BURG });
  if (d.c2Label) page.drawText(fit(d.c2Label.toUpperCase(), bold, 7, VW - 8), { x: M + LW + VW + 4, y: y + 3.5, size: 7, font: bold, color: BURG });
  for (const [l, a, b] of d.rows) {
    need(13);
    y -= 12.5;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.3, color: rgb(0.85, 0.8, 0.82) });
    page.drawText(fit(l, reg, 8.5, LW - 8), { x: M + 4, y: y + 3, size: 8.5, font: reg, color: GREY });
    page.drawText(fit(a || "-", reg, 8.5, VW - 8), { x: M + LW + 4, y: y + 3, size: 8.5, font: reg });
    if (d.c2Label) page.drawText(fit(b || "-", reg, 8.5, VW - 8), { x: M + LW + VW + 4, y: y + 3, size: 8.5, font: reg });
  }

  band("Contrôle du dossier");
  need(14);
  y -= 13;
  page.drawText(fit(d.check, bold, 9, CW - 8), { x: M + 4, y: y + 2, size: 9, font: bold });

  band("Conditions acceptées");
  for (const t of d.terms) {
    for (const line of wrap("• " + t, reg, 8.5, CW - 8)) {
      need(12);
      y -= 11.5;
      page.drawText(line, { x: M + 4, y: y + 2, size: 8.5, font: reg });
    }
  }

  need(120);
  y -= 18;
  page.drawText(clean(`Lieu et date : ${d.place || "Genève"}, le ${d.date.toLocaleDateString("fr-CH", { timeZone: "Europe/Zurich" })}`), { x: M, y, size: 9, font: reg });
  y -= 10;
  const boxW = (CW - 16) / 2, boxH = 80;
  const sigs: [string | null, string][] = [
    [d.signature1, "Signature — Candidat 1"],
    [d.signature2, d.c2Label ? `Signature — ${d.c2Label}` : ""],
  ];
  for (let i = 0; i < 2; i++) {
    const [png, label] = sigs[i];
    if (!label) continue;
    const x = M + i * (boxW + 16), by = y - boxH;
    page.drawRectangle({ x, y: by, width: boxW, height: boxH, borderColor: rgb(0.79, 0.71, 0.74), borderWidth: 0.6 });
    page.drawText(fit(label, reg, 7, boxW - 8), { x: x + 4, y: by + boxH - 10, size: 7, font: reg, color: GREY });
    if (png?.startsWith("data:image/png;base64,")) {
      try {
        const img = await pdf.embedPng(Buffer.from(png.split(",")[1], "base64"));
        const s = Math.min((boxW - 12) / img.width, (boxH - 16) / img.height);
        page.drawImage(img, { x: x + (boxW - img.width * s) / 2, y: by + 3, width: img.width * s, height: img.height * s });
      } catch {
        /* unreadable signature image: the box stays empty */
      }
    }
  }
  return pdf.save();
}
