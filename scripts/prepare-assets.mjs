import sharp from "sharp";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [portrait, hero, stilllife, logo] = process.argv.slice(2);
if (!portrait || !hero || !stilllife || !logo)
  throw new Error("Pass portrait, hero, stilllife and logo input paths.");
const directory = path.join(process.cwd(), "public", "images");
mkdirSync(directory, { recursive: true });
await sharp(portrait)
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 88 })
  .toFile(path.join(directory, "valerija.webp"));
await sharp(hero)
  .resize({ width: 1800, withoutEnlargement: true })
  .webp({ quality: 87 })
  .toFile(path.join(directory, "hero.webp"));
await sharp(stilllife)
  .resize({ width: 1400, withoutEnlargement: true })
  .webp({ quality: 87 })
  .toFile(path.join(directory, "treatment.webp"));
await sharp(stilllife)
  .resize(1000, 1100, { fit: "cover", position: "right" })
  .webp({ quality: 87 })
  .toFile(path.join(directory, "ritual.webp"));
await sharp(logo)
  .resize({ width: 1254, withoutEnlargement: true })
  .webp({ quality: 95 })
  .toFile(path.join(directory, "skinstinct-logo.webp"));
await sharp(logo)
  .resize(64, 64)
  .png()
  .toFile(path.join(process.cwd(), "public", "favicon.png"));
await sharp(logo)
  .resize(180, 180)
  .png()
  .toFile(path.join(process.cwd(), "public", "apple-icon.png"));
const right = await sharp(hero).resize(650, 630, { fit: "cover", position: "center" }).toBuffer();
const text = Buffer.from(
  `<svg width="1200" height="630"><text x="60" y="245" font-family="Georgia,serif" font-size="58" fill="#faf8f3">SKINSTINCT</text><text x="60" y="302" font-family="Arial,sans-serif" font-size="15" letter-spacing="3" fill="#cad2bd">KOSMETOLOĢIJAS STUDIJA</text><text x="60" y="375" font-family="Georgia,serif" font-size="28" font-style="italic" fill="#ead8c6">Rūpes, kas paliek.</text><text x="60" y="520" font-family="Arial,sans-serif" font-size="16" fill="#cad2bd">Jēkabpils, Latvija</text></svg>`,
);
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#333f2d" } })
  .composite([
    { input: right, left: 550, top: 0 },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 90 })
  .toFile(path.join(directory, "og-cover.jpg"));
console.log("Prepared production image assets.");
