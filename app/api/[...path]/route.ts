import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { dataDir, db, getArticles, getServices, getSettings, setContent } from "@/lib/db";
import {
  bookingColumns,
  canCancel,
  getSlots,
  minuteTime,
  publicBooking,
  startDate,
  timeMinute,
  today,
  validHorizon,
} from "@/lib/booking";
import {
  fail,
  hash,
  HttpError,
  isAdmin,
  jsonBody,
  limitedBody,
  rateLimit,
  requireAdmin,
  sameOrigin,
  secret,
  sessionOptions,
  verifyPassword,
} from "@/lib/security";
import {
  articleSchema,
  contactSchema,
  dateSchema,
  serviceSchema,
  settingsSchema,
  timeSchema,
} from "@/lib/validation";
import type { Booking, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const ok = (data: unknown) => NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
const phoneValue = (value: string) => value.replace(/\D/g, "");
async function customerId() {
  const value = (await cookies()).get("sk_client")?.value;
  return value ? hash(value) : null;
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const route = (await context.params).path.join("/");
    const query = request.nextUrl.searchParams;
    if (route === "health") {
      db().prepare("SELECT 1").get();
      return ok({ status: "ok" });
    }
    if (route === "availability") {
      const service = query.get("service") || "consultation";
      if (query.has("date")) {
        const date = dateSchema.parse(query.get("date"));
        return ok({ date, slots: getSlots(date, service), timezone: "Europe/Riga" });
      }
      const month = z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .parse(query.get("month"));
      if (Math.abs(Date.parse(`${month}-01`) - Date.parse(today())) > 130 * 86400_000)
        throw new HttpError(400, "INVALID_DATE");
      const count = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
      const days: Record<string, number> = {};
      for (let i = 1; i <= count; i++) {
        const date = `${month}-${String(i).padStart(2, "0")}`;
        days[date] = getSlots(date, service).filter((s) => s.available).length;
      }
      return ok({ days, today: today(), timezone: "Europe/Riga" });
    }
    if (route === "account") {
      const customer = await customerId();
      const bookings = customer
        ? (db()
            .prepare(
              `SELECT ${bookingColumns} FROM bookings WHERE customer_id=? ORDER BY date DESC,start_min DESC`,
            )
            .all(customer) as Booking[])
        : [];
      return ok({ bookings: bookings.map(publicBooking) });
    }
    if (route === "calendar") {
      const booking = db()
        .prepare(`SELECT ${bookingColumns} FROM bookings WHERE id=? AND customer_id=?`)
        .get(query.get("id"), await customerId()) as Booking | undefined;
      if (!booking || booking.status === "cancelled") throw new HttpError(404, "NOT_FOUND");
      const stamp = (d: Date) =>
        d
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");
      const escape = (v: string) =>
        v.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      const s = getSettings();
      const calendar = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SKINSTINCT//Booking//LV",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${booking.id}@skinstinct`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(startDate(booking.date, booking.start_min))}`,
        `DTEND:${stamp(startDate(booking.date, booking.end_min))}`,
        `SUMMARY:${escape(`SKINSTINCT: ${booking.service_title}`)}`,
        `LOCATION:${escape([s.address, s.city].filter(Boolean).join(", "))}`,
        `STATUS:${booking.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
        "END:VEVENT",
        "END:VCALENDAR",
        "",
      ].join("\r\n");
      return new NextResponse(calendar, {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": "attachment; filename=skinstinct-visit.ics",
          "Cache-Control": "no-store",
        },
      });
    }
    if (route.startsWith("media/")) {
      const filename = route.slice(6);
      if (!/^[a-f0-9-]{36}\.webp$/.test(filename)) throw new HttpError(404, "NOT_FOUND");
      try {
        const buffer = await readFile(path.join(dataDir, "uploads", filename));
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        throw new HttpError(404, "NOT_FOUND");
      }
    }
    if (route === "admin") {
      await requireAdmin();
      return ok({
        settings: getSettings(),
        services: getServices(),
        articles: getArticles(),
        bookings: db()
          .prepare(
            `SELECT ${bookingColumns} FROM bookings ORDER BY date DESC,start_min DESC LIMIT 2000`,
          )
          .all(),
        inquiries: db()
          .prepare("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 1000")
          .all(),
        blocks: db()
          .prepare("SELECT * FROM blocks WHERE date>=? ORDER BY date,start_min")
          .all(today()),
      });
    }
    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, context: Context) {
  try {
    sameOrigin(request);
    const route = (await context.params).path.join("/");
    if (route === "auth/login") {
      rateLimit(request, "login", 5);
      const { password } = z
        .object({ password: z.string().min(1).max(200) })
        .parse(await jsonBody(request, 1000));
      if (!verifyPassword(password)) throw new HttpError(401, "INVALID_PASSWORD");
      const token = secret();
      const expires = Date.now() + 12 * 3600_000;
      db().prepare("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
      db()
        .prepare("INSERT INTO sessions(token_hash,expires_at) VALUES (?,?)")
        .run(hash(token), expires);
      (await cookies()).set("sk_admin", token, { ...sessionOptions, maxAge: 12 * 3600 });
      return ok({ ok: true });
    }
    if (route === "auth/logout") {
      const c = await cookies();
      const token = c.get("sk_admin")?.value;
      if (token) db().prepare("DELETE FROM sessions WHERE token_hash=?").run(hash(token));
      c.delete("sk_admin");
      return ok({ ok: true });
    }
    if (route === "bookings") {
      rateLimit(request, "booking", 6);
      const body = await jsonBody(request, 4000);
      const contact = contactSchema.parse(body);
      if (contact.website) throw new HttpError(400, "INVALID_DATA");
      const input = z
        .object({
          serviceId: z.string().max(80),
          date: dateSchema,
          time: timeSchema,
          lang: z.enum(["lv", "en", "ru"]).default("lv"),
        })
        .parse(body);
      if (!validHorizon(input.date)) throw new HttpError(400, "INVALID_DATE");
      const rawCustomer = (await cookies()).get("sk_client")?.value || secret();
      const code = randomBytes(8).toString("hex").toUpperCase();
      const id = randomUUID();
      const result = db()
        .transaction(() => {
          const service = getServices().find((s) => s.id === input.serviceId && s.active);
          if (!service) throw new HttpError(404, "SERVICE_NOT_FOUND");
          if (!getSlots(input.date, service.id).some((s) => s.time === input.time && s.available))
            throw new HttpError(409, "SLOT_UNAVAILABLE");
          const start = timeMinute(input.time);
          db()
            .prepare(
              "INSERT INTO bookings(id,customer_id,code_hash,service_id,service_title,date,start_min,end_min,name,phone,email,lang,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            )
            .run(
              id,
              hash(rawCustomer),
              hash(code),
              service.id,
              service.title[input.lang],
              input.date,
              start,
              start + service.duration,
              contact.name,
              contact.phone,
              contact.email.toLowerCase(),
              input.lang,
              new Date().toISOString(),
            );
          return db()
            .prepare(`SELECT ${bookingColumns} FROM bookings WHERE id=?`)
            .get(id) as Booking;
        })
        .immediate();
      (await cookies()).set("sk_client", rawCustomer, { ...sessionOptions, maxAge: 365 * 86400 });
      return ok({ booking: publicBooking(result), code: code.match(/.{1,4}/g)!.join("-") });
    }
    if (route === "account") {
      rateLimit(request, "lookup", 8);
      const input = z
        .object({ code: z.string().min(8).max(40), contact: z.string().min(3).max(200) })
        .parse(await jsonBody(request, 1000));
      const code = input.code.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
      const booking = db()
        .prepare(`SELECT ${bookingColumns} FROM bookings WHERE code_hash=?`)
        .get(hash(code)) as Booking | undefined;
      const contact = input.contact.trim().toLowerCase();
      if (
        !booking ||
        !(
          (booking.email && booking.email.toLowerCase() === contact) ||
          (booking.phone && phoneValue(booking.phone) === phoneValue(contact))
        )
      )
        throw new HttpError(404, "BOOKING_NOT_FOUND");
      return ok({ bookings: [publicBooking(booking)] });
    }
    if (route === "bookings/cancel") {
      rateLimit(request, "cancel", 10);
      const body = z
        .object({
          id: z.uuid(),
          code: z.string().max(40).optional(),
          contact: z.string().max(200).optional(),
        })
        .parse(await jsonBody(request, 1000));
      const booking = db()
        .prepare(`SELECT ${bookingColumns} FROM bookings WHERE id=?`)
        .get(body.id) as Booking | undefined;
      if (!booking) throw new HttpError(404, "NOT_FOUND");
      let authorized = booking.customer_id === (await customerId());
      if (!authorized && body.code && body.contact) {
        const code = body.code.replace(/[^a-fA-F0-9]/g, "").toUpperCase();
        const matched = db()
          .prepare("SELECT 1 FROM bookings WHERE id=? AND code_hash=?")
          .get(body.id, hash(code));
        authorized =
          !!matched &&
          !!(
            (booking.email && booking.email.toLowerCase() === body.contact.trim().toLowerCase()) ||
            (booking.phone && phoneValue(booking.phone) === phoneValue(body.contact))
          );
      }
      if (!authorized) throw new HttpError(403, "AUTH_REQUIRED");
      if (!canCancel(booking)) throw new HttpError(400, "CANCEL_WINDOW");
      db().prepare("UPDATE bookings SET status='cancelled' WHERE id=?").run(body.id);
      return ok({ ok: true });
    }
    if (route === "inquiries") {
      rateLimit(request, "inquiry", 5);
      const body = await jsonBody(request, 5000);
      const contact = contactSchema.parse(body);
      if (contact.website) return ok({ ok: true });
      const message = z.string().trim().max(2000).default("").parse(body.message);
      db()
        .prepare(
          "INSERT INTO inquiries(id,name,email,phone,message,created_at) VALUES (?,?,?,?,?,?)",
        )
        .run(
          randomUUID(),
          contact.name,
          contact.email.toLowerCase(),
          contact.phone,
          message,
          new Date().toISOString(),
        );
      return ok({ ok: true });
    }
    if (route.startsWith("admin/")) {
      await requireAdmin();
      if (route === "admin/upload") {
        const bytes = await limitedBody(request, 8_500_000);
        const form = await new Response(bytes, {
          headers: { "Content-Type": request.headers.get("content-type") || "" },
        }).formData();
        const file = form.get("file");
        if (!(file instanceof File) || file.size > 8_000_000 || file.size === 0)
          throw new HttpError(400, "INVALID_IMAGE");
        const input = Buffer.from(await file.arrayBuffer());
        let output: Buffer;
        try {
          output = await sharp(input, { limitInputPixels: 40_000_000 })
            .rotate()
            .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();
        } catch {
          throw new HttpError(400, "INVALID_IMAGE");
        }
        const filename = `${randomUUID()}.webp`;
        await mkdir(path.join(dataDir, "uploads"), { recursive: true });
        await writeFile(path.join(dataDir, "uploads", filename), output);
        return ok({ url: `/api/media/${filename}` });
      }
      if (route === "admin/content") {
        const input = z
          .object({ type: z.enum(["settings", "services", "articles"]), data: z.unknown() })
          .parse(await jsonBody(request, 800_000));
        const value =
          input.type === "settings"
            ? settingsSchema.parse(input.data)
            : input.type === "services"
              ? z
                  .array(serviceSchema)
                  .max(40)
                  .refine((a) => new Set(a.map((s) => s.id)).size === a.length)
                  .parse(input.data)
              : z
                  .array(articleSchema)
                  .max(300)
                  .refine(
                    (a) =>
                      new Set(a.map((s) => s.slug)).size === a.length &&
                      new Set(a.map((s) => s.id)).size === a.length,
                  )
                  .parse(input.data);
        setContent(input.type, value);
        return ok({ ok: true });
      }
      if (route === "admin/booking") {
        const input = z
          .object({
            id: z.uuid(),
            status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
          })
          .parse(await jsonBody(request, 1000));
        db()
          .transaction(() => {
            const booking = db()
              .prepare(`SELECT ${bookingColumns} FROM bookings WHERE id=?`)
              .get(input.id) as Booking | undefined;
            if (!booking) throw new HttpError(404, "NOT_FOUND");
            if (booking.status === "cancelled" && input.status !== "cancelled") {
              const buffer = getSettings().bufferMinutes;
              const overlap = db()
                .prepare(
                  "SELECT 1 FROM bookings WHERE date=? AND id!=? AND status!='cancelled' AND start_min<? AND end_min>? LIMIT 1",
                )
                .get(
                  booking.date,
                  booking.id,
                  booking.end_min + buffer,
                  booking.start_min - buffer,
                );
              const blocked = db()
                .prepare("SELECT 1 FROM blocks WHERE date=? AND start_min<? AND end_min>? LIMIT 1")
                .get(booking.date, booking.end_min, booking.start_min);
              if (overlap || blocked) throw new HttpError(409, "SLOT_UNAVAILABLE");
            }
            db().prepare("UPDATE bookings SET status=? WHERE id=?").run(input.status, input.id);
          })
          .immediate();
        return ok({ ok: true });
      }
      if (route === "admin/inquiry") {
        const input = z
          .object({ id: z.uuid(), status: z.enum(["new", "contacted", "closed"]) })
          .parse(await jsonBody(request, 1000));
        db().prepare("UPDATE inquiries SET status=? WHERE id=?").run(input.status, input.id);
        return ok({ ok: true });
      }
      if (route === "admin/block") {
        const input = z
          .object({
            date: dateSchema,
            start: timeSchema,
            end: timeSchema,
            note: z.string().max(200),
          })
          .parse(await jsonBody(request, 1000));
        if (input.start >= input.end) throw new HttpError(400, "INVALID_DATA");
        db()
          .prepare("INSERT INTO blocks(id,date,start_min,end_min,note) VALUES (?,?,?,?,?)")
          .run(
            randomUUID(),
            input.date,
            timeMinute(input.start),
            timeMinute(input.end),
            input.note,
          );
        return ok({ ok: true });
      }
      if (route === "admin/unblock") {
        const { id } = z.object({ id: z.uuid() }).parse(await jsonBody(request, 500));
        db().prepare("DELETE FROM blocks WHERE id=?").run(id);
        return ok({ ok: true });
      }
      if (route === "admin/password") {
        rateLimit(request, "password", 5);
        const input = z
          .object({ current: z.string().max(200), password: z.string().min(12).max(200) })
          .parse(await jsonBody(request, 1500));
        if (!verifyPassword(input.current)) throw new HttpError(401, "INVALID_PASSWORD");
        const salt = randomBytes(16).toString("hex");
        setContent(
          "adminPasswordHash",
          `${salt}:${scryptSync(input.password, salt, 64).toString("hex")}`,
        );
        const token = (await cookies()).get("sk_admin")?.value;
        db()
          .prepare("DELETE FROM sessions WHERE token_hash!=?")
          .run(hash(token || ""));
        return ok({ ok: true });
      }
    }
    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    return fail(error);
  }
}
