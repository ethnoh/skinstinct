import type { Localized, Service } from "./types";
const text = (lv: string, en: string, ru: string): Localized => ({ lv, en, ru });
export const priceGroups = {
  face: text("Sejas kopšanas procedūras", "Facial treatments", "Процедуры для лица"),
  diagnostics: text("Ādas diagnostika", "Skin diagnostics", "Диагностика кожи"),
  massage: text("Masāžas", "Massage", "Массаж"),
  injections: text("Injekciju procedūras", "Injectable treatments", "Инъекционные процедуры"),
  other: text("Citi pakalpojumi", "Other services", "Другие услуги"),
};

export const confirmedDurations = { diagnostics: 30, mesotherapy: 60, biorevitalisation: 60 };
export const priceBookingNotice = text(
  "Pierakstu apstiprināšu personīgi. Cena redzama pie katras procedūras; injekciju precīzo cenu saskaņosim pirms vizītes atbilstoši preparāta daudzumam un individuālajam plānam.",
  "I will confirm your appointment personally. Each treatment shows its price; the exact price of injectable treatments will be agreed before your visit according to the product quantity and individual plan.",
  "Подтвержу запись лично. Стоимость указана у каждой процедуры; точную стоимость инъекций согласуем до визита с учётом количества препарата и индивидуального плана.",
);

function service(
  id: string,
  title: Localized,
  description: Localized,
  group: NonNullable<Service["group"]>,
  duration: number,
  price: number,
  image: string,
  extra: Partial<Service> = {},
): Service {
  return {
    id,
    title,
    description,
    category: priceGroups[group],
    group,
    duration,
    price,
    image,
    active: true,
    ...extra,
  };
}
export const priceCatalogue: Service[] = [
  service(
    "youth-facial",
    text("Jauniešu procedūra", "Youth facial", "Процедура для молодой кожи"),
    text(
      "Kopšana jaunai ādai ar vismaz vienu aparātmetodi.",
      "Care for young skin with at least one device-based method.",
      "Уход за молодой кожей с использованием минимум одной аппаратной методики.",
    ),
    "face",
    60,
    60,
    "/images/procedure-youth-client-v3.webp",
    { durationMin: 40 },
  ),
  service(
    "express-glow",
    text("Express Glow", "Express Glow", "Express Glow"),
    text(
      "Sejas kopšanas un mirdzuma procedūra ar vismaz vienu aparātmetodi.",
      "A facial for a fresh glow, including at least one device-based method.",
      "Процедура ухода и сияния с использованием минимум одной аппаратной методики.",
    ),
    "face",
    60,
    60,
    "/images/procedure-glow-hydrodiamond-v2.webp",
    { durationMin: 40 },
  ),
  service(
    "skinstinct-signature",
    text("SKINSTINCT Signature", "SKINSTINCT Signature", "SKINSTINCT Signature"),
    text(
      "Padziļināta ādas stāvokļa izvērtēšana un individualizēta procedūra ar divām aparātmetodēm.",
      "An in-depth skin assessment and an individual treatment with two device-based methods.",
      "Углублённая оценка состояния кожи и индивидуальная процедура с двумя аппаратными методиками.",
    ),
    "face",
    90,
    70,
    "/images/procedure-signature-v2.webp",
    { durationMin: 60 },
  ),
  service(
    "anti-age-longevity",
    text("Anti-Age Longevity", "Anti-Age Longevity", "Anti-Age Longevity"),
    text(
      "Daudzpakāpju sejas kopšana ar vismaz trim savstarpēji saderīgām aparātmetodēm.",
      "A multi-step facial combining at least three compatible device-based methods.",
      "Многоэтапный уход с использованием минимум трёх совместимых аппаратных методик.",
    ),
    "face",
    90,
    90,
    "/images/procedure-longevity-glow-v4.webp",
  ),
  service(
    "diagnostics",
    text(
      "Ādas diagnostika ar ZEMITS VERA FACE 3D PRO NG",
      "Skin diagnostics with ZEMITS VERA FACE 3D PRO NG",
      "Диагностика кожи ZEMITS VERA FACE 3D PRO NG",
    ),
    text(
      "Ādas analīze 3D formātā. Rezultātus iespējams nosūtīt uz Tavu e-pastu un parādīt savam speciālistam vai ārstam.",
      "A 3D skin analysis. Results can be sent to your email and shared with your specialist or doctor.",
      "Анализ кожи в 3D-формате. Результаты можно получить на электронную почту и показать своему специалисту или врачу.",
    ),
    "diagnostics",
    confirmedDurations.diagnostics,
    30,
    "/images/hero.webp",
    { bookable: false },
  ),
  service(
    "mesotherapy",
    text("Mezoterapija", "Mesotherapy", "Мезотерапия"),
    text(
      "Pēc individuāla plāna. Precīza cena atkarīga no preparāta daudzuma.",
      "An individual plan. The exact price depends on the amount of product used.",
      "По индивидуальному плану. Точная стоимость зависит от количества препарата.",
    ),
    "injections",
    confirmedDurations.mesotherapy,
    120,
    "/images/journal-details.webp",
    { priceMax: 240 },
  ),
  service(
    "biorevitalisation",
    text(
      "Biorevitalizācija — NEAUVIA Hydro Deluxe",
      "Biorevitalisation — NEAUVIA Hydro Deluxe",
      "Биоревитализация — NEAUVIA Hydro Deluxe",
    ),
    text(
      "1–2,5 ml. Seja vai seja un kakls / dekoltē; preparāta daudzums atkarīgs no izvēlētajām zonām un individuālā plāna.",
      "1–2.5 ml. Face, or face and neck / décolleté; product quantity depends on the chosen areas and individual plan.",
      "1–2,5 мл. Лицо или лицо и шея / декольте; количество препарата зависит от выбранных зон и индивидуального плана.",
    ),
    "injections",
    confirmedDurations.biorevitalisation,
    120,
    "/images/journal-details.webp",
    { priceMax: 240 },
  ),
  service(
    "facial-modelling-massage",
    text(
      "Manuālā sejas modelējošā masāža",
      "Manual facial sculpting massage",
      "Мануальный моделирующий массаж лица",
    ),
    text("Manuāla sejas masāža.", "A manual facial massage.", "Мануальный массаж лица."),
    "massage",
    60,
    55,
    "/images/ritual.webp",
  ),
  service(
    "facial-lymphatic-massage",
    text(
      "Manuālā sejas limfodrenāža",
      "Manual facial lymphatic drainage",
      "Мануальный лимфодренаж лица",
    ),
    text(
      "Manuāla sejas limfodrenāžas masāža.",
      "A manual facial lymphatic drainage massage.",
      "Мануальный лимфодренажный массаж лица.",
    ),
    "massage",
    40,
    55,
    "/images/ritual.webp",
  ),
  service(
    "body-lymphatic-massage",
    text(
      "Manuālā ķermeņa limfodrenāža",
      "Manual body lymphatic drainage",
      "Мануальный лимфодренаж тела",
    ),
    text(
      "Manuāla ķermeņa limfodrenāžas masāža.",
      "A manual body lymphatic drainage massage.",
      "Мануальный лимфодренажный массаж тела.",
    ),
    "massage",
    60,
    55,
    "/images/ritual.webp",
  ),
  service(
    "back-body-massage",
    text("Muguras vai ķermeņa masāža", "Back or body massage", "Массаж спины или тела"),
    text(
      "Klasiskās masāžas, trigerpunktu un SPA masāžas elementi.",
      "Elements of classic, trigger-point and spa massage.",
      "Элементы классического, триггерного и SPA-массажа.",
    ),
    "massage",
    60,
    55,
    "/images/ritual.webp",
  ),
];

export const introductoryTreatment: Service = service(
  'introductory-treatment',
  text('Iepazīšanās procedūra', 'Introductory treatment', 'Ознакомительная процедура'),
  text(
    'Uz vietas veiksim ādas diagnostiku un kopā izvēlēsimies piemērotāko procedūru no cenrāža. Cena atbilstoši izvēlētajai procedūrai — to saskaņosim pirms veikšanas. Rezervējam 90 minūtes.',
    'We will assess your skin during the visit and choose a suitable treatment from the price list together. The price follows the chosen treatment and is agreed before we begin. We reserve 90 minutes.',
    'На месте проведём диагностику кожи и вместе выберем подходящую процедуру из прайс-листа. Стоимость зависит от выбранной процедуры и согласуется до её проведения. Резервируем 90 минут.',
  ),
  'face', 90, 0, '/images/valerija-studio-care-v4.webp',
  {price:null,durationMin:60},
);
export const bookingCatalogue = [introductoryTreatment, ...priceCatalogue];

export function applyPriceRelease(saved: Service[]): Service[] {
  const current = bookingCatalogue.map((replacement) => {
    const old = saved.find((item) => item.id === replacement.id);
    return {
      ...old,
      ...replacement,
      image: old?.image.startsWith("/api/media/") ? old.image : replacement.image,
    };
  });
  return [
    ...current,
    ...saved
      .filter((old) => !bookingCatalogue.some((item) => item.id === old.id))
      .map((old) => ({ ...old, active: false })),
  ];
}
