import { cookies } from "next/headers";
import { clinicalConfigured, clinicalDb } from "./clinical-store";
import { hash, HttpError, requireAdmin } from "./security";

export const CLINICAL_SESSION_MS = 30 * 60_000;
export async function clinicalSession() {
  await requireAdmin();
  const c = await cookies(),
    admin = c.get("sk_admin")?.value,
    token = c.get("sk_clinical")?.value;
  if (!admin || !token) return null;
  const row = clinicalDb()
    .prepare(
      "SELECT expires_at FROM clinical_sessions WHERE token_hash=? AND admin_hash=? AND expires_at>?",
    )
    .get(hash(token), hash(admin), Date.now()) as { expires_at: number } | undefined;
  return row ? { session: hash(token), expiresAt: row.expires_at } : null;
}
export async function requireClinical() {
  const session = await clinicalSession();
  if (!session) throw new HttpError(401, "CLINICAL_LOCKED");
  if (!clinicalConfigured()) throw new HttpError(503, "CLINICAL_NOT_CONFIGURED");
  return session;
}
