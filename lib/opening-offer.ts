import type { Lang, Service } from './types';

export const BOOKING_START = '2026-12-01';
export const OFFER_END = '2026-12-31';
export const introductoryDiscount = 10;
export const isIntroductoryDate = (date: string) => date >= BOOKING_START && date <= OFFER_END;
export function priceForDate(service: Pick<Service, 'price' | 'priceMax' | 'bookable'>, date: string) {
  const discount = service.bookable !== false && isIntroductoryDate(date) ? introductoryDiscount : 0;
  return {
    price: service.price === null ? null : Math.max(0, service.price - discount),
    priceMax: service.priceMax == null ? service.priceMax : Math.max(0, service.priceMax - discount),
  };
}
export function cataloguePriceDate(today: string) {
  return today < BOOKING_START ? BOOKING_START : today;
}
export const introductoryNotice: Record<Lang, string> = {
  lv: 'Pieraksts atvērts vizītēm no 1. decembra. Vizītēm 2026. gada 1.–31. decembrī visām pieejamajām procedūrām iepazīšanās cena ar 10 € atlaidi. No janvāra spēkā pamatcenas.',
  en: 'Appointments open for visits from 1 December. All available treatments visited on 1–31 December 2026 have an introductory €10 discount. Standard prices apply from January.',
  ru: 'Запись открыта на визиты с 1 декабря. На все доступные процедуры 1–31 декабря 2026 года действует ознакомительная скидка 10 €. С января действуют обычные цены.',
};
export const diagnosticNotice: Record<Lang, string> = {
  lv: 'Pirmreizējā vizītē iekļauta ādas stāvokļa izvērtēšana, izņemot ķermeņa masāžas. Turpmāk diagnostiku pievienojam pēc vajadzības — katrā vai katrā otrajā procedūrā. Atsevišķs pieraksts aparātdiagnostikai vēl nav atvērts; aparāts vēl nav pieejams.',
  en: 'Your first visit includes a skin assessment, except for body massages. Further diagnostics are added as needed at each or every other treatment. Separate device-based diagnostics are not yet open for booking; the device is not yet available.',
  ru: 'Первый визит включает оценку состояния кожи, кроме массажа тела. Далее диагностику добавляем по необходимости — на каждой или каждой второй процедуре. Отдельная запись на аппаратную диагностику пока закрыта; аппарат ещё не доступен.',
};
