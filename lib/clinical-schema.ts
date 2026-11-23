import { z } from "zod";
import { dateSchema } from "./validation";

export const healthQuestions = [
  [
    "allergies",
    "Alerģijas un agrākas reakcijas",
    "Medikamenti, kosmētika, latekss, anestēzijas līdzekļi; kā izpaudās reakcija.",
  ],
  ["pregnancy", "Grūtniecība vai tās iespējamība", "Ja attiecināms, norādi papildu informāciju."],
  ["lactation", "Zīdīšanas periods", "Ja attiecināms."],
  [
    "chronic",
    "Hroniskas un citas nozīmīgas saslimšanas",
    "Piemēram, diabēts, autoimūnas, sirds un asinsvadu vai citas saslimšanas.",
  ],
  [
    "medications",
    "Medikamenti un uztura bagātinātāji",
    "Nosaukums, lietošanas periods; arī retinoīdi, asinsreci vai fotosensitivitāti ietekmējoši līdzekļi.",
  ],
  [
    "infection",
    "Akūta saslimšana, infekcija, herpes, brūces",
    "Pašreizējas sūdzības un lokalizācija.",
  ],
  [
    "skinConditions",
    "Ādas saslimšanas un dermatologa ārstēšana",
    "Diagnozes tikai tad, ja tās ir zināmas; pašreizējā terapija.",
  ],
  [
    "implants",
    "Implanti, elektrokardiostimulators, metāls procedūras zonā",
    "Ierīces vai implanta veids un atrašanās vieta.",
  ],
  [
    "healing",
    "Asiņošana, dzīšana un rētošanās",
    "Asinsreces traucējumi, lēna dzīšana, nosliece uz keloīdiem.",
  ],
  [
    "majorTreatment",
    "Onkoloģiska ārstēšana, imūnsupresija, nozīmīgas operācijas",
    "Veids un datums, ja tas ir būtiski plānotajai procedūrai.",
  ],
  [
    "sun",
    "Aktīva sauļošanās vai solārijs pēdējo 30 dienu laikā",
    "Pēdējā reize, apdegums, ādas reakcija.",
  ],
  [
    "previousProcedures",
    "Iepriekšējās procedūras",
    "Kad, kādas un kurā zonā; arī injekcijas, lāzers, pīlings un reakcijas.",
  ],
] as const;
export type HealthKey = (typeof healthQuestions)[number][0];
const note = z.string().trim().max(12000);
const short = z.string().trim().max(250);
const optionalDate = z.union([z.literal(""), dateSchema]);
const answer = z.object({ answer: z.enum(["unknown", "no", "yes", "na"]), details: note });
const health = z.object(
  Object.fromEntries(healthQuestions.map(([key]) => [key, answer])) as Record<
    HealthKey,
    typeof answer
  >,
);
export const clientCardSchema = z.object({
  name: short.min(2),
  birthDate: optionalDate,
  phone: short,
  email: z.union([z.literal(""), z.email().max(250)]),
  guardian: note,
  concerns: note,
  health,
  homeMorning: note,
  homeEvening: note,
  homeOther: note,
  skinAssessment: note,
  phototype: z.enum(["", "I", "II", "III", "IV", "V", "VI"]),
  privacyNoticeDate: optionalDate,
  processingBasis: note,
  consentNotes: note,
  reviewDate: optionalDate,
  notes: note,
  archived: z.boolean(),
});
export const metricSchema = z.object({
  name: short.min(1),
  value: z.number().finite(),
  unit: short,
  area: short,
  device: short,
  conditions: short,
});
export const clinicalVisitSchema = z.object({
  date: dateSchema,
  service: short.min(2),
  area: short,
  duration: z.number().int().min(0).max(600),
  healthReviewed: z.boolean(),
  healthChanges: note,
  assessment: note,
  consentNotes: note,
  protocol: note,
  products: note,
  deviceSettings: note,
  reaction: note,
  aftercare: note,
  nextPlan: note,
  price: z.number().min(0).max(100000).multipleOf(0.01).nullable(),
  discountNotes: note,
  metrics: z.array(metricSchema).max(60),
  correctionReason: short,
});
export type ClientCard = z.infer<typeof clientCardSchema>;
export type ClinicalVisit = z.infer<typeof clinicalVisitSchema>;
export type SavedClient = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  data: ClientCard;
};
export type SavedVisit = {
  id: string;
  clientId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  data: ClinicalVisit & { anamnesisSnapshot?: ClientCard };
};
export type ClinicalDocument = {
  id: string;
  clientId: string;
  visitId: string | null;
  name: string;
  date: string;
  size: number;
};
export function emptyClientCard(): ClientCard {
  return {
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    guardian: "",
    concerns: "",
    health: Object.fromEntries(
      healthQuestions.map(([key]) => [key, { answer: "unknown", details: "" }]),
    ) as ClientCard["health"],
    homeMorning: "",
    homeEvening: "",
    homeOther: "",
    skinAssessment: "",
    phototype: "",
    privacyNoticeDate: "",
    processingBasis: "",
    consentNotes: "",
    reviewDate: "",
    notes: "",
    archived: false,
  };
}
export function emptyClinicalVisit(date: string): ClinicalVisit {
  return {
    date,
    service: "",
    area: "",
    duration: 0,
    healthReviewed: false,
    healthChanges: "",
    assessment: "",
    consentNotes: "",
    protocol: "",
    products: "",
    deviceSettings: "",
    reaction: "",
    aftercare: "",
    nextPlan: "",
    price: null,
    discountNotes: "",
    metrics: [],
    correctionReason: "",
  };
}
