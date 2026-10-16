import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const directory = path.join(process.cwd(), "public", "fonts");
mkdirSync(directory, { recursive: true });
function download(url) {
  const result = spawnSync(
    process.platform === "win32" ? "curl.exe" : "curl",
    [
      ...(process.platform === "win32" ? ["--ssl-no-revoke"] : []),
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      url,
    ],
    { maxBuffer: 10_000_000 },
  );
  if (result.status !== 0) throw new Error("Font download failed");
  return result.stdout;
}
const url =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400..600;1,400..500&family=Manrope:wght@400..700&display=swap";
let css = download(url).toString();
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
for (let index = 0; index < urls.length; index++) {
  const fontUrl = urls[index];
  const filename = `font-${index + 1}.${fontUrl.includes(".woff2") ? "woff2" : "ttf"}`;
  writeFileSync(path.join(directory, filename), download(fontUrl));
  css = css.replaceAll(fontUrl, `/fonts/${filename}`);
}
writeFileSync(path.join(directory, "fonts.css"), css);
for (const [family, folder] of [
  ["Cormorant-Garamond", "cormorantgaramond"],
  ["Manrope", "manrope"],
])
  writeFileSync(
    path.join(directory, `${family}-OFL.txt`),
    download(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`),
  );
console.log(`Self-hosted ${urls.length} font files.`);
