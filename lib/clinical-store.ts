import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { db } from "./db";
import { HttpError } from "./security";
import {
  clientCardSchema,
  clinicalVisitSchema,
  type ClientCard,
  type ClinicalVisit,
  type SavedClient,
  type SavedVisit,
  type ClinicalDocument,
} from "./clinical-schema";

function key() {
  const value = process.env.CLINICAL_RECORDS_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value)) throw new HttpError(503, "CLINICAL_NOT_CONFIGURED");
  return Buffer.from(value, "hex");
}
export function clinicalConfigured() {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}
export function encryptClinical(value: Buffer, context: string) {
  const nonce = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), nonce);
  cipher.setAAD(Buffer.from(context));
  const body = Buffer.concat([cipher.update(value), cipher.final()]);
  return Buffer.concat([Buffer.from([1]), nonce, cipher.getAuthTag(), body]);
}
export function decryptClinical(value: Buffer, context: string) {
  if (value.length < 29 || value[0] !== 1) throw new HttpError(500, "CLINICAL_DECRYPT_FAILED");
  try {
    const cipher = createDecipheriv("aes-256-gcm", key(), value.subarray(1, 13));
    cipher.setAAD(Buffer.from(context));
    cipher.setAuthTag(value.subarray(13, 29));
    return Buffer.concat([cipher.update(value.subarray(29)), cipher.final()]);
  } catch {
    throw new HttpError(500, "CLINICAL_DECRYPT_FAILED");
  }
}
type Row = {
  id: string;
  client_id?: string;
  payload: Buffer;
  version: number;
  created_at: string;
  updated_at: string;
};
function encode(value: unknown, context: string) {
  return encryptClinical(Buffer.from(JSON.stringify(value)), context);
}
function decode<T>(row: Row, type: string): T {
  return JSON.parse(decryptClinical(row.payload, `${type}:${row.id}`).toString("utf8")) as T;
}
export function clinicalDb() {
  const c = db();
  c.exec(`
 CREATE TABLE IF NOT EXISTS clinical_clients(id TEXT PRIMARY KEY,payload BLOB NOT NULL,version INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinical_visits(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clinical_clients(id),payload BLOB NOT NULL,version INTEGER NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS clinical_visit_client ON clinical_visits(client_id);
 CREATE TABLE IF NOT EXISTS clinical_documents(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clinical_clients(id),visit_id TEXT REFERENCES clinical_visits(id),metadata BLOB NOT NULL,payload BLOB NOT NULL,created_at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS clinical_document_client ON clinical_documents(client_id);
 CREATE TABLE IF NOT EXISTS clinical_revisions(id TEXT PRIMARY KEY,entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,client_id TEXT NOT NULL,payload BLOB NOT NULL,version INTEGER NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinical_audit(id TEXT PRIMARY KEY,action TEXT NOT NULL,client_id TEXT,entity_id TEXT,session_hash TEXT NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS clinical_sessions(token_hash TEXT PRIMARY KEY,admin_hash TEXT NOT NULL,expires_at INTEGER NOT NULL);
 `);
  return c;
}
export function clinicalAudit(
  action: string,
  session: string,
  clientId: string | null = null,
  entityId: string | null = null,
) {
  clinicalDb()
    .prepare("INSERT INTO clinical_audit VALUES (?,?,?,?,?,?)")
    .run(randomUUID(), action, clientId, entityId, session, new Date().toISOString());
}
export function listClinicalClients() {
  key();
  return (
    clinicalDb().prepare("SELECT * FROM clinical_clients ORDER BY updated_at DESC").all() as Row[]
  ).map((row) => {
    const data = decode<ClientCard>(row, "client");
    return {
      id: row.id,
      version: row.version,
      name: data.name,
      birthDate: data.birthDate,
      phone: data.phone,
      archived: data.archived,
      updatedAt: row.updated_at,
    };
  });
}
export function getClinicalClient(id: string): SavedClient {
  const row = clinicalDb().prepare("SELECT * FROM clinical_clients WHERE id=?").get(id) as
    Row | undefined;
  if (!row) throw new HttpError(404, "NOT_FOUND");
  return {
    id,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    data: decode<ClientCard>(row, "client"),
  };
}
export function saveClinicalClient(
  id: string | null,
  version: number,
  data: ClientCard,
  session: string,
): SavedClient {
  const parsed = clientCardSchema.parse(data),
    c = clinicalDb(),
    now = new Date().toISOString();
  return c.transaction(() => {
    const recordId = id || randomUUID();
    if (id) {
      const previous = c.prepare("SELECT * FROM clinical_clients WHERE id=?").get(id) as
        Row | undefined;
      if (!previous) throw new HttpError(404, "NOT_FOUND");
      if (previous.version !== version) throw new HttpError(409, "CLINICAL_CONFLICT");
      c.prepare("INSERT INTO clinical_revisions VALUES (?,?,?,?,?,?,?)").run(
        randomUUID(),
        "client",
        id,
        id,
        previous.payload,
        previous.version,
        now,
      );
      c.prepare(
        "UPDATE clinical_clients SET payload=?,version=version+1,updated_at=? WHERE id=?",
      ).run(encode(parsed, `client:${id}`), now, id);
    } else {
      if (version !== 0) throw new HttpError(400, "INVALID_DATA");
      c.prepare("INSERT INTO clinical_clients VALUES (?,?,1,?,?)").run(
        recordId,
        encode(parsed, `client:${recordId}`),
        now,
        now,
      );
    }
    clinicalAudit(id ? "client.update" : "client.create", session, recordId, recordId);
    return getClinicalClient(recordId);
  })();
}
export function listClinicalVisits(clientId: string): SavedVisit[] {
  getClinicalClient(clientId);
  return (
    clinicalDb()
      .prepare("SELECT * FROM clinical_visits WHERE client_id=? ORDER BY created_at DESC")
      .all(clientId) as Row[]
  )
    .map((row) => ({
      id: row.id,
      clientId,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      data: decode<ClinicalVisit>(row, "visit"),
    }))
    .sort(
      (a, b) => b.data.date.localeCompare(a.data.date) || b.createdAt.localeCompare(a.createdAt),
    );
}
export function saveClinicalVisit(
  clientId: string,
  id: string | null,
  version: number,
  data: ClinicalVisit,
  session: string,
): SavedVisit {
  const parsed = clinicalVisitSchema.parse(data),
    c = clinicalDb(),
    now = new Date().toISOString(),
    client = getClinicalClient(clientId);
  let saved: SavedVisit["data"] = { ...parsed, anamnesisSnapshot: client.data };
  return c.transaction(() => {
    const recordId = id || randomUUID();
    let next = 1,
      createdAt = now;
    if (id) {
      const old = c
        .prepare("SELECT * FROM clinical_visits WHERE id=? AND client_id=?")
        .get(id, clientId) as Row | undefined;
      if (!old) throw new HttpError(404, "NOT_FOUND");
      if (old.version !== version) throw new HttpError(409, "CLINICAL_CONFLICT");
      if (!parsed.correctionReason) throw new HttpError(400, "CORRECTION_REASON_REQUIRED");
      c.prepare("INSERT INTO clinical_revisions VALUES (?,?,?,?,?,?,?)").run(
        randomUUID(),
        "visit",
        id,
        clientId,
        old.payload,
        old.version,
        now,
      );
      saved = {
        ...parsed,
        anamnesisSnapshot: decode<SavedVisit["data"]>(old, "visit").anamnesisSnapshot,
      };
      next = version + 1;
      createdAt = old.created_at;
      c.prepare("UPDATE clinical_visits SET payload=?,version=?,updated_at=? WHERE id=?").run(
        encode(saved, `visit:${id}`),
        next,
        now,
        id,
      );
    } else {
      if (version !== 0) throw new HttpError(400, "INVALID_DATA");
      c.prepare("INSERT INTO clinical_visits VALUES (?,?,?,1,?,?)").run(
        recordId,
        clientId,
        encode(saved, `visit:${recordId}`),
        now,
        now,
      );
    }
    clinicalAudit(id ? "visit.update" : "visit.create", session, clientId, recordId);
    return { id: recordId, clientId, version: next, createdAt, updatedAt: now, data: saved };
  })();
}
export function listClinicalDocuments(clientId: string): ClinicalDocument[] {
  return (
    clinicalDb()
      .prepare(
        "SELECT id,client_id,visit_id,metadata,created_at FROM clinical_documents WHERE client_id=? ORDER BY created_at DESC",
      )
      .all(clientId) as {
      id: string;
      client_id: string;
      visit_id: string | null;
      metadata: Buffer;
      created_at: string;
    }[]
  ).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    visitId: row.visit_id,
    date: row.created_at,
    ...JSON.parse(decryptClinical(row.metadata, `document-meta:${row.id}`).toString()),
  }));
}
export function addClinicalDocument(
  clientId: string,
  visitId: string | null,
  name: string,
  data: Buffer,
  session: string,
) {
  getClinicalClient(clientId);
  const c = clinicalDb();
  if (
    visitId &&
    !c.prepare("SELECT 1 FROM clinical_visits WHERE id=? AND client_id=?").get(visitId, clientId)
  )
    throw new HttpError(404, "NOT_FOUND");
  if (
    !name.toLowerCase().endsWith(".pdf") ||
    data.length > 10_000_000 ||
    data.length < 8 ||
    !data.subarray(0, 5).equals(Buffer.from("%PDF-"))
  )
    throw new HttpError(400, "INVALID_PDF");
  const id = randomUUID(),
    safeName = name.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 180),
    now = new Date().toISOString();
  c.transaction(() => {
    c.prepare("INSERT INTO clinical_documents VALUES (?,?,?,?,?,?)").run(
      id,
      clientId,
      visitId,
      encode({ name: safeName, size: data.length }, `document-meta:${id}`),
      encryptClinical(data, `document:${id}`),
      now,
    );
    clinicalAudit("document.upload", session, clientId, id);
  })();
  return id;
}
export function getClinicalDocument(clientId: string, id: string, session: string) {
  const row = clinicalDb()
    .prepare("SELECT * FROM clinical_documents WHERE id=? AND client_id=?")
    .get(id, clientId) as { metadata: Buffer; payload: Buffer } | undefined;
  if (!row) throw new HttpError(404, "NOT_FOUND");
  const metadata = JSON.parse(decryptClinical(row.metadata, `document-meta:${id}`).toString());
  clinicalAudit("document.download", session, clientId, id);
  return { name: metadata.name as string, data: decryptClinical(row.payload, `document:${id}`) };
}
export function clinicalHistory(clientId: string) {
  getClinicalClient(clientId);
  const c = clinicalDb();
  const revisions = c
    .prepare(
      "SELECT id,entity_type,entity_id,version,created_at FROM clinical_revisions WHERE client_id=? ORDER BY created_at DESC",
    )
    .all(clientId);
  const audit = c
    .prepare(
      "SELECT action,entity_id,created_at FROM clinical_audit WHERE client_id=? ORDER BY created_at DESC LIMIT 200",
    )
    .all(clientId);
  return { revisions, audit };
}
export function clinicalRevision(clientId: string, id: string) {
  const row = clinicalDb()
    .prepare("SELECT * FROM clinical_revisions WHERE id=? AND client_id=?")
    .get(id, clientId) as
    | {
        entity_type: string;
        entity_id: string;
        payload: Buffer;
        version: number;
        created_at: string;
      }
    | undefined;
  if (!row) throw new HttpError(404, "NOT_FOUND");
  return {
    type: row.entity_type,
    version: row.version,
    date: row.created_at,
    data: JSON.parse(
      decryptClinical(row.payload, `${row.entity_type}:${row.entity_id}`).toString(),
    ),
  };
}
export function clinicalBackup() {
  key();
  return clinicalDb().transaction(() => ({
    format: "skinstinct-clinical-encrypted-v1",
    createdAt: new Date().toISOString(),
    keyFingerprint: createHash("sha256").update(key()).digest("hex").slice(0, 16),
    tables: Object.fromEntries(
      [
        "clinical_clients",
        "clinical_visits",
        "clinical_documents",
        "clinical_revisions",
        "clinical_audit",
      ].map((table) => [
        table,
        clinicalDb()
          .prepare(`SELECT * FROM ${table}`)
          .all()
          .map((row) =>
            Object.fromEntries(
              Object.entries(row as Record<string, unknown>).map(([k, v]) => [
                k,
                Buffer.isBuffer(v) ? { base64: v.toString("base64") } : v,
              ]),
            ),
          ),
      ]),
    ),
  }))();
}
