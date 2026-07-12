// Trace the original logo rasters into crisp SVGs with potrace.
// Ink detection: same rule as process-brand.mjs (min(g,b) low = ink).
import sharp from "sharp";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

const POTRACE = path.join(os.homedir(), ".local", "bin", "potrace");

async function toPGM(src, out) {
  const { data, info } = await sharp(src)
    .flatten({ background: "#ffffff" }) // transparent → white before ink detection
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // grayscale "inkness": dark where ink, white elsewhere
  const gray = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const ink = (255 - Math.min(g, b)) / 255; // 1 = full ink
    gray[i] = Math.round(255 - ink * 255);
  }

  const header = Buffer.from(`P5\n${w} ${h}\n255\n`, "ascii");
  fs.writeFileSync(out, Buffer.concat([header, gray]));
  return { w, h };
}

function trace(pgm, svgOut, fill) {
  execFileSync(POTRACE, [
    pgm,
    "-s", // SVG
    "-o", svgOut,
    "--flat",
    "-t", "8", // suppress speckles
    "-O", "0.4",
    "-C", fill,
  ]);
  // tighten: potrace writes width/height in pt — leave viewBox intact
  let svg = fs.readFileSync(svgOut, "utf8");
  svg = svg.replace(/<metadata>[\s\S]*?<\/metadata>\n?/, "");
  fs.writeFileSync(svgOut, svg);
}

fs.mkdirSync("public/logo", { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fl-logo-"));

// Trace the pre-cropped PNGs so the SVG viewBox hugs the artwork
const iconPgm = path.join(tmp, "icon.pgm");
await toPGM("public/logo/icon.png", iconPgm);
trace(iconPgm, "public/logo/icon.svg", "#521f26");
trace(iconPgm, "public/logo/icon-ivory.svg", "#fbf9f6");

const wmPgm = path.join(tmp, "wordmark.pgm");
await toPGM("public/logo/wordmark.png", wmPgm);
trace(wmPgm, "public/logo/wordmark.svg", "#521f26");
trace(wmPgm, "public/logo/wordmark-ivory.svg", "#fbf9f6");

for (const f of ["icon.svg", "icon-ivory.svg", "wordmark.svg", "wordmark-ivory.svg"]) {
  const kb = (fs.statSync(`public/logo/${f}`).size / 1024).toFixed(1);
  console.log(`public/logo/${f}  ${kb} KB`);
}
