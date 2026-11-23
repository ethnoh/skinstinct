import { fromZonedTime } from "date-fns-tz";
import { db, getServices, getSettings } from "./db";
import { HttpError } from "./security";
import type { Block, Booking } from "./types";
import { BOOKING_START } from './opening-offer';
import {isPublicHoliday} from './holidays';

export const TIMEZONE = "Europe/Riga";
export function today() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export const minuteTime = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export const timeMinute = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const startDate = (date: string, minute: number) =>
  fromZonedTime(`${date}T${minuteTime(minute)}:00`, TIMEZONE);
export function validHorizon(date: string) {
  const days = (Date.parse(date) - Date.parse(today())) / 86_400_000;
  return days >= 0 && days <= 90;
}
export function getSlots(date: string, serviceId: string) {
  const settings = getSettings();
  const service = getServices().find((s) => s.id === serviceId && s.active && s.bookable !== false);
  if (!service) throw new HttpError(404, "SERVICE_NOT_FOUND");
  if (!settings.bookingEnabled || !validHorizon(date) || date < BOOKING_START || isPublicHoliday(date) || service.duration < 15) return [];
  const opening=db().prepare('SELECT start_min,end_min FROM opening_days WHERE date=?').get(date) as {start_min:number;end_min:number}|undefined;
  const day = opening ? {enabled:true,start:minuteTime(opening.start_min),end:minuteTime(opening.end_min)} : settings.schedule[new Date(`${date}T12:00:00Z`).getUTCDay()];
  if (!day?.enabled) return [];
  const bookings = db()
    .prepare(
      "SELECT start_min,end_min FROM bookings WHERE date=? AND status IN ('pending','confirmed','completed')",
    )
    .all(date) as Pick<Booking, "start_min" | "end_min">[];
  const blocks = db()
    .prepare("SELECT start_min,end_min FROM blocks WHERE date=?")
    .all(date) as Block[];
  const slots: { time: string; available: boolean }[] = [];
  const candidates = new Set<number>();
  for (let minute = timeMinute(day.start); minute + service.duration <= timeMinute(day.end); minute += 15) candidates.add(minute);
  for (const booking of bookings) {
    candidates.add(booking.end_min + settings.bufferMinutes);
    candidates.add(booking.start_min - settings.bufferMinutes - service.duration);
  }
  for (const minute of [...candidates].sort((a,b) => a-b)) {
    if (minute < timeMinute(day.start) || minute + service.duration > timeMinute(day.end)) continue;
    if (startDate(date, minute).getTime() < Date.now() + 60 * 60 * 1000) continue;
    const end = minute + service.duration;
    const occupied =
      bookings.some(
        (b) =>
          minute < b.end_min + settings.bufferMinutes && end + settings.bufferMinutes > b.start_min,
      ) || blocks.some((b) => minute < b.end_min && end > b.start_min);
    slots.push({ time: minuteTime(minute), available: !occupied });
  }
  return slots;
}
export function canCancel(booking: Booking) {
  return (
    ["pending", "confirmed"].includes(booking.status) &&
    startDate(booking.date, booking.start_min).getTime() - Date.now() >=
      getSettings().cancellationHours * 3600_000
  );
}
export function publicBooking(booking: Booking) {
  const { customer_id: _customer, ...safe } = booking;
  return { ...safe, canCancel: canCancel(booking) };
}
export const bookingColumns =
  "id,customer_id,service_id,service_title,date,start_min,end_min,name,phone,email,status,lang,created_at,quoted_price_min,quoted_price_max";
