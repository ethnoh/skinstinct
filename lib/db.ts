import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { initialArticles, initialCopy, initialServices, initialSettings } from "./content";
import type { Article, Service, SiteSettings } from "./types";

export const dataDir = process.env.DATA_DIR || path.join(process.cwd(), ".data");
let instance: Database.Database | undefined;
let lastCleanup=0;
function cleanup(connection:Database.Database) {
  if(Date.now()-lastCleanup<3600_000)return;
  const bookingCutoff=new Date();bookingCutoff.setUTCFullYear(bookingCutoff.getUTCFullYear()-1);
  const messageCutoff=new Date();messageCutoff.setUTCMonth(messageCutoff.getUTCMonth()-6);
  connection.prepare("DELETE FROM bookings WHERE date<?").run(bookingCutoff.toISOString().slice(0,10));
  connection.prepare("DELETE FROM inquiries WHERE created_at<?").run(messageCutoff.toISOString());
  connection.prepare("DELETE FROM sessions WHERE expires_at<?").run(Date.now());
  connection.prepare("DELETE FROM limits WHERE expires_at<?").run(Date.now()-15*60_000);
  lastCleanup=Date.now();
}
export function db() {
  if (instance) { cleanup(instance); return instance; }
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
    CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
  `);
  const insert = instance.prepare("INSERT OR IGNORE INTO content(key,value) VALUES (?,?)");
  insert.run("settings", JSON.stringify(initialSettings));
  insert.run("services", JSON.stringify(initialServices));
  insert.run("articles", JSON.stringify(initialArticles));
  cleanup(instance);
  return instance;
}
export function getContent<T>(key: string): T {
  return JSON.parse((db().prepare("SELECT value FROM content WHERE key = ?").get(key) as { value: string }).value);
}
export function setContent(key: string, value: unknown) {
  db().prepare("INSERT INTO content(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(key, JSON.stringify(value));
}
export const getSettings = () => { const saved=getContent<SiteSettings>("settings"); return {...initialSettings,...saved,copy:{...initialCopy,...saved.copy}}; };
export const getServices = () => getContent<Service[]>("services");
export const getArticles = () => getContent<Article[]>("articles");
