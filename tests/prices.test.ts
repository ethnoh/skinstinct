import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { priceCatalogue, priceBookingNotice } from "../lib/price-catalogue";
import { initialSettings } from "../lib/content";
import { servicePrice, serviceDuration } from "../lib/service-display";
import { serviceSchema } from "../lib/validation";
import { priceForDate } from '../lib/opening-offer';

test('introductory prices follow visit dates and preserve price ranges', () => {
  const service = {price:120,priceMax:240};
  assert.deepEqual(priceForDate(service,'2026-11-30'),service);
  assert.deepEqual(priceForDate(service,'2026-12-01'),{price:110,priceMax:230});
  assert.deepEqual(priceForDate(service,'2026-12-31'),{price:110,priceMax:230});
  assert.deepEqual(priceForDate(service,'2027-01-01'),service);
  assert.deepEqual(priceForDate({...service,bookable:false},'2026-12-01'),service);
});

test("price ranges stay ranges, zero stays free, and cents are not rounded away", () => {
  assert.equal(servicePrice({ price: 120, priceMax: 240 }, "lv").replace(/\s/g, ""), "120–240€");
  assert.equal(servicePrice({ price: 120, priceMax: 240 }, "en"), "€120–240");
  assert.match(servicePrice({ price: 0 }, "lv"), /0/);
  assert.match(servicePrice({ price: 60.5 }, "lv"), /60,50/);
  assert.equal(serviceDuration({ duration: 60, durationMin: 40 }), "40–60 min");
  assert.equal(serviceSchema.safeParse({ ...priceCatalogue[0], priceMax: 30 }).success, false);
  assert.equal(serviceSchema.safeParse({ ...priceCatalogue[0], durationMin: 90 }).success, false);
});

test("all published treatments have valid prices and confirmed schedulable durations", () => {
  assert.equal(priceCatalogue.length, 11);
  assert.equal(new Set(priceCatalogue.map((s) => s.id)).size, 11);
  for (const service of priceCatalogue) {
    assert.ok(
      serviceSchema.safeParse(service).success,
      `Confirm duration and price: ${service.id}`,
    );
    assert.notEqual(service.price, null);
  }
});

test("price release retires old entries without deleting them, preserves uploads, and runs only once", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "skinstinct-prices-"));
  process.env.DATA_DIR = directory;
  const original = {
    ...priceCatalogue[0],
    id: "consultation",
    title: { lv: "Agrākā vizīte", en: "Earlier visit", ru: "Прежняя запись" },
  };
  const connection = new Database(path.join(directory, "skinstinct.db"));
  connection.exec("CREATE TABLE content (key TEXT PRIMARY KEY,value TEXT NOT NULL)");
  connection
    .prepare("INSERT INTO content VALUES ('services',?)")
    .run(
      JSON.stringify([
        original,
        { ...priceCatalogue[4], duration: 60, price: 999, image: "/api/media/owner.webp" },
      ]),
    );
  connection
    .prepare("INSERT INTO content VALUES ('settings',?)")
    .run(
      JSON.stringify({
        ...initialSettings,
        bookingNotice: {
          ...initialSettings.bookingNotice,
          lv: "Cenu saskaņosim pirms vizītes.",
          en: "Owner's custom notice",
        },
      }),
    );
  connection.close();
  const { db, getServices, getSettings, setContent } = await import("../lib/db");
  try {
    const services = getServices();
    assert.equal(services.filter((s) => s.active).length, 11);
    assert.equal(services.find((s) => s.id === "consultation")?.active, false);
    assert.equal(services.find((s) => s.id === "consultation")?.title.lv, original.title.lv);
    assert.equal(services.find((s) => s.id === "diagnostics")?.price, 30);
    assert.equal(services.find((s) => s.id === "diagnostics")?.image, "/api/media/owner.webp");
    assert.equal(getSettings().bookingNotice.lv, priceBookingNotice.lv);
    assert.equal(getSettings().bookingNotice.en, "Owner's custom notice");
    const settings = getSettings();
    setContent("settings", {
      ...settings,
      bufferMinutes: 0,
      schedule: Array.from({ length: 7 }, () => ({ enabled: true, start: "10:00", end: "12:00" })),
    });
    const { getSlots, today } = await import("../lib/booking");
    const date = new Date((today() < '2026-12-01' ? '2026-12-01' : today()) + "T12:00:00Z");
    date.setUTCDate(date.getUTCDate() + 1);
    assert.deepEqual(
      getSlots(date.toISOString().slice(0, 10), "skinstinct-signature").map((s) => s.time),
      ["10:00", "10:15", "10:30"],
      "reserve the full 90 minutes, not the displayed 60-minute minimum",
    );
    assert.throws(() => getSlots('2026-12-01','diagnostics'), /SERVICE_NOT_FOUND/);
    assert.deepEqual(getSlots('2026-11-30','youth-facial'),[]);
    setContent('settings',{...getSettings(),bufferMinutes:15,schedule:Array.from({length:7},()=>({enabled:true,start:'10:00',end:'14:00'}))});
    db().prepare("INSERT INTO bookings(id,customer_id,code_hash,service_id,service_title,date,start_min,end_min,name,created_at) VALUES ('gap-test','test','test','facial-lymphatic-massage','Test',?,600,640,'Test',?)").run(date.toISOString().slice(0,10),new Date().toISOString());
    const gapSlots = getSlots(date.toISOString().slice(0,10),'mesotherapy');
    assert.equal(gapSlots.find(s => s.time === '10:45')?.available,false);
    assert.equal(gapSlots.find(s => s.time === '10:55')?.available,true,'exact 15-minute gap after a 40-minute appointment');
    const edited = services
      .filter((s) => s.id !== "express-glow")
      .map((s) => (s.id === "youth-facial" ? { ...s, price: 65, active: false } : s));
    setContent("services", edited);
    assert.deepEqual(getServices(), edited);
  } finally {
    db().close();
  }
});
