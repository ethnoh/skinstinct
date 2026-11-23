import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { clinicalSession, requireClinical, CLINICAL_SESSION_MS } from "@/lib/clinical-auth";
import {
  clinicalAudit,
  clinicalBackup,
  clinicalConfigured,
  clinicalDb,
  listClinicalClients,
  getClinicalClient,
  listClinicalVisits,
  listClinicalDocuments,
  saveClinicalClient,
  saveClinicalVisit,
  addClinicalDocument,
  getClinicalDocument,
  clinicalHistory,
  clinicalRevision,
} from "@/lib/clinical-store";
import { clientCardSchema, clinicalVisitSchema } from "@/lib/clinical-schema";
import {
  fail,
  hash,
  HttpError,
  jsonBody,
  limitedBody,
  rateLimit,
  requireAdmin,
  sameOrigin,
  secret,
  sessionOptions,
  verifyPassword,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  Vary: "Cookie",
};
const ok = (data: unknown) => NextResponse.json(data, { headers: privateHeaders });
const uuid = z.uuid();
function privateFail(error: unknown) {
  const response = fail(error);
  for (const [k, v] of Object.entries(privateHeaders)) response.headers.set(k, v);
  return response;
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const parts = (await context.params).path;
    await requireAdmin();
    if (parts.join("/") === "status") {
      const session = await clinicalSession();
      return ok({
        configured: clinicalConfigured(),
        unlocked: !!session,
        expiresAt: session?.expiresAt || null,
      });
    }
    const session = await requireClinical();
    if (parts.join("/") === "clients") {
      clinicalAudit("clients.list", session.session);
      return ok({ clients: listClinicalClients() });
    }
    if (parts.join("/") === "backup") {
      clinicalAudit("backup.export", session.session);
      return new NextResponse(JSON.stringify(clinicalBackup()), {
        headers: {
          ...privateHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="skinstinct-clinical-encrypted-backup.json"',
        },
      });
    }
    if (parts[0] === "clients" && parts[1]) {
      const clientId = uuid.parse(parts[1]);
      if (parts.length === 2) {
        clinicalAudit("client.read", session.session, clientId, clientId);
        return ok({
          client: getClinicalClient(clientId),
          visits: listClinicalVisits(clientId),
          documents: listClinicalDocuments(clientId),
          history: clinicalHistory(clientId),
        });
      }
      if (parts[2] === "documents" && parts.length === 4) {
        const document = getClinicalDocument(clientId, uuid.parse(parts[3]), session.session);
        return new NextResponse(new Uint8Array(document.data), {
          headers: {
            ...privateHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="diagnostika.pdf"; filename*=UTF-8''${encodeURIComponent(document.name)}`,
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox; default-src 'none'",
          },
        });
      }
      if (parts[2] === "revisions" && parts.length === 4) {
        const id = uuid.parse(parts[3]);
        clinicalAudit("revision.read", session.session, clientId, id);
        return ok(clinicalRevision(clientId, id));
      }
    }
    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    return privateFail(error);
  }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    sameOrigin(request);
    await requireAdmin();
    const parts = (await context.params).path;
    if (parts.join("/") === "unlock") {
      rateLimit(request, "clinical-unlock", 5);
      const { password } = z
        .object({ password: z.string().min(1).max(200) })
        .parse(await jsonBody(request, 1000));
      if (!verifyPassword(password)) throw new HttpError(401, "INVALID_PASSWORD");
      if (!clinicalConfigured()) throw new HttpError(503, "CLINICAL_NOT_CONFIGURED");
      const c = await cookies(),
        admin = c.get("sk_admin")!.value,
        old = c.get("sk_clinical")?.value,
        token = secret(),
        expiresAt = Date.now() + CLINICAL_SESSION_MS,
        connection = clinicalDb();
      if (old)
        connection.prepare("DELETE FROM clinical_sessions WHERE token_hash=?").run(hash(old));
      connection.prepare("DELETE FROM clinical_sessions WHERE expires_at<?").run(Date.now());
      connection
        .prepare("INSERT INTO clinical_sessions VALUES (?,?,?)")
        .run(hash(token), hash(admin), expiresAt);
      c.set("sk_clinical", token, {
        ...sessionOptions,
        sameSite: "strict",
        maxAge: CLINICAL_SESSION_MS / 1000,
      });
      clinicalAudit("vault.unlock", hash(token));
      return ok({ expiresAt });
    }
    if (parts.join("/") === "lock") {
      const c = await cookies(),
        token = c.get("sk_clinical")?.value;
      if (token) {
        clinicalDb().prepare("DELETE FROM clinical_sessions WHERE token_hash=?").run(hash(token));
        clinicalAudit("vault.lock", hash(token));
      }
      c.delete("sk_clinical");
      return ok({ ok: true });
    }
    const session = await requireClinical();
    if (parts.join("/") === "clients") {
      const input = z
        .object({
          id: uuid.nullable(),
          version: z.number().int().nonnegative(),
          data: clientCardSchema,
        })
        .parse(await jsonBody(request, 250_000));
      return ok({
        client: saveClinicalClient(input.id, input.version, input.data, session.session),
      });
    }
    if (parts[0] === "clients" && parts[1]) {
      const clientId = uuid.parse(parts[1]);
      if (parts[2] === "visits" && parts.length === 3) {
        const input = z
          .object({
            id: uuid.nullable(),
            version: z.number().int().nonnegative(),
            data: clinicalVisitSchema,
          })
          .parse(await jsonBody(request, 250_000));
        return ok({
          visit: saveClinicalVisit(clientId, input.id, input.version, input.data, session.session),
        });
      }
      if (parts[2] === "documents" && parts.length === 3) {
        const name = z.string().min(1).max(500).parse(request.nextUrl.searchParams.get("name")),
          visit = request.nextUrl.searchParams.get("visit");
        const id = addClinicalDocument(
          clientId,
          visit ? uuid.parse(visit) : null,
          name,
          await limitedBody(request, 10_000_000),
          session.session,
        );
        return ok({ id });
      }
    }
    throw new HttpError(404, "NOT_FOUND");
  } catch (error) {
    return privateFail(error);
  }
}
