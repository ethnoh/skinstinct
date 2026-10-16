import type { Lang } from "./types";

export async function api<T = Record<string, unknown>>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(
    url,
    data === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "SERVER_ERROR");
  return result;
}
export function errorMessage(error: unknown, lang: Lang) {
  const code = error instanceof Error ? error.message : "SERVER_ERROR";
  const errors: Record<string, [string, string, string]> = {
    INVALID_DATA: [
      "Pārbaudi ievadītos datus. Norādi vārdu un derīgu tālruni vai e-pastu.",
      "Проверь данные. Укажи имя и корректный телефон или почту.",
      "Check your details. Enter your name and a valid phone or email.",
    ],
    SLOT_UNAVAILABLE: [
      "Šo laiku tikko rezervēja. Lūdzu, izvēlies citu.",
      "Это время уже заняли. Выбери другое.",
      "This time has just been booked. Please choose another.",
    ],
    TOO_MANY_REQUESTS: [
      "Pārāk daudz mēģinājumu. Lūdzu, mēģini pēc 15 minūtēm.",
      "Слишком много попыток. Попробуй через 15 минут.",
      "Too many attempts. Please try again in 15 minutes.",
    ],
    BOOKING_NOT_FOUND: [
      "Pieraksts nav atrasts. Pārbaudi kodu un kontaktinformāciju.",
      "Запись не найдена. Проверь код и контактные данные.",
      "Appointment not found. Check your code and contact details.",
    ],
    CANCEL_WINDOW: [
      "Atcelšanas termiņš ir beidzies. Sazinies ar studiju Instagram.",
      "Срок отмены на сайте истёк. Свяжись со студией в Instagram.",
      "The online cancellation deadline has passed. Contact the studio on Instagram.",
    ],
    INVALID_PASSWORD: ["Nepareiza parole.", "Неверный пароль.", "Incorrect password."],
    AUTH_REQUIRED: ["Lūdzu, pieslēdzies vēlreiz.", "Войди ещё раз.", "Please sign in again."],
    INVALID_IMAGE: [
      "Izvēlies derīgu JPG, PNG vai WebP attēlu līdz 8 MB.",
      "Выбери корректное изображение JPG, PNG или WebP до 8 МБ.",
      "Choose a valid JPG, PNG or WebP image up to 8 MB.",
    ],
    TOO_LARGE: [
      "Fails vai teksts ir pārāk liels.",
      "Файл или текст слишком большой.",
      "The file or text is too large.",
    ],
  };
  return (errors[code] || [
    "Neizdevās izveidot savienojumu. Mēģini vēlreiz.",
    "Не удалось выполнить запрос. Попробуй ещё раз.",
    "Unable to complete the request. Please try again.",
  ])[lang === "lv" ? 0 : lang === "ru" ? 1 : 2];
}
export const basePath = (lang: Lang) => (lang === "lv" ? "" : `/${lang}`);
export const localeCode = (lang: Lang) => ({ lv: "lv-LV", en: "en-GB", ru: "ru-RU" })[lang];
export const dateLabel = (date: string, lang: Lang) =>
  new Intl.DateTimeFormat(localeCode(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
export const money = (price: number | null, lang: Lang) =>
  price === null
    ? lang === "lv"
      ? "Cena pēc vienošanās"
      : lang === "en"
        ? "Price by agreement"
        : "Стоимость по согласованию"
    : new Intl.NumberFormat(localeCode(lang), {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(price);
