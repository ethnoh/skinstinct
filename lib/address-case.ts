import type { Lang } from "./types";

const protectedText = String.raw`https?:\/\/[^\s<>]+|[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}`;
const words = {
  lv: "tu|tev|tevi|tevis|tavs|tava|tavi|tavas|tavu|tavam|tavai|tavā|tavās|tavos|taviem|tavām|tavus|jūs|jums|jūsu",
  ru: "ты|тебя|тебе|тобой|тобою|твой|твоя|твоё|твое|твои|твоего|твоему|твоим|твоими|твоих|твою|твоей|твоею|вы|вас|вам|вами|ваш|ваша|ваше|ваши|вашего|вашему|вашим|вашими|ваших|вашу|вашей|вашею",
};
const patterns = {
  lv: new RegExp(`${protectedText}|(?<![\\p{L}\\p{N}_])(${words.lv})(?![\\p{L}\\p{N}_])`, "gu"),
  ru: new RegExp(`${protectedText}|(?<![\\p{L}\\p{N}_])(${words.ru})(?![\\p{L}\\p{N}_])`, "gu"),
};

export function addressCase(text: string, lang: Lang): string {
  if (lang === "en") return text;
  return text.replace(patterns[lang], (match: string, address: string | undefined) =>
    address ? address.charAt(0).toLocaleUpperCase(lang) + address.slice(1) : match,
  );
}
