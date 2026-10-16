import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { once } from "node:events";
import { startDate } from "../lib/booking";
import Database from "better-sqlite3";

let server: ChildProcess;
let origin = "";
let port = 0;
let logs = "";
const directory = mkdtempSync(path.join(tmpdir(), "skinstinct-qa-"));
const password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
async function start() {
  server = spawn(process.execPath, [path.join(process.cwd(), ".next/standalone/server.js")], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(port),
      HOSTNAME: "127.0.0.1",
      DATA_DIR: directory,
      SITE_URL: origin,
      ADMIN_PASSWORD_HASH: passwordHash,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout?.on("data", (chunk) => {
    logs += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    logs += chunk.toString();
  });
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const r = await fetch(`${origin}/api/health`);
      if (r.ok) return;
    } catch {}
    if (server.exitCode !== null) throw new Error(`Test server failed: ${logs.slice(-1500)}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Test server did not start");
}
async function stop() {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
}
before(async () => {
  assert.ok(
    existsSync(
      path.join(process.cwd(), ".next/standalone/node_modules/next/dist/build/output/log.js"),
    ),
    "Standalone artifact must include Next.js runtime logging module",
  );
  assert.equal(
    existsSync(path.join(process.cwd(), ".next/standalone/ADMIN-ACCESS.txt")),
    false,
    "Private admin access file must never enter the server artifact",
  );
  port = await new Promise<number>((resolve) => {
    const candidate = net.createServer();
    candidate.listen(0, "127.0.0.1", () => {
      const address = candidate.address() as net.AddressInfo;
      candidate.close(() => resolve(address.port));
    });
  });
  origin = `http://127.0.0.1:${port}`;
  await start();
});
after(async () => {
  await stop();
});
function post(route: string, data: unknown, cookie = "", requestOrigin = origin) {
  return fetch(`${origin}${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: requestOrigin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(data),
  });
}
const cookieOf = (response: Response, name: string) =>
  response.headers
    .getSetCookie()
    .find((v) => v.startsWith(`${name}=`))
    ?.split(";")[0] || "";

test("Booking lifecycle, isolation, content management and restart persistence", async (t) => {
  let admin = "";
  let customer = "";
  let code = "";
  let bookingId = "";
  let date = "";
  let time = "";
  await t.test("public pages are server rendered and private state is protected", async () => {
    assert.equal((await fetch(`${origin}/api/admin`)).status, 401);
    assert.equal((await post("/api/inquiries", {}, "", "https://untrusted.example")).status, 403);
    const home = await (await fetch(origin)).text();
    assert.ok(home.includes("Tava āda."));
    assert.ok(home.includes("application/ld+json"));
    const russian = await (await fetch(`${origin}/ru`)).text();
    assert.ok(russian.includes('<html lang="ru"'));
    assert.ok(russian.includes("Твоя кожа."));
    const english = await (await fetch(`${origin}/en`)).text();
    assert.ok(english.includes('<html lang="en"'));
    assert.ok(english.includes("Your skin."));
    assert.ok(english.includes("Getting to know your skin"));
    const englishMarkup = english.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
    assert.ok(englishMarkup.includes("How can I view or cancel an appointment?"));
    assert.ok(!englishMarkup.includes("Kā apskatīt vai atcelt pierakstu?"));
    assert.ok(english.includes('hrefLang="en"') || english.includes('hrefLang="en"'.toLowerCase()));
    const adminLogin = await (await fetch(`${origin}/admin`)).text();
    assert.ok(adminLogin.includes('<html lang="lv"'));
    assert.ok(adminLogin.includes("Administratora parole"));
    assert.ok(!adminLogin.includes("Пароль администратора"));
    const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
    assert.ok(sitemap.includes("/en/articles/iepazisti-skinstinct"));
    assert.ok(sitemap.includes('hreflang="en"'));
    assert.ok(!sitemap.includes("/account"));
    for (const route of [
      "/robots.txt",
      "/sitemap.xml",
      "/llms.txt",
      "/privacy",
      "/ru/privacy",
      "/en/privacy",
      "/en/articles",
      "/en/articles/iepazisti-skinstinct",
      "/en/account",
      "/images/valerija.webp",
    ])
      assert.equal((await fetch(`${origin}${route}`)).status, 200, route);
  });
  await t.test("one contact is mandatory and concurrent requests cannot double-book", async () => {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() + 3);
    let month = now.toISOString().slice(0, 7);
    const available = await (
      await fetch(`${origin}/api/availability?month=${month}&service=consultation`)
    ).json();
    date =
      Object.keys(available.days).find(
        (key) => key >= now.toISOString().slice(0, 10) && available.days[key] > 0,
      ) || "";
    if (!date) {
      now.setUTCMonth(now.getUTCMonth() + 1, 1);
      month = now.toISOString().slice(0, 7);
      const next = await (
        await fetch(`${origin}/api/availability?month=${month}&service=consultation`)
      ).json();
      date = Object.keys(next.days).find((key) => next.days[key] > 0)!;
    }
    const slots = await (
      await fetch(`${origin}/api/availability?date=${date}&service=consultation`)
    ).json();
    time = slots.slots.find((slot: { available: boolean }) => slot.available).time;
    const data = {
      name: "QA Client",
      phone: "+37120000000",
      email: "",
      consent: true,
      serviceId: "consultation",
      date,
      time,
      lang: "en",
    };
    assert.equal((await post("/api/bookings", { ...data, phone: "" })).status, 400);
    const responses = await Promise.all([post("/api/bookings", data), post("/api/bookings", data)]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
    const winner = responses.find((r) => r.ok)!;
    customer = cookieOf(winner, "sk_client");
    assert.ok(customer);
    const result = await winner.json();
    assert.equal(result.booking.lang, "en");
    assert.equal(result.booking.service_title, "Getting to know your skin");
    code = result.code;
    bookingId = result.booking.id;
    assert.ok(!("code_hash" in result.booking));
    assert.ok(!("customer_id" in result.booking));
    const fresh = await (
      await fetch(`${origin}/api/availability?date=${date}&service=consultation`)
    ).json();
    assert.equal(fresh.slots.find((slot: { time: string }) => slot.time === time).available, false);
  });
  await t.test(
    "customers need their cookie or code and contact; cancellation releases time",
    async () => {
      const anonymous = await (await fetch(`${origin}/api/account`)).json();
      assert.equal(anonymous.bookings.length, 0);
      const own = await (
        await fetch(`${origin}/api/account`, { headers: { Cookie: customer } })
      ).json();
      assert.equal(own.bookings.length, 1);
      assert.equal(
        (await post("/api/account", { code, contact: "wrong@example.invalid" })).status,
        404,
      );
      assert.equal((await post("/api/account", { code, contact: "+37120000000" })).status, 200);
      assert.equal((await post("/api/bookings/cancel", { id: bookingId })).status, 403);
      assert.equal((await fetch(`${origin}/api/calendar?id=${bookingId}`)).status, 404);
      const calendar = await fetch(`${origin}/api/calendar?id=${bookingId}`, {
        headers: { Cookie: customer },
      });
      assert.equal(calendar.status, 200);
      assert.ok((await calendar.text()).includes("STATUS:TENTATIVE"));
      assert.equal((await post("/api/bookings/cancel", { id: bookingId }, customer)).status, 200);
      const released = await (
        await fetch(`${origin}/api/availability?date=${date}&service=consultation`)
      ).json();
      assert.equal(
        released.slots.find((slot: { time: string }) => slot.time === time).available,
        true,
      );
    },
  );
  await t.test(
    "admin can edit content, block time, upload images and publish articles",
    async () => {
      assert.equal((await post("/api/auth/login", { password: "incorrect-password" })).status, 401);
      const login = await post("/api/auth/login", { password });
      assert.equal(login.status, 200);
      admin = cookieOf(login, "sk_admin");
      assert.ok(admin);
      const state = await (
        await fetch(`${origin}/api/admin`, { headers: { Cookie: admin } })
      ).json();
      assert.ok(!JSON.stringify(state).includes(passwordHash));
      const edited = {
        ...state.settings,
        heroTitle: { lv: "QA content update", en: "QA English update", ru: "QA translation" },
      };
      assert.equal(
        (await post("/api/admin/content", { type: "settings", data: edited }, admin)).status,
        200,
      );
      assert.ok((await (await fetch(origin)).text()).includes("QA content update"));
      assert.ok((await (await fetch(`${origin}/en`)).text()).includes("QA English update"));
      assert.equal(
        (await post("/api/admin/content", { type: "settings", data: state.settings }, admin))
          .status,
        200,
      );
      assert.equal(
        (
          await post(
            "/api/admin/block",
            { date, start: "00:00", end: "23:59", note: "QA block" },
            admin,
          )
        ).status,
        200,
      );
      const blocked = await (
        await fetch(`${origin}/api/availability?date=${date}&service=consultation`)
      ).json();
      assert.ok(blocked.slots.every((s: { available: boolean }) => !s.available));
      const withBlock = await (
        await fetch(`${origin}/api/admin`, { headers: { Cookie: admin } })
      ).json();
      assert.equal(
        (await post("/api/admin/unblock", { id: withBlock.blocks[0].id }, admin)).status,
        200,
      );
      const form = new FormData();
      const pixel = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X6xUAAAAASUVORK5CYII=",
        "base64",
      );
      form.set("file", new Blob([pixel], { type: "image/png" }), "test.png");
      const upload = await fetch(`${origin}/api/admin/upload`, {
        method: "POST",
        headers: { Origin: origin, Cookie: admin },
        body: form,
      });
      assert.equal(upload.status, 200);
      const asset = await upload.json();
      assert.match(asset.url, /^\/api\/media\/[a-f0-9-]+\.webp$/);
      const media = await fetch(`${origin}${asset.url}`);
      assert.equal(media.headers.get("content-type"), "image/webp");
      const article = {
        ...state.articles[0],
        id: "qa-article",
        slug: "qa-article",
        title: { lv: "QA article", en: "QA English article", ru: "QA статья" },
        body: {
          lv: "## Heading\nA safe paragraph.",
          en: "## English heading\nEnglish article body.",
          ru: "Текст",
        },
        published: false,
      };
      assert.equal(
        (
          await post(
            "/api/admin/content",
            { type: "articles", data: [...state.articles, article] },
            admin,
          )
        ).status,
        200,
      );
      assert.equal((await fetch(`${origin}/articles/qa-article`)).status, 404);
      assert.equal((await fetch(`${origin}/en/articles/qa-article`)).status, 404);
      assert.equal(
        (
          await post(
            "/api/admin/content",
            { type: "articles", data: [...state.articles, { ...article, published: true }] },
            admin,
          )
        ).status,
        200,
      );
      assert.equal((await fetch(`${origin}/articles/qa-article`)).status, 200);
      assert.ok(
        (await (await fetch(`${origin}/en/articles/qa-article`)).text()).includes(
          "English article body.",
        ),
      );
      assert.equal(
        (await post("/api/admin/content", { type: "articles", data: state.articles }, admin))
          .status,
        200,
      );
    },
  );
  await t.test("inquiries accept phone-only or email-only and survive restart", async () => {
    assert.equal(
      (
        await post("/api/inquiries", {
          name: "QA Contact",
          phone: "+37120000001",
          email: "",
          message: "Synthetic QA",
          consent: true,
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await post("/api/inquiries", {
          name: "QA Contact",
          phone: "",
          email: "test@example.invalid",
          message: "Synthetic QA",
          consent: true,
        })
      ).status,
      200,
    );
    assert.equal(
      (await post("/api/inquiries", { name: "QA Contact", phone: "", email: "", consent: true }))
        .status,
      400,
    );
    await stop();
    await start();
    const state = await (await fetch(`${origin}/api/admin`, { headers: { Cookie: admin } })).json();
    assert.equal(state.inquiries.length, 2);
    assert.equal(state.bookings.length, 1);
    assert.equal(state.bookings[0].status, "cancelled");
    assert.equal((await post("/api/auth/logout", {}, admin)).status, 200);
    assert.equal((await fetch(`${origin}/api/admin`, { headers: { Cookie: admin } })).status, 401);
  });
  await t.test("older bilingual content gains English without losing owner edits", async () => {
    const connection = new Database(path.join(directory, "skinstinct.db"));
    for (const key of ["settings", "services", "articles"]) {
      const row = connection.prepare("SELECT value FROM content WHERE key=?").get(key) as {
        value: string;
      };
      const saved = JSON.parse(row.value, (name, value) => (name === "en" ? undefined : value));
      if (key === "settings") {
        saved.heroTitle.lv = "Owner's Latvian headline";
        saved.heroTitle.ru = "Owner's Russian headline";
      }
      connection.prepare("UPDATE content SET value=? WHERE key=?").run(JSON.stringify(saved), key);
    }
    connection.close();
    assert.ok((await (await fetch(origin)).text()).includes("Owner&#x27;s Latvian headline"));
    assert.ok(
      (await (await fetch(`${origin}/ru`)).text()).includes("Owner&#x27;s Russian headline"),
    );
    const english = await (await fetch(`${origin}/en`)).text();
    assert.ok(english.includes("Your skin."));
    assert.ok(english.includes("Getting to know your skin"));
    assert.ok(
      (await (await fetch(`${origin}/en/articles/iepazisti-skinstinct`)).text()).includes(
        "A place to be heard",
      ),
    );
  });
});
test("Europe/Riga calendar conversion respects daylight saving changes", () => {
  assert.equal(startDate("2026-10-24", 600).toISOString(), "2026-10-24T07:00:00.000Z");
  assert.equal(startDate("2026-10-25", 600).toISOString(), "2026-10-25T08:00:00.000Z");
  assert.equal(startDate("2026-03-28", 600).toISOString(), "2026-03-28T08:00:00.000Z");
  assert.equal(startDate("2026-03-29", 600).toISOString(), "2026-03-29T07:00:00.000Z");
});
