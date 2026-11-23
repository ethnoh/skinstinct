import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import Database from "better-sqlite3";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { emptyClientCard, emptyClinicalVisit } from "../lib/clinical-schema";

test("clinical records encrypt health data, retain revisions and diagnostic PDFs, and reject stale edits", async () => {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "skinstinct-clinical-"));
  const key = randomBytes(32).toString("hex");
  process.env.CLINICAL_RECORDS_KEY = key;
  const store = await import("../lib/clinical-store");
  const { db } = await import("../lib/db");
  try {
    const payload = Buffer.from("confidential-health-test"),
      encrypted = store.encryptClinical(payload, "test:one");
    assert.deepEqual(store.decryptClinical(encrypted, "test:one"), payload);
    assert.notDeepEqual(store.encryptClinical(payload, "test:one"), encrypted);
    assert.throws(() => store.decryptClinical(encrypted, "test:two"));
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 1] ^= 1;
    assert.throws(() => store.decryptClinical(tampered, "test:one"));
    const draft = emptyClientCard();
    draft.name = "TEST ONLY — Privāta Kliente";
    draft.health.allergies = { answer: "yes", details: "TEST ONLY — lateksa reakcija" };
    const client = store.saveClinicalClient(null, 0, draft, "test-session");
    const row = db().prepare("SELECT payload FROM clinical_clients WHERE id=?").get(client.id) as {
      payload: Buffer;
    };
    assert.ok(!row.payload.includes(Buffer.from(draft.name)));
    assert.ok(!row.payload.includes(Buffer.from("lateksa")));
    assert.equal(store.listClinicalClients()[0].name, draft.name);
    const visit = store.saveClinicalVisit(
      client.id,
      null,
      0,
      {
        ...emptyClinicalVisit("2026-12-01"),
        service: "TEST — kopšana",
        price: 50.25,
        discountNotes: "Atlaide 10 EUR",
        metrics: [
          {
            name: "Mitrums",
            value: 42.5,
            unit: "%",
            area: "Vaigs",
            device: "Testa aparāts",
            conditions: "Pirms kopšanas",
          },
        ],
      },
      "test-session",
    );
    assert.equal(visit.data.price, 50.25);
    assert.equal(visit.data.anamnesisSnapshot?.health.allergies.answer, "yes");
    const updated = store.saveClinicalClient(
      client.id,
      1,
      { ...draft, health: { ...draft.health, allergies: { answer: "no", details: "" } } },
      "test-session",
    );
    assert.equal(updated.version, 2);
    assert.throws(
      () => store.saveClinicalClient(client.id, 1, draft, "test-session"),
      /CLINICAL_CONFLICT/,
    );
    assert.throws(
      () => store.saveClinicalVisit(client.id, visit.id, 1, visit.data, "test-session"),
      /CORRECTION_REASON_REQUIRED/,
    );
    store.saveClinicalVisit(
      client.id,
      visit.id,
      1,
      { ...visit.data, correctionReason: "Pievienota pēcaprūpe", aftercare: "TEST — mitrināšana" },
      "test-session",
    );
    assert.equal(
      store.listClinicalVisits(client.id)[0].data.anamnesisSnapshot?.health.allergies.answer,
      "yes",
    );
    const pdf = Buffer.from("%PDF-1.4\nTEST ONLY\n%%EOF");
    const id = store.addClinicalDocument(
      client.id,
      visit.id,
      "diagnostika.pdf",
      pdf,
      "test-session",
    );
    assert.deepEqual(store.getClinicalDocument(client.id, id, "test-session").data, pdf);
    assert.throws(
      () => store.getClinicalDocument("00000000-0000-4000-8000-000000000000", id, "test-session"),
      /NOT_FOUND/,
    );
    assert.throws(
      () =>
        store.addClinicalDocument(
          client.id,
          null,
          "fake.pdf",
          Buffer.from("<script>test</script>"),
          "test-session",
        ),
      /INVALID_PDF/,
    );
    const history = store.clinicalHistory(client.id);
    assert.equal(history.revisions.length, 2);
    const old = store.clinicalRevision(
      client.id,
      (history.revisions as { id: string; entity_type: string }[]).find(
        (r) => r.entity_type === "client",
      )!.id,
    );
    assert.equal(old.data.health.allergies.answer, "yes");
    const backup = JSON.stringify(store.clinicalBackup());
    assert.ok(!backup.includes(draft.name));
    assert.ok(!backup.includes("lateksa"));
    assert.ok(!backup.includes(key));
    const backupPath = path.join(process.env.DATA_DIR!, "backup.json"),
      restoredPath = path.join(process.env.DATA_DIR!, "restored.db");
    writeFileSync(backupPath, backup);
    const restored = new Database(restoredPath);
    for (const row of db()
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name LIKE 'clinical_%'")
      .all() as { sql: string }[])
      restored.exec(row.sql);
    restored.close();
    const restore = () =>
      spawnSync(
        process.execPath,
        ["scripts/restore-clinical-backup.mjs", backupPath, restoredPath],
        { env: process.env, encoding: "utf8" },
      );
    assert.equal(restore().status, 0);
    const recovered = new Database(restoredPath);
    const recoveredRow = recovered
      .prepare("SELECT payload FROM clinical_clients WHERE id=?")
      .get(client.id) as { payload: Buffer };
    assert.equal(
      JSON.parse(store.decryptClinical(recoveredRow.payload, `client:${client.id}`).toString())
        .name,
      draft.name,
    );
    assert.equal(
      (recovered.prepare("SELECT count(*) AS n FROM clinical_documents").get() as { n: number }).n,
      1,
    );
    recovered.close();
    assert.notEqual(restore().status, 0, "Restore must never overwrite existing clinical records");
    delete process.env.CLINICAL_RECORDS_KEY;
    assert.equal(store.clinicalConfigured(), false);
    assert.throws(
      () => store.saveClinicalClient(null, 0, draft, "test-session"),
      /CLINICAL_NOT_CONFIGURED/,
    );
    process.env.CLINICAL_RECORDS_KEY = randomBytes(32).toString("hex");
    assert.throws(() => store.getClinicalClient(client.id), /CLINICAL_DECRYPT_FAILED/);
    process.env.CLINICAL_RECORDS_KEY = key;
    assert.equal(store.getClinicalClient(client.id).data.name, draft.name);
  } finally {
    db().close();
  }
});
