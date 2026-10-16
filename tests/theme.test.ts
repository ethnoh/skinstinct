import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { getLatviaSunTimes, parseThemeMode, resolveTheme, themeBootstrap } from "../lib/theme";

test("automatic theme follows actual sunrise and sunset across Latvia's seasons and DST", () => {
  for (const date of [
    "2026-03-28",
    "2026-03-29",
    "2026-06-21",
    "2026-10-24",
    "2026-10-25",
    "2026-12-21",
  ]) {
    const { sunrise, sunset } = getLatviaSunTimes(new Date(`${date}T12:00:00Z`));
    assert.ok(Number.isFinite(sunrise) && sunset > sunrise);
    assert.equal(resolveTheme("auto", new Date(sunrise - 1)), "dark", date);
    assert.equal(resolveTheme("auto", new Date(sunrise)), "light", date);
    assert.equal(resolveTheme("auto", new Date(sunset - 1)), "light", date);
    assert.equal(resolveTheme("auto", new Date(sunset)), "dark", date);
    assert.equal(resolveTheme("light", new Date(sunset + 1)), "light");
    assert.equal(resolveTheme("dark", new Date((sunrise + sunset) / 2)), "dark");
  }
  const summer = getLatviaSunTimes(new Date("2026-06-21T12:00:00Z"));
  const winter = getLatviaSunTimes(new Date("2026-12-21T12:00:00Z"));
  assert.ok((summer.sunset - summer.sunrise) / 3600_000 > 17);
  assert.ok((winter.sunset - winter.sunrise) / 3600_000 < 8);
});

test("solar day uses Latvia's date rather than the visitor or UTC date", () => {
  assert.equal(getLatviaSunTimes(new Date("2026-10-16T22:30:00Z")).date, "2026-10-17");
  assert.equal(getLatviaSunTimes(new Date("2026-10-24T21:30:00Z")).date, "2026-10-25");
  assert.equal(getLatviaSunTimes(new Date("2026-10-25T21:30:00Z")).date, "2026-10-25");
  assert.equal(getLatviaSunTimes(new Date("2026-10-25T22:30:00Z")).date, "2026-10-26");
});

test("first-paint theme agrees with the live controller and honors manual overrides", () => {
  const { sunrise, sunset } = getLatviaSunTimes(new Date("2026-10-17T12:00:00Z"));
  for (const timestamp of [sunrise - 1000, sunrise + 1000, sunset - 1000, sunset + 1000]) {
    for (const stored of [null, "auto", "light", "dark", "invalid", "blocked"]) {
      const document = {
        documentElement: {
          dataset: {} as Record<string, string>,
          style: {} as Record<string, string>,
        },
      };
      runInNewContext(themeBootstrap(new Date(timestamp)), {
        document,
        Date: { now: () => timestamp },
        localStorage: {
          getItem: () => {
            if (stored === "blocked") throw Error("Storage unavailable");
            return stored;
          },
        },
      });
      const mode = parseThemeMode(stored);
      assert.equal(document.documentElement.dataset.themeMode, mode);
      assert.equal(document.documentElement.dataset.theme, resolveTheme(mode, new Date(timestamp)));
      assert.equal(
        document.documentElement.style.colorScheme,
        document.documentElement.dataset.theme,
      );
    }
  }
});
