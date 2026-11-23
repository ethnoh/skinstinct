import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { initialArticles, initialCopy, initialServices, initialSettings } from "./content";
import type { Article, Localized, Service, SiteSettings } from "./types";
import { addressCase } from "./address-case";
import { journalArticles } from "./journal-content";
import { journalTopicArticles } from './journal-topics';
import { applyPriceRelease, introductoryTreatment, priceBookingNotice, priceCatalogue } from "./price-catalogue";
import {localSearchDescription,previousSearchDescription,studioPhone,studioSchedule} from './studio-details';
import {cleanJournalBody} from './journal-cleanup';
import {procedureImages} from './procedure-images';

export const dataDir = process.env.DATA_DIR || path.join(process.cwd(), ".data");
let instance: Database.Database | undefined;
let lastCleanup = 0;
function cleanup(connection: Database.Database) {
  if (Date.now() - lastCleanup < 3600_000) return;
  const bookingCutoff = new Date();
  bookingCutoff.setUTCFullYear(bookingCutoff.getUTCFullYear() - 1);
  const messageCutoff = new Date();
  messageCutoff.setUTCMonth(messageCutoff.getUTCMonth() - 6);
  connection
    .prepare("DELETE FROM bookings WHERE date<?")
    .run(bookingCutoff.toISOString().slice(0, 10));
  connection.prepare("DELETE FROM inquiries WHERE created_at<?").run(messageCutoff.toISOString());
  connection.prepare("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
  connection.prepare("DELETE FROM limits WHERE expires_at<?").run(Date.now() - 15 * 60_000);
  lastCleanup = Date.now();
}
export function db() {
  if (instance) {
    cleanup(instance);
    return instance;
  }
  mkdirSync(dataDir, { recursive: true });
  instance = new Database(path.join(dataDir, "skinstinct.db"));
  instance.pragma("journal_mode = WAL");
  instance.pragma("busy_timeout = 5000");
  instance.pragma("foreign_keys = ON");
  instance.exec(`
    CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, customer_id TEXT NOT NULL, code_hash TEXT NOT NULL UNIQUE,
      service_id TEXT NOT NULL, service_title TEXT NOT NULL,
      date TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL,
      name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','cancelled','completed')),
      lang TEXT NOT NULL DEFAULT 'lv', created_at TEXT NOT NULL,
      CHECK (start_min >= 0 AND end_min > start_min AND end_min <= 1440)
    );
    CREATE INDEX IF NOT EXISTS booking_day ON bookings(date, status);
    CREATE INDEX IF NOT EXISTS booking_customer ON bookings(customer_id);
    CREATE TABLE IF NOT EXISTS blocks (id TEXT PRIMARY KEY, date TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL, note TEXT NOT NULL DEFAULT '');
    CREATE INDEX IF NOT EXISTS block_day ON blocks(date);
    CREATE TABLE IF NOT EXISTS opening_days (date TEXT PRIMARY KEY,start_min INTEGER NOT NULL,end_min INTEGER NOT NULL,CHECK(start_min>=0 AND end_min>start_min AND end_min<=1440));
    CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
  `);
  const insert = instance.prepare("INSERT OR IGNORE INTO content(key,value) VALUES (?,?)");
  const bookingFields = instance.prepare('PRAGMA table_info(bookings)').all() as {name: string}[];
  for (const field of ['quoted_price_min', 'quoted_price_max']) {
    if (!bookingFields.some(column => column.name === field)) instance.exec(`ALTER TABLE bookings ADD COLUMN ${field} REAL`);
  }
  insert.run("settings", JSON.stringify(initialSettings));
  insert.run("services", JSON.stringify(initialServices));
  insert.run("articles", JSON.stringify(initialArticles));
  // Apply this editorial release once, preserving subsequent admin edits and deletions.
  instance.transaction(() => {
    if (instance!.prepare("SELECT 1 FROM content WHERE key = ?").get("journal-release-2026-11"))
      return;
    const row = instance!.prepare("SELECT value FROM content WHERE key = 'articles'").get() as {
      value: string;
    };
    const articles = JSON.parse(row.value) as Article[];
    const additions = journalArticles.filter(
      (article) =>
        !articles.some((saved) => saved.id === article.id || saved.slug === article.slug),
    );
    instance!
      .prepare("UPDATE content SET value = ? WHERE key = 'articles'")
      .run(JSON.stringify([...articles, ...additions]));
    insert.run("journal-release-2026-11", "true");
  })();
  instance.transaction(() => {
    if (instance!.prepare("SELECT 1 FROM content WHERE key = ?").get("price-release-2026-11-23"))
      return;
    const row = instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {
      value: string;
    };
    instance!
      .prepare("UPDATE content SET value=? WHERE key='services'")
      .run(JSON.stringify(applyPriceRelease(JSON.parse(row.value))));
    const settingsRow = instance!
      .prepare("SELECT value FROM content WHERE key='settings'")
      .get() as { value: string };
    const settings = JSON.parse(settingsRow.value) as SiteSettings;
    settings.bufferMinutes = 15;
    settings.bookingEnabled = true;
    const outdated = {
      lv: "Cenu saskaņosim pirms vizītes.",
      en: "We'll agree on the price before your visit.",
      ru: "Стоимость согласуем до визита.",
    };
    for (const lang of ["lv", "en", "ru"] as const) {
      if (settings.bookingNotice?.[lang]?.includes(outdated[lang]))
        settings.bookingNotice[lang] = priceBookingNotice[lang];
    }
    const previousIntro = {
      lv: "Sāc ar iepazīšanās vizīti.",
      en: "Start with an introductory visit.",
      ru: "Начни со знакомства с Твоей кожей.",
    };
    const newIntro = {
      lv: "Izvēlies piemērotāko pirmreizējo procedūru — ādas stāvokli izvērtēsim vizītes laikā.",
      en: "Choose a first treatment — we will assess your skin during the visit.",
      ru: "Выбери первую процедуру — состояние кожи оценим во время визита.",
    };
    for (const lang of ["lv", "en", "ru"] as const) {
      if (settings.copy?.faq1Answer?.[lang])
        settings.copy.faq1Answer[lang] = settings.copy.faq1Answer[lang].replace(
          previousIntro[lang],
          newIntro[lang],
        );
    }
    const oldMetrics = { lv: "kopšanas virzieni", en: "care directions", ru: "направления ухода" };
    for (const lang of ["lv", "en", "ru"] as const) {
      if (settings.copy?.rhythmServices?.[lang] === oldMetrics[lang])
        settings.copy.rhythmServices[lang] = initialCopy.rhythmServices[lang];
    }
    instance!
      .prepare("UPDATE content SET value=? WHERE key='settings'")
      .run(JSON.stringify(settings));
    insert.run("price-release-2026-11-23", "true");
  })();
  instance.transaction(() => {
    const marker = 'introductory-treatment-release-2026-11-23';
    if (instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row = instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {value:string};
    const services = JSON.parse(row.value) as Service[];
    if (!services.some(service => service.id === introductoryTreatment.id)) {
      instance!.prepare("UPDATE content SET value=? WHERE key='services'").run(JSON.stringify([introductoryTreatment,...services]));
    }
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='local-search-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='settings'").get() as {value:string};
    const settings=JSON.parse(row.value) as SiteSettings;
    if(!settings.phone?.trim()) settings.phone=studioPhone;
    for(const lang of ['lv','en','ru'] as const){
      if(settings.seoDescription?.[lang]===previousSearchDescription[lang]) settings.seoDescription[lang]=localSearchDescription[lang];
    }
    instance!.prepare("UPDATE content SET value=? WHERE key='settings'").run(JSON.stringify(settings));
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='journal-cleanup-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='articles'").get() as {value:string};
    const articles=JSON.parse(row.value) as Article[];
    for(const article of articles) for(const lang of ['lv','en','ru'] as const){
      if(typeof article.body?.[lang]==='string') article.body[lang]=cleanJournalBody(article.body[lang]);
    }
    instance!.prepare("UPDATE content SET value=? WHERE key='articles'").run(JSON.stringify(articles));
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='studio-hours-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='settings'").get() as {value:string};
    const settings=JSON.parse(row.value) as SiteSettings;
    settings.schedule=studioSchedule;
    instance!.prepare("UPDATE content SET value=? WHERE key='settings'").run(JSON.stringify(settings));
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='procedure-images-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {value:string};
    const services=JSON.parse(row.value) as Service[];
    for(const service of services){
      const replacement=procedureImages[service.id];
      if(replacement&&service.image===replacement.previous)service.image=replacement.image;
    }
    instance!.prepare("UPDATE content SET value=? WHERE key='services'").run(JSON.stringify(services));
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='procedure-longevity-glow-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {value:string};
    const services=JSON.parse(row.value) as Service[];
    const service=services.find(item=>item.id==='anti-age-longevity');
    if(service?.image==='/images/procedure-longevity-pink-v3.webp') {
      service.image=procedureImages['anti-age-longevity'].image;
      instance!.prepare("UPDATE content SET value=? WHERE key='services'").run(JSON.stringify(services));
    }
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='procedure-youth-dewy-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {value:string};
    const services=JSON.parse(row.value) as Service[];
    const service=services.find(item=>item.id==='youth-facial');
    if(service && ['/images/procedure-youth-pink-v2.webp','/images/procedure-youth-client-v3.webp'].includes(service.image)) {
      service.image=procedureImages['youth-facial'].image;
      instance!.prepare("UPDATE content SET value=? WHERE key='services'").run(JSON.stringify(services));
    }
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='journal-topics-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='articles'").get() as {value:string};
    const articles=JSON.parse(row.value) as Article[];
    const additions=journalTopicArticles.filter(article=>!articles.some(saved=>saved.id===article.id||saved.slug===article.slug));
    instance!.prepare("UPDATE content SET value=? WHERE key='articles'").run(JSON.stringify([...articles,...additions]));
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='youth-description-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const row=instance!.prepare("SELECT value FROM content WHERE key='services'").get() as {value:string};
    const services=JSON.parse(row.value) as Service[];
    const service=services.find(item=>item.id==='youth-facial');
    const updated=priceCatalogue.find(item=>item.id==='youth-facial');
    if(service && updated) {
      service.description=updated.description;
      instance!.prepare("UPDATE content SET value=? WHERE key='services'").run(JSON.stringify(services));
    }
    insert.run(marker,'true');
  })();
  instance.transaction(() => {
    const marker='owner-december-closures-release-2026-11-23';
    if(instance!.prepare('SELECT 1 FROM content WHERE key=?').get(marker)) return;
    const block=instance!.prepare('INSERT INTO blocks(id,date,start_min,end_min,note) VALUES (?,?,?,?,?)');
    block.run('b26a8b1e-822a-4ab5-80ac-bc183d66b818','2026-12-18',870,1440,'Aizņemta no 14:30');
    for(const day of [23,24,25,28,29,31]) {
      block.run(`b26a8b1e-822a-4ab5-80ac-bc183d66b8${day}`,`2026-12-${day}`,0,1440,'Brīvdiena');
    }
    insert.run(marker,'true');
  })();
  cleanup(instance);
  return instance;
}
export function getContent<T>(key: string): T {
  return JSON.parse(
    (db().prepare("SELECT value FROM content WHERE key = ?").get(key) as { value: string }).value,
  );
}
export function setContent(key: string, value: unknown) {
  db()
    .prepare(
      "INSERT INTO content(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    )
    .run(key, JSON.stringify(value));
}
export const getSettings = () => {
  const saved = getContent<SiteSettings>("settings");
  const settings = { ...initialSettings, ...saved };
  if (!settings.address?.trim()) settings.address = initialSettings.address;
  // Upgrade the retired bundled portraits while retaining custom owner uploads.
  if (
    [
      "/images/valerija.webp",
      "/images/valerija-v2.webp",
      "/images/valerija-original-white.jpeg",
    ].includes(settings.aboutImage)
  ) {
    settings.aboutImage = initialSettings.aboutImage;
  }
  for (const key of Object.keys(initialSettings) as (keyof SiteSettings)[]) {
    const value = initialSettings[key];
    if (value && typeof value === "object" && "lv" in value) {
      Object.assign(settings, {
        [key]: mergeLocalized(saved[key] as Localized, value as Localized),
      });
    }
  }
  settings.copy = Object.fromEntries(
    Object.entries({ ...initialCopy, ...saved.copy }).map(([key, value]) => [
      key,
      mergeLocalized(value, initialCopy[key]),
    ]),
  );
  return settings;
};

// Extend older saved content without overwriting the owner's existing translations.
function mergeLocalized(saved: Localized | undefined, defaults?: Localized): Localized {
  const lv = saved?.lv ?? defaults?.lv ?? "";
  return {
    lv: addressCase(lv, "lv"),
    en: saved?.en ?? defaults?.en ?? lv,
    ru: addressCase(saved?.ru ?? defaults?.ru ?? lv, "ru"),
  };
}
export const getServices = () =>
  getContent<Service[]>("services").map((service) => {
    const defaults = initialServices.find((item) => item.id === service.id);
    return {
      ...service,
      title: mergeLocalized(service.title, defaults?.title),
      category: mergeLocalized(service.category, defaults?.category),
      description: mergeLocalized(service.description, defaults?.description),
    };
  });
export const getArticles = () =>
  getContent<Article[]>("articles").map((article) => {
    const defaults = initialArticles.find((item) => item.id === article.id);
    return {
      ...article,
      image:
        article.id === "intro" &&
        [
          "/images/valerija.webp",
          "/images/valerija-v2.webp",
          "/images/journal-instagram-intro.jpg",
        ].includes(article.image)
          ? "/images/journal-studio.webp"
          : article.image === "/images/journal-care.webp"
            ? "/images/valerija-studio-care-v4.webp"
            : article.image,
      title: mergeLocalized(article.title, defaults?.title),
      category: mergeLocalized(article.category, defaults?.category),
      excerpt: mergeLocalized(article.excerpt, defaults?.excerpt),
      body: mergeLocalized(article.body, defaults?.body),
    };
  });
