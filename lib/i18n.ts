import english from "./en.json";
import type { Lang } from "./types";

const translations: Record<string, string> = english;

export function tr(lang: Lang, lv: string, ru: string): string {
  return lang === "ru" ? ru : lang === "en" ? (translations[lv] ?? lv) : lv;
}
