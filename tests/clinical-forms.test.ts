import test from "node:test";
import assert from "node:assert/strict";
import { renderClinicalForms } from "../lib/clinical-forms";
import { emptyClientCard } from "../lib/clinical-schema";
test("printable consent templates separate initial intake from visit consent and escape client data", () => {
  const blank = renderClinicalForms();
  assert.equal((blank.match(/class="sheet"/g) || []).length, 6);
  assert.ok(blank.includes("piekrišanu tai fiksējam vizītes pielikumā"));
  assert.ok(!blank.includes("Pamatanketu aizpilda sākumā"));
  assert.ok(!blank.includes("Pirms katras vizītes informēju par izmaiņām"));
  assert.ok(!blank.includes("Būtiskās izmaiņas pārskata katrā vizītē"));
  assert.ok(blank.includes("Valērija Razujeva, ārstniecības persona Nr. 65120058811"));
  assert.ok(blank.includes("Pļaviņu iela 51, Jēkabpils, Latvija"));
  assert.ok(
    blank.includes("Fotogrāfiju izmantošana reklāmā: □ Piekrītu &nbsp; □ Nepiekrītu"),
  );
  const declinedImages = renderClinicalForms({
    client: { ...emptyClientCard(), imageConsent: "no" },
  });
  assert.ok(declinedImages.includes("Fotogrāfiju izmantošana reklāmā: □ Nepiekrītu"));
  assert.ok(blank.includes("tikai pilngadīgām personām"));
  assert.ok(blank.includes("Datums un laiks"));
  assert.ok(!blank.includes("atsakos no jebkādām pretenzijām"));
  const client = {
    ...emptyClientCard(),
    name: "<img src=x onerror=alert(1)>",
    notes: "</style><script>alert(1)</script>",
  };
  const result = renderClinicalForms({ client });
  assert.ok(!result.includes("<script>"));
  assert.ok(!result.includes("<img"));
  assert.ok(result.includes("&lt;img"));
  assert.equal((renderClinicalForms({ section: "visit" }).match(/class="sheet"/g) || []).length, 2);
  assert.equal(
    (renderClinicalForms({ section: "aftercare" }).match(/class="sheet"/g) || []).length,
    1,
  );
});
