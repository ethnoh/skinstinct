import { z } from "zod";

const text = (max = 500) => z.string().trim().max(max);
export const localized = z.object({ lv: text(25000), en: text(25000), ru: text(25000) });
export const imagePath = z
  .string()
  .max(300)
  .regex(/^\/(images|api\/media)\/[a-zA-Z0-9_.-]+$/);
export const contactSchema = z
  .object({
    name: text(100).min(2),
    phone: text(30).default(""),
    email: text(200).default(""),
    consent: z.literal(true),
    website: text(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.phone && !value.email)
      ctx.addIssue({ code: "custom", message: "CONTACT_REQUIRED", path: ["phone"] });
    if (value.email && !z.email().safeParse(value.email).success)
      ctx.addIssue({ code: "custom", message: "INVALID_EMAIL", path: ["email"] });
    if (
      value.phone &&
      (!/^[+()\d\s-]+$/.test(value.phone) || value.phone.replace(/\D/g, "").length < 7)
    )
      ctx.addIssue({ code: "custom", message: "INVALID_PHONE", path: ["phone"] });
  });
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v);
export const timeSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
export const serviceSchema = z
  .object({
    id: text(80).regex(/^[a-z0-9-]+$/),
    title: localized,
    description: localized,
    category: localized,
    duration: z.number().int().min(15).max(240),
    price: z.number().min(0).max(10000).nullable(),
    active: z.boolean(),
    image: imagePath,
  })
  .refine((v) => !v.active || Object.values(v.title).every((title) => title.length >= 2));
export const articleSchema = z
  .object({
    id: text(80).min(1),
    slug: text(140).regex(/^[a-z0-9-]+$/),
    title: localized,
    excerpt: localized,
    body: localized,
    category: localized,
    image: imagePath,
    published: z.boolean(),
    createdAt: z.iso.datetime(),
  })
  .refine(
    (v) =>
      !v.published ||
      (Object.values(v.title).every((title) => title.length >= 2) &&
        Object.values(v.body).every((body) => body.length > 0)),
  );
export const settingsSchema = z.object({
  logoImage: imagePath,
  copy: z.record(z.string().max(80), localized),
  heroEyebrow: localized,
  heroTitle: localized,
  heroAccent: localized,
  heroDescription: localized,
  heroImage: imagePath,
  aboutImage: imagePath,
  aboutTitle: localized,
  aboutBody: localized,
  specialistName: text(150).min(2),
  specialistTitle: localized,
  registration: text(50),
  city: text(100),
  address: text(300),
  phone: text(40),
  email: text(200).refine((v) => !v || z.email().safeParse(v).success),
  instagram: z.url().refine((v) => {
    const u = new URL(v);
    return u.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(u.hostname);
  }),
  legalName: text(200),
  legalRegistration: text(50),
  legalAddress: text(300),
  privacyEmail: text(200).refine((v) => !v || z.email().safeParse(v).success),
  seoDescription: localized,
  bookingEnabled: z.boolean(),
  bookingNotice: localized,
  bufferMinutes: z.number().int().min(0).max(60),
  cancellationHours: z.number().int().min(0).max(168),
  schedule: z
    .array(
      z
        .object({ enabled: z.boolean(), start: timeSchema, end: timeSchema })
        .refine((v) => !v.enabled || v.start < v.end),
    )
    .length(7),
});
