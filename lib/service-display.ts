import type { Lang, Service } from "./types";
import { money } from "./client";

export function servicePrice(service: Pick<Service, "price" | "priceMax">, lang: Lang) {
  if (service.price !== null && service.priceMax != null && service.priceMax > service.price) {
    const format = (value: number) =>
      new Intl.NumberFormat(lang === "lv" ? "lv-LV" : lang === "ru" ? "ru-RU" : "en-GB", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value);
    const range = `${format(service.price)}–${format(service.priceMax)}`;
    return lang === "en" ? `€${range}` : `${range}\u00a0€`;
  }
  return money(service.price, lang);
}
export function serviceDuration(
  service: Pick<Service, "duration" | "durationMin">,
  lang: Lang = "lv",
) {
  if (service.duration <= 0)
    return { lv: "Ilgumu precizēsim", en: "Duration to be confirmed", ru: "Длительность уточним" }[
      lang
    ];
  return service.durationMin != null && service.durationMin < service.duration
    ? `${service.durationMin}–${service.duration} min`
    : `${service.duration} min`;
}
export const isPriceRange = (service: Pick<Service, "price" | "priceMax">) =>
  service.price !== null && service.priceMax != null && service.priceMax > service.price;
