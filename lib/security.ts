import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
export const secret = () => randomBytes(32).toString("hex");
export const sessionOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
export async function isAdmin() {
  const token = (await cookies()).get("sk_admin")?.value;
  if (!token) return false;
  return !!db().prepare("SELECT 1 FROM sessions WHERE token_hash=? AND expires_at>?").get(hash(token), Date.now());
}
export async function requireAdmin() { if (!(await isAdmin())) throw new HttpError(401, "AUTH_REQUIRED"); }
export function verifyPassword(password: string) {
  const row = db().prepare("SELECT value FROM content WHERE key='adminPasswordHash'").get() as { value: string } | undefined;
  const stored = row ? JSON.parse(row.value) as string : process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  const [salt, expected] = stored.split(":");
  if (!salt || !expected || !/^[a-f0-9]{128}$/.test(expected)) return false;
  const actual = scryptSync(password, salt, 64);
  const target = Buffer.from(expected, "hex");
  return actual.length === target.length && timingSafeEqual(actual, target);
}
export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  const allowed = [target.origin, process.env.SITE_URL, process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : ""].filter(Boolean);
  if (!origin || !allowed.includes(origin)) throw new HttpError(403, "INVALID_ORIGIN");
}
export function rateLimit(request: NextRequest, scope: string, max = 8, windowMs = 15 * 60 * 1000) {
  const address = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "local";
  const key = hash(`${scope}:${address}`);
  const now = Date.now();
  const conn = db();
  const result = conn.prepare(`INSERT INTO limits(key,count,expires_at) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<? THEN 1 ELSE count+1 END,
    expires_at=CASE WHEN expires_at<? THEN excluded.expires_at ELSE expires_at END RETURNING count`).get(key, now + windowMs, now, now) as { count: number };
  if (result.count > max) throw new HttpError(429, "TOO_MANY_REQUESTS");
  conn.prepare("DELETE FROM limits WHERE expires_at<?").run(now - windowMs);
}
export async function limitedBody(request: NextRequest, max: number) {
  if (Number(request.headers.get("content-length") || 0) > max) throw new HttpError(413, "TOO_LARGE");
  const chunks: Uint8Array[]=[]; let size=0;
  const reader=request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  try {
    while(true) { const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw new HttpError(413,"TOO_LARGE");}chunks.push(value); }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks,size);
}
export async function jsonBody(request: NextRequest, max = 100_000) {
  const text = (await limitedBody(request,max)).toString("utf8");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "INVALID_DATA"); }
}
export function fail(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error && typeof error === "object" && "issues" in error) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });
  console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
  return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
}
