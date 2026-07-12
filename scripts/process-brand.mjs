import sharp from "sharp";
import fs from "node:fs";

const BORDEAUX = { r: 0x52, g: 0x1f, b: 0x26 }; // #521F26
const IVORY = { r: 0xfb, g: 0xf9, b: 0xf6 }; // #FBF9F6

async function loadRaw(file) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

// alpha from "ink on light background": how far the darkest channel is from white
function inkAlpha(r, g, b) {
  const m = Math.min(g, b); // for red/bordeaux/black ink, g&b drop fastest
  const a = (255 - m) / 255;
  return Math.max(0, Math.min(1, a * 1.15 - 0.02)); // slight contrast snap
}

// alpha from "light ink on dark background"
function lightAlpha(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const a = (lum - 70) / (255 - 70);
  return Math.max(0, Math.min(1, a * 1.15 - 0.02));
}

async function recolor(file, out, color, mode = "ink", maxDim = 1200) {
  const { data, w, h } = await loadRaw(file);
  const rgba = Buffer.alloc(w * h * 4);
  let minX = w, minY = h, maxX = 0, maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const o = (y * w + x) * 4;
      const a =
        mode === "ink"
          ? inkAlpha(data[i], data[i + 1], data[i + 2])
          : lightAlpha(data[i], data[i + 1], data[i + 2]);
      rgba[o] = color.r;
      rgba[o + 1] = color.g;
      rgba[o + 2] = color.b;
      rgba[o + 3] = Math.round(a * 255);
      if (a > 0.05) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.03);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  let img = sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  });

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  if (Math.max(cw, ch) > maxDim) {
    img = img.resize(cw >= ch ? { width: maxDim } : { height: maxDim });
  }

  await img.png().toFile(out);
  console.log(`${out}  (${cw}x${ch} cropped from ${w}x${h})`);
}

fs.mkdirSync("public/logo", { recursive: true });

// Icon: red original → bordeaux + ivory, transparent bg
await recolor("brand-assets/icon-red.png", "public/logo/icon.png", BORDEAUX, "ink", 900);
await recolor("brand-assets/icon-red.png", "public/logo/icon-ivory.png", IVORY, "ink", 900);

// Wordmark: bordeaux-on-white original → transparent bg (kept bordeaux), + ivory variant
await recolor("brand-assets/wordmark-bordeaux.png", "public/logo/wordmark.png", BORDEAUX, "ink", 1600);
await recolor("brand-assets/wordmark-bordeaux.png", "public/logo/wordmark-ivory.png", IVORY, "ink", 1600);

// Favicon: ivory icon centered on bordeaux tile with fine ring
const icon = await sharp("public/logo/icon-ivory.png")
  .resize({ height: 300 })
  .toBuffer();
const iconMeta = await sharp(icon).metadata();
const tile = Buffer.from(
  `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
     <rect width="512" height="512" rx="96" fill="#521f26"/>
     <circle cx="256" cy="256" r="200" fill="none" stroke="#fbf9f6" stroke-width="6"/>
   </svg>`
);
await sharp(tile)
  .composite([
    {
      input: icon,
      left: Math.round(256 - iconMeta.width / 2),
      top: Math.round(256 - iconMeta.height / 2),
    },
  ])
  .png()
  .toFile("src/app/icon.png");
console.log("src/app/icon.png (favicon)");
