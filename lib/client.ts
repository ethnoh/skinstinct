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
    INVALID_DATE: [
      "Izvēlies datumu no šodienas līdz nākamajām 90 dienām.",
      "Выбери дату от сегодняшнего дня до следующих 90 дней.",
      "Choose a date from today through the next 90 days.",
    ],
    SERVICE_NOT_FOUND: [
      "Izvēlētais pakalpojums vairs nav pieejams.",
      "Выбранная услуга больше недоступна.",
      "The selected service is no longer available.",
    ],
    WHATSAPP_UNAVAILABLE: ['WhatsApp ziņas pašlaik nav pieejamas. Noņem WhatsApp atzīmi un apstiprini pierakstu.','Сообщения WhatsApp сейчас недоступны. Сними отметку WhatsApp и подтверди запись.','WhatsApp messages are currently unavailable. Uncheck WhatsApp and confirm your booking.'],
    INVALID_PHONE: ['WhatsApp ziņām norādi derīgu tālruņa numuru ar valsts kodu, piemēram, +371 26054744.','Для WhatsApp укажи действующий номер с кодом страны, например +371 26054744.','For WhatsApp, enter a valid phone number with its country code, for example +371 26054744.'],
    SLOT_UNAVAILABLE: [
      "Izvēlētais laiks ir aizņemts vai ārpus darba laika. Izvēlies citu.",
      "Выбранное время занято или находится вне рабочего графика. Выбери другое.",
      "The selected time is occupied or outside business hours. Please choose another.",
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
      "Atcelšanas termiņš ir beidzies. Nosūti SMS vai piezvani uz +371 26054744.",
      "Срок отмены на сайте истёк. Отправь SMS или позвони по номеру +371 26054744.",
      "The online cancellation deadline has passed. Send an SMS or call +371 26054744.",
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
        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(price);
