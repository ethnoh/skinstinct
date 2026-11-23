// Run offline against an initialized, empty clinical store. Never overwrites records.
import { readFileSync } from "node:fs";
import { createHash, createDecipheriv } from "node:crypto";
import Database from "better-sqlite3";
const [backupPath, databasePath] = process.argv.slice(2);
if (!backupPath || !databasePath)
  throw Error("Usage: node scripts/restore-clinical-backup.mjs BACKUP.json DATABASE.db");
const value = process.env.CLINICAL_RECORDS_KEY || "";
if (!/^[a-f0-9]{64}$/i.test(value)) throw Error("CLINICAL_RECORDS_KEY is required");
const key = Buffer.from(value, "hex"),
  backup = JSON.parse(readFileSync(backupPath, "utf8"));
if (
  backup.format !== "skinstinct-clinical-encrypted-v1" ||
  backup.keyFingerprint !== createHash("sha256").update(key).digest("hex").slice(0, 16)
)
  throw Error("Backup format or key mismatch");
const tables = {
  clinical_clients: ["id", "payload", "version", "created_at", "updated_at"],
  clinical_visits: ["id", "client_id", "payload", "version", "created_at", "updated_at"],
  clinical_documents: ["id", "client_id", "visit_id", "metadata", "payload", "created_at"],
  clinical_revisions: [
    "id",
    "entity_type",
    "entity_id",
    "client_id",
    "payload",
    "version",
    "created_at",
  ],
  clinical_audit: ["id", "action", "client_id", "entity_id", "session_hash", "created_at"],
};
function decrypt(blob, context) {
  if (!Buffer.isBuffer(blob) || blob.length < 29 || blob[0] !== 1)
    throw Error("Invalid encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", key, blob.subarray(1, 13));
  decipher.setAAD(Buffer.from(context));
  decipher.setAuthTag(blob.subarray(13, 29));
  return Buffer.concat([decipher.update(blob.subarray(29)), decipher.final()]);
}
const connection = new Database(databasePath, { fileMustExist: true });
connection.pragma("foreign_keys=ON");
try {
  connection.transaction(() => {
    for (const table of Object.keys(tables))
      if (connection.prepare(`SELECT count(*) AS n FROM ${table}`).get().n)
        throw Error("Target clinical store must be empty; existing records were not changed");
    for (const [table, columns] of Object.entries(tables)) {
      if (!Array.isArray(backup.tables?.[table])) throw Error("Missing backup table");
      const insert = connection.prepare(
        `INSERT INTO ${table}(${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
      );
      for (const stored of backup.tables[table]) {
        const row = Object.fromEntries(
          Object.entries(stored).map(([name, v]) => [
            name,
            v && typeof v === "object" && typeof v.base64 === "string"
              ? Buffer.from(v.base64, "base64")
              : v,
          ]),
        );
        if (table === "clinical_clients")
          JSON.parse(decrypt(row.payload, "client:" + row.id).toString());
        if (table === "clinical_visits")
          JSON.parse(decrypt(row.payload, "visit:" + row.id).toString());
        if (table === "clinical_documents") {
          JSON.parse(decrypt(row.metadata, "document-meta:" + row.id).toString());
          if (
            !decrypt(row.payload, "document:" + row.id)
              .subarray(0, 5)
              .equals(Buffer.from("%PDF-"))
          )
            throw Error("Invalid PDF payload");
        }
        if (table === "clinical_revisions") {
          if (!["client", "visit"].includes(row.entity_type)) throw Error("Invalid revision type");
          JSON.parse(decrypt(row.payload, row.entity_type + ":" + row.entity_id).toString());
        }
        insert.run(...columns.map((name) => row[name]));
      }
    }
  })();
  console.log("Encrypted clinical backup restored. Existing public site data preserved.");
} finally {
  connection.close();
}
