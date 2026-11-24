import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import { requireClinical } from "@/lib/clinical-auth";
import {
  clinicalAudit,
  clinicalBackup,
  clinicalConfigured,
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
import { fail, HttpError, jsonBody, limitedBody, requireAdmin, sameOrigin } from "@/lib/security";

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
      return ok({ configured: clinicalConfigured() });
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
