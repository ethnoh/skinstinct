import english from "./en.json";
import type { Lang } from "./types";
import { addressCase } from "./address-case";
export { addressCase } from "./address-case";

const translations: Record<string, string> = Object.fromEntries(
  Object.entries(english).flatMap(([key, value]) => [
    [key, value],
    [addressCase(key, "lv"), value],
  ]),
);

export function tr(lang: Lang, lv: string, ru: string): string {
  return addressCase(lang === "ru" ? ru : lang === "en" ? (translations[lv] ?? lv) : lv, lang);
}
