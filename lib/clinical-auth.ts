import { cookies } from "next/headers";
import { clinicalConfigured } from "./clinical-store";
import { hash, HttpError, requireAdmin } from "./security";

export async function requireClinical() {
  await requireAdmin();
  if (!clinicalConfigured()) throw new HttpError(503, "CLINICAL_NOT_CONFIGURED");
  const admin = (await cookies()).get("sk_admin")?.value;
  if (!admin) throw new HttpError(401, "AUTH_REQUIRED");
  return { session: hash(admin) };
}
