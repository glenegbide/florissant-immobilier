// Import Glen's real photos from "claude pics" — EXIF-rotated, optimized.
import sharp from "sharp";
import fs from "node:fs";

const SRC = "/Users/glenegbide/Downloads/claude pics";
const OUT = "public/photos";

const jobs = [
  [`/tmp/heic2.jpg`, "jet_deau.jpg"], // Jet d'eau at sunset (from HEIC)
  [`/tmp/heic1.jpg`, "villa_jaune.jpg"], // yellow villa with veranda (from HEIC)
  [`${SRC}/IMG_8519 2.JPG`, "garden_terrace.jpg"],
  [`${SRC}/IMG_8525 2.JPG`, "bedroom_terrace.jpg"],
  [`${SRC}/IMG_8591 3.JPG`, "balcony_awning.jpg"],
  [`${SRC}/IMG_8624 2.JPG`, "parquet_room.jpg"],
  [`${SRC}/IMG_8780 2.JPG`, "living_awning.jpg"],
  [`${SRC}/IMG_8800 2.JPG`, "garden_hydrangeas.jpg"],
  [`${SRC}/IMG_3364.JPG`, "building_modern.jpg"],
  [`${SRC}/IMG_6143.JPG`, "courtyard_historic.jpg"],
  [`${SRC}/IMG_9006.JPG`, "salon_furnished.jpg"],
  [`${SRC}/4C46E6A3-F5A7-4256-B455-4687A52BC84D.PNG`, "living_staged.jpg"],
];

// wipe old photos
for (const f of fs.readdirSync(OUT)) fs.rmSync(`${OUT}/${f}`);
console.log("old photos removed");

for (const [src, name] of jobs) {
  await sharp(src)
    .rotate() // apply EXIF orientation
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(`${OUT}/${name}`);
  const m = await sharp(`${OUT}/${name}`).metadata();
  console.log(`${name}  ${m.width}x${m.height}`);
}
