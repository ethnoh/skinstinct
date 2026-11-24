import test from "node:test";
import assert from "node:assert/strict";
import { skinFindingGroups, skinFindingSelected, toggleSkinFinding } from "../lib/skin-assessment";
test("quick skin findings preserve clinical free text, toggle without duplicates and keep only one skin type", () => {
  const type = skinFindingGroups[0],
    pigment = skinFindingGroups.find((g) => g.id === "pigment")!,
    hydration = skinFindingGroups.find((g) => g.id === "hydration")!;
  const original = "Vaigu zona: lokālas izmaiņas.\nPIH apraksts saglabāts brīvā tekstā.";
  const first = toggleSkinFinding(original, type, "Sausa āda");
  const replaced = toggleSkinFinding(first, type, "Kombinēta āda");
  assert.ok(replaced.startsWith(original));
  assert.ok(!skinFindingSelected(replaced, type, "Sausa āda"));
  assert.ok(skinFindingSelected(replaced, type, "Kombinēta āda"));
  const both = toggleSkinFinding(
    toggleSkinFinding(replaced, pigment, pigment.options[0]),
    hydration,
    "Dehidratācija",
  );
  assert.ok(skinFindingSelected(both, pigment, pigment.options[0]));
  assert.ok(skinFindingSelected(both, hydration, "Dehidratācija"));
  const removed = toggleSkinFinding(both, pigment, pigment.options[0]);
  assert.ok(removed.includes("PIH apraksts saglabāts brīvā tekstā."));
  assert.ok(!skinFindingSelected(removed, pigment, pigment.options[0]));
  assert.equal(toggleSkinFinding(original, type, "Nezināma opcija"), original);
  assert.equal(
    toggleSkinFinding(toggleSkinFinding("", type, type.options[0]), type, type.options[0]),
    "",
  );
});
