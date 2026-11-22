import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { journalArticles } from "../lib/journal-content";
import { articleSchema } from "../lib/validation";

test("journal release adds articles once and retains owner edits, uploads and deletions", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "skinstinct-journal-"));
  process.env.DATA_DIR = directory;
  const connection = new Database(path.join(directory, "skinstinct.db"));
  connection.exec("CREATE TABLE content (key TEXT PRIMARY KEY, value TEXT NOT NULL)");
  const original = {
    ...journalArticles[0],
    id: "intro",
    slug: "owner-intro",
    image: "/uploads/owner.webp",
    title: { lv: "Mans labotais virsraksts", en: "My edited title", ru: "Мой заголовок" },
    published: false,
  };
  connection.prepare("INSERT INTO content VALUES ('articles', ?)").run(JSON.stringify([original]));
  connection.close();
  const { db, getArticles, setContent } = await import("../lib/db");
  try {
    const articles = getArticles();
    assert.equal(articles.length, 3);
    assert.deepEqual(
      articles.find((a) => a.id === "intro"),
      original,
    );
    assert.ok(journalArticles.every((a) => articleSchema.safeParse(a).success));
    assert.equal(getArticles().length, 3);
    const edited = articles
      .filter((a) => a.id !== journalArticles[1].id)
      .map((a) =>
        a.id === journalArticles[0].id
          ? { ...a, published: false, image: "/uploads/changed.webp" }
          : a,
      );
    setContent("articles", edited);
    assert.deepEqual(getArticles(), edited);
    assert.ok(db().prepare("SELECT 1 FROM content WHERE key = 'journal-release-2026-11'").get());
    setContent("articles", [{ ...original, image: "/images/journal-instagram-intro.jpg" }]);
    assert.equal(getArticles()[0].image, "/images/journal-studio.webp");
    assert.equal(getArticles()[0].title.lv, original.title.lv);
  } finally {
    db().close();
  }
});
