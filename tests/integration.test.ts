import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes, scryptSync,createHmac } from "node:crypto";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { once } from "node:events";
import { get as httpGet } from "node:http";
import { startDate } from "../lib/booking";
import Database from "better-sqlite3";
import {emptyClientCard,emptyClinicalVisit} from '../lib/clinical-schema';

let server: ChildProcess;
let origin = "";
let port = 0;
let logs = "";
const directory = mkdtempSync(path.join(tmpdir(), "skinstinct-qa-"));
const password = randomBytes(24).toString("hex");
const clinicalKey=randomBytes(32).toString('hex');
const webhookSecret=randomBytes(32).toString('hex');
const webhookVerify=randomBytes(16).toString('hex');
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
      CLINICAL_RECORDS_KEY: clinicalKey,
      GOOGLE_SITE_VERIFICATION: 'local-qa-verification-token',
      WHATSAPP_APP_SECRET: webhookSecret,
      WHATSAPP_VERIFY_TOKEN: webhookVerify,
      WHATSAPP_PHONE_NUMBER_ID: '123456',
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

test("Custom domain redirect preserves paths and queries without redirecting other hosts", async () => {
  function getWithHost(route: string, host: string) {
    return new Promise<{ status: number | undefined; location: string | undefined }>(
      (resolve, reject) => {
        httpGet(`${origin}${route}`, { headers: { Host: host } }, (response) => {
          response.resume();
          resolve({ status: response.statusCode, location: response.headers.location });
        }).on("error", reject);
      },
    );
  }
  const redirected = await getWithHost("/en/articles?source=domain", "www.skinstinct.lv");
  assert.equal(redirected.status, 308);
  assert.equal(redirected.location, "https://skinstinct.lv/en/articles?source=domain");

  for (const host of ["skinstinct.lv", "skinstinct-production.up.railway.app"]) {
    const response = await getWithHost("/api/health", host);
    assert.equal(response.status, 200);
    assert.equal(response.location, undefined);
  }
});

test("Booking lifecycle, isolation, content management and restart persistence", async (t) => {
  let admin = "";
  let customer = "";
  let code = "";
  let bookingId = "";
  let date = "";
  let time = "";
  await t.test("public pages are server rendered and private state is protected", async () => {
    assert.equal((await fetch(`${origin}/api/admin`)).status, 401);
    assert.equal((await fetch(`${origin}/api/admin/notifications`)).status,401);
    assert.deepEqual((await(await fetch(`${origin}/api/notifications/options`)).json()).whatsapp,{lv:false,en:false,ru:false});
    assert.equal((await fetch(`${origin}/api/whatsapp?hub.mode=subscribe&hub.verify_token=invalid&hub.challenge=123`)).status,403);
    assert.equal(await(await fetch(`${origin}/api/whatsapp?hub.mode=subscribe&hub.verify_token=${webhookVerify}&hub.challenge=123`)).text(),'123');
    const webhookBody=JSON.stringify({object:'whatsapp_business_account',entry:[]});
    assert.equal((await fetch(`${origin}/api/whatsapp`,{method:'POST',body:webhookBody})).status,403);
    assert.equal((await fetch(`${origin}/api/whatsapp`,{method:'POST',body:webhookBody,headers:{'x-hub-signature-256':'sha256='+createHmac('sha256',webhookSecret).update(webhookBody).digest('hex')}})).status,200);
    assert.equal((await post("/api/inquiries", {}, "", "https://untrusted.example")).status, 403);
    const home = await (await fetch(origin)).text();
    assert.ok(home.includes("Tava āda."));
    assert.ok(home.includes("application/ld+json"));
    assert.ok(home.includes('name="google-site-verification" content="local-qa-verification-token"'));
    const diary=await (await fetch(`${origin}/articles/rupes-ari-arpus-studijas`)).text();
    assert.ok(!diary.includes('Raksts veidots, izvēršot'));
    assert.ok(diary.includes('https://www.instagram.com/p/DeGuHoeDNfY/'));
    const structuredMatch=home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(structuredMatch);
    const structured=JSON.parse(structuredMatch[1]);
    assert.equal(structured.address.postalCode,'LV-5201');
    assert.equal(structured.telephone,'+37126054744');
    assert.equal(structured.hasMap,'https://www.google.com/maps?cid=14328165829266811010');
    const russian = await (await fetch(`${origin}/ru`)).text();
    assert.ok(russian.includes('<html lang="ru"'));
    assert.ok(russian.includes("Твоя кожа."));
    const english = await (await fetch(`${origin}/en`)).text();
    assert.ok(english.includes('<html lang="en"'));
    assert.ok(english.includes("Your skin."));
    assert.ok(english.includes("Youth facial"));
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
    for (const prefix of ['', '/en', '/ru']) {
      const contacts=await fetch(`${origin}${prefix}/contacts`);
      assert.equal(contacts.status,200);
      const markup=(await contacts.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
      for(const detail of ['Pļaviņu iela 51','mailto:vrskinstinct@gmail.com','tel:+37126054744','sms:+37126054744']) assert.ok(markup.includes(detail),`${prefix} contacts missing ${detail}`);
      for(const detail of ['Ceriņi','LV-5214','HABALV22','LV73 HABA 0551 0667 7350 3']) assert.ok(!markup.includes(detail),`${prefix} contacts should omit ${detail}`);
      assert.ok(markup.includes('https://www.google.com/maps?cid=14328165829266811010'));
      assert.ok(sitemap.includes(`${prefix}/contacts`));
    }
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
    assert.equal((await fetch(`${origin}/api/availability?date=2026-12-01&service=diagnostics`)).status,404);
    const beforeOpening = await (await fetch(`${origin}/api/availability?date=2026-11-30&service=youth-facial`)).json();
    assert.deepEqual(beforeOpening.slots,[]);
    const now = new Date();
    now.setUTCDate(now.getUTCDate() + 3);
    let month = now.toISOString().slice(0, 7);
    const available = await (
      await fetch(`${origin}/api/availability?month=${month}&service=youth-facial`)
    ).json();
    date =
      Object.keys(available.days).find(
        (key) => key >= now.toISOString().slice(0, 10) && available.days[key] > 0,
      ) || "";
    if (!date) {
      now.setUTCMonth(now.getUTCMonth() + 1, 1);
      month = now.toISOString().slice(0, 7);
      const next = await (
        await fetch(`${origin}/api/availability?month=${month}&service=youth-facial`)
      ).json();
      date = Object.keys(next.days).find((key) => next.days[key] > 0)!;
    }
    const slots = await (
      await fetch(`${origin}/api/availability?date=${date}&service=youth-facial`)
    ).json();
    time = slots.slots.find((slot: { available: boolean }) => slot.available).time;
    const data = {
      name: "QA Client",
      phone: "+37120000000",
      email: "",
      consent: true,
      serviceId: "youth-facial",
      quoted_price_min: 1,
      date,
      time,
      lang: "en",
    };
    assert.equal((await post("/api/bookings", { ...data, phone: "" })).status, 400);
    assert.equal((await post('/api/bookings',{...data,whatsappOptIn:true})).status,503);
    const responses = await Promise.all([post("/api/bookings", data), post("/api/bookings", data)]);
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
    const winner = responses.find((r) => r.ok)!;
    customer = cookieOf(winner, "sk_client");
    assert.ok(customer);
    const result = await winner.json();
    assert.equal(result.booking.lang, "en");
    assert.equal(result.booking.status,'confirmed');
    assert.equal(result.booking.whatsapp_opt_in,0);
    assert.equal(result.booking.service_title, "Youth facial");
    assert.equal(result.booking.quoted_price_min,date >= '2026-12-01' && date <= '2026-12-31' ? 50 : 60);
    assert.equal(result.booking.end_min-result.booking.start_min,60);
    code = result.code;
    bookingId = result.booking.id;
    assert.ok(!("code_hash" in result.booking));
    assert.ok(!("customer_id" in result.booking));
    const fresh = await (
      await fetch(`${origin}/api/availability?date=${date}&service=youth-facial`)
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
      assert.ok((await calendar.text()).includes("STATUS:CONFIRMED"));
      assert.equal((await post("/api/bookings/cancel", { id: bookingId }, customer)).status, 200);
      const released = await (
        await fetch(`${origin}/api/availability?date=${date}&service=youth-facial`)
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
      assert.equal((await post('/api/admin/open-day',{date:'2026-12-05',start:'09:00',end:'12:00'})).status,401);
      assert.equal((await post('/api/admin/open-day',{date:'2026-12-05',start:'09:00',end:'12:00'},admin)).status,200);
      const saturday=await(await fetch(`${origin}/api/availability?date=2026-12-05&service=youth-facial`)).json();
      assert.equal(saturday.slots.at(-1).time,'11:00');
      assert.equal((await post('/api/admin/open-day',{date:'2026-12-25',start:'09:00',end:'12:00'},admin)).status,400);
      assert.equal((await post('/api/admin/close-day',{date:'2026-12-05'},admin)).status,200);
      const state = await (
        await fetch(`${origin}/api/admin`, { headers: { Cookie: admin } })
      ).json();
      assert.ok(!JSON.stringify(state).includes(passwordHash));
      const edited = {
        ...state.settings,
        heroTitle: { lv: "QA content update", en: "QA English update", ru: "QA translation" },
        vatNumber: 'LV12345678901',
      };
      assert.equal(
        (await post("/api/admin/content", { type: "settings", data: edited }, admin)).status,
        200,
      );
      assert.ok((await (await fetch(origin)).text()).includes("QA content update"));
      assert.ok((await (await fetch(`${origin}/en`)).text()).includes("QA English update"));
      const updatedState=await(await fetch(`${origin}/api/admin`,{headers:{Cookie:admin}})).json();
      assert.equal(updatedState.settings.vatNumber,'LV12345678901');
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
        await fetch(`${origin}/api/availability?date=${date}&service=youth-facial`)
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
    assert.ok(english.includes("Youth facial"));
    assert.ok(
      (await (await fetch(`${origin}/en/articles/iepazisti-skinstinct`)).text()).includes(
        "A place to be heard",
      ),
    );
  });
});
test('introductory visit reserves 90 minutes and has no invented fixed price', async () => {
  const month = '2026-12';
  const availability = await (await fetch(`${origin}/api/availability?month=${month}&service=introductory-treatment`)).json();
  const date = Object.keys(availability.days).find(day=>availability.days[day]>0)!;
  assert.ok(date);
  const slots = await (await fetch(`${origin}/api/availability?date=${date}&service=introductory-treatment`)).json();
  const time = slots.slots.find((slot:{available:boolean})=>slot.available).time;
  const response = await post('/api/bookings',{serviceId:'introductory-treatment',date,time,lang:'lv',name:'Intro QA',phone:'+37120000009',consent:true});
  assert.equal(response.status,200);
  const {booking}=await response.json();
  assert.equal(booking.end_min-booking.start_min,90);
  assert.equal(booking.quoted_price_min,null);
  assert.equal(booking.quoted_price_max,null);
});

test("Europe/Riga calendar conversion respects daylight saving changes", () => {
  assert.equal(startDate("2026-10-24", 600).toISOString(), "2026-10-24T07:00:00.000Z");
  assert.equal(startDate("2026-10-25", 600).toISOString(), "2026-10-25T08:00:00.000Z");
  assert.equal(startDate("2026-03-28", 600).toISOString(), "2026-03-28T08:00:00.000Z");
  assert.equal(startDate("2026-03-29", 600).toISOString(), "2026-03-29T07:00:00.000Z");
});

test('private clinical API uses the administrator session directly and denies public, expired and revoked sessions',async()=>{
 const rejected=await fetch(origin+'/api/clinical/clients');assert.equal(rejected.status,401);assert.match(rejected.headers.get('cache-control')||'',/no-store/);
 assert.equal((await fetch(origin+'/api/clinical/clients',{headers:{Cookie:'sk_client=public-customer'}})).status,401);
 assert.equal((await fetch(origin+'/api/clinical/clients',{headers:{Cookie:'sk_admin=invalid-token'}})).status,401);
 const login=await post('/api/auth/login',{password}),admin=cookieOf(login,'sk_admin');assert.equal(login.status,200);
 const cookie=admin;
 assert.equal((await fetch(origin+'/api/clinical/clients',{headers:{Cookie:cookie}})).status,200,'No extra clinical password or token is required');
 const status=await (await fetch(origin+'/api/clinical/status',{headers:{Cookie:cookie}})).json();assert.equal(status.configured,true);assert.equal(status.expiresAt,undefined);
 const draft={...emptyClientCard(),name:'TEST ONLY Clinical Client',notes:'Private health sentinel 27bb4d'};
 assert.equal((await post('/api/clinical/clients',{id:null,version:0,data:draft},cookie,'https://attacker.invalid')).status,403);
 const created=await post('/api/clinical/clients',{id:null,version:0,data:draft},cookie);assert.equal(created.status,200);const {client}=await created.json();
 const visitResponse=await post(`/api/clinical/clients/${client.id}/visits`,{id:null,version:0,data:{...emptyClinicalVisit('2026-12-01'),service:'TEST ONLY Facial',price:49.50}},cookie);assert.equal(visitResponse.status,200);const {visit}=await visitResponse.json();
 const pdf=Buffer.from('%PDF-1.4\nTEST ONLY\n%%EOF');
 const uploaded=await fetch(`${origin}/api/clinical/clients/${client.id}/documents?name=diagnostika.pdf&visit=${visit.id}`,{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/pdf'},body:pdf});assert.equal(uploaded.status,200);const document=await uploaded.json();
 const documentPath=`/api/clinical/clients/${client.id}/documents/${document.id}`;
 assert.equal((await fetch(origin+documentPath)).status,401);
 const downloaded=await fetch(origin+documentPath,{headers:{Cookie:cookie}});assert.equal(downloaded.status,200);assert.match(downloaded.headers.get('content-disposition')||'',/^attachment/);assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()),pdf);
 const publicPage=await (await fetch(origin)).text();assert.ok(!publicPage.includes(draft.notes));
 const adminPayload=await (await fetch(origin+'/api/admin',{headers:{Cookie:admin}})).text();assert.ok(!adminPayload.includes(draft.notes),'Health data must not leak into the general admin payload');
 const backup=await fetch(origin+'/api/clinical/backup',{headers:{Cookie:cookie}});assert.equal(backup.status,200);const backupText=await backup.text();assert.ok(!backupText.includes(draft.name));assert.ok(!backupText.includes(draft.notes));assert.ok(!backupText.includes(clinicalKey));
 await stop();await start();
 const persisted=await fetch(origin+`/api/clinical/clients/${client.id}`,{headers:{Cookie:cookie}});assert.equal(persisted.status,200);assert.equal((await persisted.json()).client.data.notes,draft.notes);
 const stale=await post('/api/clinical/clients',{id:client.id,version:0,data:draft},cookie);assert.equal(stale.status,409);
 const connection=new Database(path.join(directory,'skinstinct.db'));connection.prepare('INSERT INTO clinical_sessions VALUES (?,?,?)').run('expired-legacy-token','old-admin',Date.now()-1);connection.close();
 assert.equal((await fetch(origin+documentPath,{headers:{Cookie:cookie}})).status,200,'The removed clinical timer must not restrict a valid admin session');
 const otherLogin=await post('/api/auth/login',{password}),otherAdmin=cookieOf(otherLogin,'sk_admin');assert.equal(otherLogin.status,200);
 const loggedOut=await post('/api/auth/logout',{},admin);assert.equal(loggedOut.status,200);assert.equal((await fetch(origin+documentPath,{headers:{Cookie:cookie}})).status,401);
 assert.equal((await fetch(origin+'/api/clinical/clients',{headers:{Cookie:otherAdmin}})).status,200);
 const expirationDb=new Database(path.join(directory,'skinstinct.db'));expirationDb.prepare('UPDATE sessions SET expires_at=?').run(Date.now()-1);expirationDb.close();
 assert.equal((await fetch(origin+'/api/clinical/clients',{headers:{Cookie:otherAdmin}})).status,401,'An expired administrator session must still be denied');
});
