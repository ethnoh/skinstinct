"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  Leaf,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  UsersRound,
} from "lucide-react";
import { api, dateLabel, errorMessage } from "@/lib/client";
import { addressCase } from "@/lib/address-case";
import type {
  Article,
  Block,
  Booking,
  Inquiry,
  Localized,
  Service,
  SiteSettings,
} from "@/lib/types";

type State = {
  settings: SiteSettings;
  services: Service[];
  articles: Article[];
  bookings: Booking[];
  inquiries: Inquiry[];
  blocks: Block[];
};
type Tab =
  | "overview"
  | "calendar"
  | "bookings"
  | "inquiries"
  | "content"
  | "services"
  | "articles"
  | "settings";
const emptyText = (): Localized => ({ lv: "", en: "", ru: "" });
const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const labels = {
  pending: "Gaida apstiprinājumu",
  confirmed: "Apstiprināts",
  cancelled: "Atcelts",
  completed: "Pabeigts",
};
const tabs: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: "overview", label: "Pārskats", icon: LayoutDashboard },
  { id: "calendar", label: "Kalendārs", icon: CalendarDays },
  { id: "bookings", label: "Pieraksti", icon: UsersRound },
  { id: "inquiries", label: "Ziņas", icon: Inbox },
  { id: "content", label: "Teksti un attēli", icon: ImagePlus },
  { id: "services", label: "Pakalpojumi", icon: SlidersHorizontal },
  { id: "articles", label: "Raksti", icon: FileText },
  { id: "settings", label: "Iestatījumi", icon: Settings2 },
];

export function AdminLogin() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await api("/api/auth/login", { password: new FormData(event.currentTarget).get("password") });
      window.location.reload();
    } catch (e) {
      setError(errorMessage(e, "lv"));
      setPending(false);
    }
  }
  return (
    <main className="admin-login" id="main-content">
      <div className="login-box">
        <Link href="/" className="login-brand">
          <img src="/images/skinstinct-logo.webp" width={95} height={95} alt="SKINSTINCT" />
        </Link>
        <span className="eyebrow">SKINSTINCT / ADMIN</span>
        <h1>
          {"Tava studijas"}
          <br />
          <em>{"vadības telpa."}</em>
        </h1>
        <p>{"Pārvaldi studiju, pierakstus un rakstus."}</p>
        <form className="form" onSubmit={submit}>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value="admin"
            readOnly
            className="sr-only"
            tabIndex={-1}
          />
          <label>
            {"Administratora parole"}
            <input
              name="password"
              type="password"
              required
              maxLength={200}
              autoComplete="current-password"
              autoFocus
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={pending}>
            {pending ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}
            {"Pieslēgties"}
          </button>
        </form>
        <Link className="back-link" href="/">
          <ArrowLeft size={15} />
          {"Atgriezties vietnē"}
        </Link>
      </div>
    </main>
  );
}

function LField({
  label,
  value,
  onChange,
  large = false,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  large?: boolean;
}) {
  return (
    <fieldset className="localized-field">
      <legend>{label}</legend>
      <div className="localized-grid">
        {(["lv", "en", "ru"] as const).map((lang) => (
          <label key={lang}>
            <span className="lang-label">{lang.toUpperCase()}</span>
            {large ? (
              <textarea
                rows={4}
                value={value[lang]}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            ) : (
              <input
                value={value[lang]}
                onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function Upload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setPending(true);
    setError("");
    try {
      if (file.size > 8_000_000) throw new Error("TOO_LARGE");
      const form = new FormData();
      form.set("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onChange(d.url);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "INVALID_DATA"
          ? "Pārbaudi datus. Publicēšanai aizpildi virsrakstus un tekstu visās trīs valodās. Pārbaudi cenas, ilgumu un kontaktinformāciju."
          : errorMessage(e, "lv"),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="upload-field">
      <label className="field-label">{label}</label>
      <div className="upload-preview">
        <img src={value} alt={label} />
        <label className="button button-outline button-small">
          {pending ? <LoaderCircle size={16} className="spin" /> : <ImagePlus size={16} />}{" "}
          {pending ? "Augšupielādē..." : "Mainīt attēlu"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={pending}
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        <span>{"JPG, PNG, WebP, AVIF - līdz 8 MB"}</span>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export function Admin() {
  const [state, setState] = useState<State | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleId, setArticleId] = useState("");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [month, setMonth] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Riga" }).slice(0, 7),
  );
  const [selectedDay, setSelectedDay] = useState("");
  async function load(reset = false) {
    const data = await api<State>("/api/admin");
    setState(data);
    if (reset) {
      setSettings(data.settings);
      setServices(data.services);
      setArticles(data.articles);
    }
    return data;
  }
  useEffect(() => {
    load(true).catch((e) => setError(errorMessage(e, "lv")));
  }, []);
  async function act(action: () => Promise<unknown>, success = "Saglabāts") {
    if (pending) return;
    setPending(true);
    setMessage("");
    setError("");
    try {
      await action();
      await load();
      setMessage(success);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "INVALID_DATA"
          ? "Pārbaudi datus. Publicēšanai aizpildi virsrakstus un tekstu visās trīs valodās. Pārbaudi cenas, ilgumu un kontaktinformāciju."
          : errorMessage(e, "lv"),
      );
    } finally {
      setPending(false);
    }
  }
  function save(type: "settings" | "services" | "articles", data: unknown) {
    return act(() => api("/api/admin/content", { type, data }));
  }
  function selectTab(next: Tab) {
    setTab(next);
    setError("");
    setMessage("");
    setFilter("");
    setStatusFilter("");
    setDateFilter("");
  }
  async function logout() {
    await api("/api/auth/logout", {});
    window.location.reload();
  }
  function updateSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }
  function updateService(id: string, patch: Partial<Service>) {
    setServices((v) => v.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function updateArticle(patch: Partial<Article>) {
    setArticles((v) => v.map((a) => (a.id === articleId ? { ...a, ...patch } : a)));
  }
  const article = articles.find((a) => a.id === articleId);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Riga",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const bookings = state?.bookings || [];
  const upcoming = bookings
    .filter((b) => b.date >= today && ["pending", "confirmed"].includes(b.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.start_min - b.start_min);
  const filtered = bookings.filter(
    (b) =>
      (!dateFilter || b.date === dateFilter) &&
      (!statusFilter || b.status === statusFilter) &&
      (!filter || `${b.name} ${b.email} ${b.phone}`.toLowerCase().includes(filter.toLowerCase())),
  );
  function bookingRows(items: Booking[]) {
    return items.length ? (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{"Datums un laiks"}</th>
              <th>{"Klients"}</th>
              <th>{"Pakalpojums"}</th>
              <th>{"Statuss"}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{dateLabel(b.date, "lv")}</strong>
                  <span>
                    {time(b.start_min)} - {time(b.end_min)}
                  </span>
                </td>
                <td>
                  <strong>{b.name}</strong>
                  {b.phone && <a href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}>{b.phone}</a>}
                  {b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}
                </td>
                <td>{addressCase(b.service_title, b.lang)}</td>
                <td>
                  <select
                    aria-label={`Pieraksta statuss: ${b.name}`}
                    className={`status-select status-${b.status}`}
                    value={b.status}
                    disabled={pending}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (
                        next === "cancelled" &&
                        !window.confirm(
                          "Atcelt klienta pierakstu? Šis laiks kļūs pieejams jauniem pieteikumiem.",
                        )
                      )
                        return;
                      act(
                        () => api("/api/admin/booking", { id: b.id, status: next }),
                        "Pieraksta statuss atjaunināts",
                      );
                    }}
                  >
                    {Object.entries(labels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="admin-empty">
        <CalendarDays size={28} />
        <p>{"Pierakstu vēl nav."}</p>
      </div>
    );
  }
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <img src="/images/skinstinct-logo.webp" width={44} height={44} alt="" />
          <span>
            SKINSTINCT<small>{"STUDIJAS VADĪBA"}</small>
          </span>
        </Link>
        <nav aria-label="Studijas administrācija">
          {tabs.map((t) => (
            <button
              className={tab === t.id ? "active" : ""}
              key={t.id}
              onClick={() => selectTab(t.id)}
            >
              <t.icon size={17} />
              {t.label}
              {t.id === "inquiries" &&
                !!state?.inquiries.filter((i) => i.status === "new").length && (
                  <span className="nav-count">
                    {state.inquiries.filter((i) => i.status === "new").length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank">
            {"Apskatīt vietni"}
            <ExternalLink size={15} />
          </Link>
          <button onClick={logout}>
            <LogOut size={16} />
            {"Iziet"}
          </button>
        </div>
      </aside>
      <div className="admin-main" id="main-content">
        <header className="admin-topbar">
          <div>
            <span className="eyebrow">SKINSTINCT / ADMIN</span>
            <h1>{tabs.find((t) => t.id === tab)?.label}</h1>
          </div>
          <button
            className="button button-outline button-small"
            aria-label="Atjaunināt studijas datus"
            onClick={() => act(() => load(), "Atjaunināts")}
            disabled={pending}
          >
            <RefreshCw size={15} className={pending ? "spin" : ""} />
            <span>{"Atjaunināt"}</span>
          </button>
        </header>
        <div className="admin-body">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="admin-success" role="status">
              <Check size={16} />
              {message}
            </p>
          )}
          {!state || !settings ? (
            <div className="admin-loading">
              <LoaderCircle size={25} className="spin" />
              <p>{"Ielādē studiju..."}</p>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="admin-welcome">
                    <div>
                      <span className="eyebrow">RŪPES, KAS PALIEK.</span>
                      <h2>
                        {"Sveicināta,"}
                        <br />
                        <em>{settings.specialistName.split(" ")[0]}.</em>
                      </h2>
                      <p>{"Viss nepieciešamais mierīgai studijas ikdienai."}</p>
                    </div>
                    <Leaf size={70} strokeWidth={0.7} />
                  </div>
                  <div className="admin-stats">
                    {[
                      ["Tuvākās vizītes", upcoming.length],
                      [
                        "Gaida apstiprinājumu",
                        bookings.filter((b) => b.status === "pending" && b.date >= today).length,
                      ],
                      ["Jaunas ziņas", state.inquiries.filter((i) => i.status === "new").length],
                      ["Publicēti raksti", state.articles.filter((a) => a.published).length],
                    ].map(([label, n]) => (
                      <div className="stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{n}</strong>
                      </div>
                    ))}
                  </div>
                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <h2>{"Tuvākās tikšanās"}</h2>
                      <button className="text-button" onClick={() => selectTab("bookings")}>
                        {"Visi pieraksti"}
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                    {bookingRows(upcoming.slice(0, 6))}
                  </section>
                  <section className="admin-panel launch-checklist">
                    <h2>{"Pirms pirmās vizītes"}</h2>
                    <p>
                      {
                        "Sākotnējais darba laiks: pirmdiena-piektdiena, 10:00-18:00. Tas ir paraugs, pārbaudi to iestatījumos. Pieteikumi rezervē laiku kalendārā, bet tos apstiprini Tu."
                      }
                    </p>
                    <div>
                      {[
                        !!settings.address
                          ? "Studijas adrese pievienota"
                          : "Pievieno precīzu studijas adresi",
                        !!(settings.phone || settings.email)
                          ? "Kontaktinformācija pievienota"
                          : "Pievieno darba tālruni vai e-pastu",
                        !!settings.legalRegistration
                          ? "Rekvizīti pievienoti"
                          : "Aizpildi juridisko nosaukumu, numuru un adresi",
                        state.services.every((s) => !s.active || s.price !== null)
                          ? "Cenas norādītas"
                          : "Norādi cenas un pārbaudi pakalpojumu ilgumu",
                      ].map((text) => (
                        <span key={text}>
                          <ShieldCheck size={16} />
                          {text}
                        </span>
                      ))}
                    </div>
                    <button className="text-link" onClick={() => selectTab("settings")}>
                      {"Atvērt iestatījumus"}
                      <ArrowUpRight size={15} />
                    </button>
                  </section>
                </>
              )}
              {tab === "bookings" && (
                <section className="admin-panel">
                  <div className="admin-filters">
                    <input
                      placeholder="Meklēt pēc vārda vai kontaktinformācijas"
                      aria-label="Meklēt pierakstu"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                    <input
                      type="date"
                      aria-label="Pieraksta datums"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <select
                      aria-label="Statusa filtrs"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">{"Visi statusi"}</option>
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="admin-hint">
                    {
                      "Visi laiki norādīti Europe/Riga laika joslā. Statuss “Gaida apstiprinājumu” jau rezervē laiku. Atcelšana to atbrīvo."
                    }
                  </p>
                  {bookingRows(filtered)}
                </section>
              )}
              {tab === "calendar" && (
                <>
                  <section className="admin-panel">
                    <div className="admin-calendar-header">
                      <button
                        className="icon-button"
                        aria-label="Iepriekšējais mēnesis"
                        onClick={() => {
                          const d = new Date(`${month}-01T12:00:00Z`);
                          d.setUTCMonth(d.getUTCMonth() - 1);
                          setMonth(d.toISOString().slice(0, 7));
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <h2>
                        {new Intl.DateTimeFormat("lv-LV", {
                          month: "long",
                          year: "numeric",
                        }).format(new Date(`${month}-01T12:00:00Z`))}
                      </h2>
                      <button
                        className="icon-button"
                        aria-label="Nākamais mēnesis"
                        onClick={() => {
                          const d = new Date(`${month}-01T12:00:00Z`);
                          d.setUTCMonth(d.getUTCMonth() + 1);
                          setMonth(d.toISOString().slice(0, 7));
                        }}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                    <div className="admin-calendar">
                      {["Pr", "Ot", "Tr", "Ce", "Pk", "Se", "Sv"].map((day) => (
                        <span className="weekday" key={day}>
                          {day}
                        </span>
                      ))}
                      {Array.from(
                        { length: (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7 },
                        (_, i) => (
                          <span key={`blank-${i}`} />
                        ),
                      )}
                      {Array.from(
                        {
                          length: new Date(
                            Number(month.slice(0, 4)),
                            Number(month.slice(5)),
                            0,
                          ).getDate(),
                        },
                        (_, i) => {
                          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
                          const count = bookings.filter(
                            (b) => b.date === date && b.status !== "cancelled",
                          ).length;
                          const blocked = state.blocks.some((b) => b.date === date);
                          return (
                            <button
                              key={date}
                              className={`${date === selectedDay ? "selected" : ""} ${date === today ? "today" : ""}`}
                              onClick={() => setSelectedDay(date)}
                            >
                              <strong>{i + 1}</strong>
                              {count > 0 && (
                                <span>
                                  {count} {count === 1 ? "vizīte" : "vizītes"}
                                </span>
                              )}
                              {blocked && <small>{"Bloķēts"}</small>}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </section>
                  {selectedDay && (
                    <section className="admin-panel">
                      <h2>{dateLabel(selectedDay, "lv")}</h2>
                      {bookingRows(bookings.filter((b) => b.date === selectedDay))}
                    </section>
                  )}
                  <section className="admin-panel">
                    <h2>{"Slēgt laiku pierakstiem"}</h2>
                    <p className="admin-hint">
                      {
                        "Atvaļinājums, brīvdiena vai pārtraukums. Esošās vizītes saglabājas. Ja nepieciešams, atcel tās atsevišķi."
                      }
                    </p>
                    <form
                      className="form block-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const f = new FormData(event.currentTarget);
                        act(
                          () =>
                            api("/api/admin/block", {
                              date: f.get("date"),
                              start: f.get("start"),
                              end: f.get("end"),
                              note: f.get("note"),
                            }),
                          "Laiks slēgts jauniem pierakstiem",
                        );
                      }}
                    >
                      <label>
                        {"Datums"}
                        <input
                          type="date"
                          name="date"
                          required
                          defaultValue={selectedDay || today}
                        />
                      </label>
                      <label>
                        {"No"}
                        <input type="time" name="start" required defaultValue="00:00" />
                      </label>
                      <label>
                        {"Līdz"}
                        <input type="time" name="end" required defaultValue="23:59" />
                      </label>
                      <label>
                        {"Piezīme sev"}
                        <input name="note" maxLength={200} placeholder="Brīvdiena / pārtraukums" />
                      </label>
                      <button className="button button-small" disabled={pending}>
                        {"Slēgt laiku"}
                      </button>
                    </form>
                    <div className="blocks-list">
                      {state.blocks.map((b) => (
                        <div key={b.id}>
                          <CalendarDays size={17} />
                          <span>
                            <strong>
                              {dateLabel(b.date, "lv")} · {time(b.start_min)} - {time(b.end_min)}
                            </strong>
                            <small>{b.note || "Slēgtais laiks"}</small>
                          </span>
                          <button
                            className="icon-button"
                            aria-label="Noņemt bloķējumu"
                            onClick={() => {
                              if (window.confirm("Atkal padarīt šo laiku pieejamu pierakstiem?"))
                                act(() => api("/api/admin/unblock", { id: b.id }), "Laiks atvērts");
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
              {tab === "inquiries" && (
                <section className="admin-panel">
                  <h2>{"Ziņas no vietnes"}</h2>
                  <p className="admin-hint">
                    {
                      "Jaunās ziņas saglabājas šeit. Automātiski e-pasti un SMS pagaidām netiek sūtīti."
                    }
                  </p>
                  {state.inquiries.length ? (
                    <div className="inquiry-list">
                      {state.inquiries.map((i) => (
                        <article key={i.id}>
                          <div>
                            <strong>{i.name}</strong>
                            <time>
                              {new Intl.DateTimeFormat("lv-LV", {
                                timeZone: "Europe/Riga",
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(i.created_at))}
                            </time>
                          </div>
                          <div className="inquiry-contacts">
                            {i.phone && (
                              <a href={`tel:${i.phone.replace(/[^+\d]/g, "")}`}>{i.phone}</a>
                            )}
                            {i.email && <a href={`mailto:${i.email}`}>{i.email}</a>}
                          </div>
                          <p style={{ whiteSpace: "pre-wrap" }}>
                            {i.message || "Bez ziņas teksta"}
                          </p>
                          <select
                            aria-label={`Ziņas statuss: ${i.name}`}
                            value={i.status}
                            disabled={pending}
                            onChange={(e) =>
                              act(
                                () =>
                                  api("/api/admin/inquiry", { id: i.id, status: e.target.value }),
                                "Ziņas statuss atjaunināts",
                              )
                            }
                          >
                            <option value="new">{"Jauna"}</option>
                            <option value="contacted">{"Sazinājāmies"}</option>
                            <option value="closed">{"Slēgta"}</option>
                          </select>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <Inbox size={30} />
                      <p>{"Ziņu vēl nav. Kontaktforma vietnē jau darbojas."}</p>
                    </div>
                  )}
                </section>
              )}
              {tab === "content" && (
                <div className="admin-editor">
                  <section className="admin-panel">
                    <h2>{"Sākuma ekrāns"}</h2>
                    <Upload
                      label="Logotips galvenē un kājenē"
                      value={settings.logoImage}
                      onChange={(v) => updateSetting("logoImage", v)}
                    />
                    <p className="admin-hint">
                      {
                        "Rediģē visas trīs valodu versijas. Izmaiņas vietnē parādīsies pēc saglabāšanas."
                      }
                    </p>
                    <div className="form">
                      <LField
                        label="Teksts virs virsraksta"
                        value={settings.heroEyebrow}
                        onChange={(v) => updateSetting("heroEyebrow", v)}
                      />
                      <LField
                        label="Galvenais virsraksts"
                        value={settings.heroTitle}
                        onChange={(v) => updateSetting("heroTitle", v)}
                      />
                      <LField
                        label="Virsraksta otrā rinda"
                        value={settings.heroAccent}
                        onChange={(v) => updateSetting("heroAccent", v)}
                      />
                      <LField
                        label="Apraksts"
                        value={settings.heroDescription}
                        large
                        onChange={(v) => updateSetting("heroDescription", v)}
                      />
                      <Upload
                        label="Sākuma ekrāna attēls"
                        value={settings.heroImage}
                        onChange={(v) => updateSetting("heroImage", v)}
                      />
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>{"Speciāliste"}</h2>
                    <div className="form">
                      <label>
                        {"Vārds un uzvārds"}
                        <input
                          value={settings.specialistName}
                          onChange={(e) => updateSetting("specialistName", e.target.value)}
                        />
                      </label>
                      <label>
                        {"Reģistrācijas numurs"}
                        <input
                          value={settings.registration}
                          onChange={(e) => updateSetting("registration", e.target.value)}
                        />
                      </label>
                      <LField
                        label="Specialitāte"
                        value={settings.specialistTitle}
                        onChange={(v) => updateSetting("specialistTitle", v)}
                      />
                      <LField
                        label="Sadaļas virsraksts. Drīkst izmantot rindas pārnesumu."
                        value={settings.aboutTitle}
                        large
                        onChange={(v) => updateSetting("aboutTitle", v)}
                      />
                      <LField
                        label="Par sevi. Atdali rindkopas ar tukšu rindu."
                        value={settings.aboutBody}
                        large
                        onChange={(v) => updateSetting("aboutBody", v)}
                      />
                      <Upload
                        label="Speciālistes portrets"
                        value={settings.aboutImage}
                        onChange={(v) => updateSetting("aboutImage", v)}
                      />
                    </div>
                  </section>
                  {settings.copy && (
                    <section className="admin-panel">
                      <h2>{"Pārējie lapas teksti"}</h2>
                      <div className="form">
                        {Object.entries(settings.copy).map(([key, value]) => (
                          <LField
                            label={copyLabel(key)}
                            key={key}
                            value={value}
                            large
                            onChange={(v) => updateSetting("copy", { ...settings.copy, [key]: v })}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  <div className="admin-savebar">
                    <button
                      className="button"
                      disabled={pending}
                      onClick={() => save("settings", settings)}
                    >
                      <Save size={17} />
                      {pending ? "Saglabā..." : "Saglabāt tekstus un attēlus"}
                    </button>
                    <Link href="/" target="_blank" className="text-link">
                      {"Atvērt vietni"}
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              )}
              {tab === "services" && (
                <div className="admin-editor">
                  <p className="admin-hint">
                    {
                      "Tukša cena nozīmē “Pēc vienošanās”. Pakalpojuma ilgums un pārtraukums iestatījumos ietekmē brīvos laikus kalendārā."
                    }
                  </p>
                  {services.map((s, i) => (
                    <section className="admin-panel" key={s.id}>
                      <div className="admin-panel-heading">
                        <h2>
                          {String(i + 1).padStart(2, "0")}. {s.title.lv || "Jauns pakalpojums"}
                        </h2>
                        <button
                          className="icon-button"
                          aria-label="Dzēst pakalpojumu"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Noņemt pakalpojumu no vietnes? Esošie pieraksti saglabāsies.",
                              )
                            )
                              setServices((v) => v.filter((x) => x.id !== s.id));
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <div className="form">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={s.active}
                            onChange={(e) => updateService(s.id, { active: e.target.checked })}
                          />
                          <span>{"Pakalpojums redzams vietnē un pieraksta formā"}</span>
                        </label>
                        <LField
                          label="Nosaukums"
                          value={s.title}
                          onChange={(v) => updateService(s.id, { title: v })}
                        />
                        <LField
                          label="Kategorijas apzīmējums"
                          value={s.category}
                          onChange={(v) => updateService(s.id, { category: v })}
                        />
                        <LField
                          label="Apraksts"
                          value={s.description}
                          large
                          onChange={(v) => updateService(s.id, { description: v })}
                        />
                        <div className="form-row">
                          <label>
                            {"Ilgums, min"}
                            <input
                              type="number"
                              min={15}
                              max={240}
                              step={15}
                              value={s.duration}
                              onChange={(e) =>
                                updateService(s.id, { duration: Number(e.target.value) })
                              }
                            />
                          </label>
                          <label>
                            {"Cena, EUR"}
                            <input
                              type="number"
                              min={0}
                              max={10000}
                              value={s.price ?? ""}
                              onChange={(e) =>
                                updateService(s.id, {
                                  price: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              placeholder="Pēc vienošanās"
                            />
                          </label>
                        </div>
                        <Upload
                          label="Pakalpojuma attēls"
                          value={s.image}
                          onChange={(v) => updateService(s.id, { image: v })}
                        />
                      </div>
                    </section>
                  ))}
                  <button
                    className="button button-outline"
                    onClick={() =>
                      setServices((v) => [
                        ...v,
                        {
                          id: `service-${crypto.randomUUID().slice(0, 8)}`,
                          title: emptyText(),
                          category: emptyText(),
                          description: emptyText(),
                          duration: 60,
                          price: null,
                          active: false,
                          image: "/images/treatment.webp",
                        },
                      ])
                    }
                  >
                    <Plus size={17} />
                    {"Pievienot pakalpojumu"}
                  </button>
                  <div className="admin-savebar">
                    <button
                      className="button"
                      disabled={pending}
                      onClick={() => save("services", services)}
                    >
                      <Save size={17} />
                      {"Saglabāt pakalpojumus"}
                    </button>
                  </div>
                </div>
              )}
              {tab === "articles" && (
                <div className="article-editor-layout">
                  <section className="admin-panel article-picker">
                    <div className="admin-panel-heading">
                      <h2>{"Dienasgrāmata"}</h2>
                      <button
                        className="icon-button"
                        aria-label="Jauns raksts"
                        onClick={() => {
                          const id = crypto.randomUUID();
                          setArticles((v) => [
                            ...v,
                            {
                              id,
                              slug: `raksts-${Date.now()}`,
                              title: emptyText(),
                              excerpt: emptyText(),
                              body: emptyText(),
                              category: {
                                lv: "STUDIJAS JAUNUMI",
                                en: "STUDIO NEWS",
                                ru: "НОВОСТИ СТУДИИ",
                              },
                              image: "/images/treatment.webp",
                              published: false,
                              createdAt: new Date().toISOString(),
                            },
                          ]);
                          setArticleId(id);
                        }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    {articles.map((a) => (
                      <button
                        className={`article-picker-row ${a.id === articleId ? "active" : ""}`}
                        key={a.id}
                        onClick={() => setArticleId(a.id)}
                      >
                        <img src={a.image} alt="" />
                        <span>
                          <strong>{a.title.lv || a.title.ru || "Jauns raksts"}</strong>
                          <small>{a.published ? "Publicēts" : "Melnraksts"}</small>
                        </span>
                      </button>
                    ))}
                    <button
                      className="button button-small"
                      disabled={pending}
                      onClick={() => save("articles", articles)}
                    >
                      <Save size={15} />
                      {"Saglabāt visus rakstus"}
                    </button>
                  </section>
                  <section className="admin-panel">
                    {article ? (
                      <>
                        <div className="admin-panel-heading">
                          <h2>{"Raksta redaktors"}</h2>
                          <button
                            className="icon-button"
                            aria-label="Dzēst rakstu"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Dzēst rakstu? Izmaiņas stāsies spēkā pēc saglabāšanas.",
                                )
                              ) {
                                setArticles((v) => v.filter((a) => a.id !== articleId));
                                setArticleId("");
                              }
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <div className="form">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={article.published}
                              onChange={(e) => updateArticle({ published: e.target.checked })}
                            />
                            <span>{"Publicēt vietnē"}</span>
                          </label>
                          <LField
                            label="Raksta nosaukums"
                            value={article.title}
                            onChange={(v) => updateArticle({ title: v })}
                          />
                          <label>
                            {"Raksta adrese. Latīņu burti, cipari un defises."}
                            <input
                              value={article.slug}
                              pattern="[a-z0-9-]+"
                              onChange={(e) =>
                                updateArticle({
                                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                                })
                              }
                            />
                          </label>
                          <LField
                            label="Kategorija"
                            value={article.category}
                            onChange={(v) => updateArticle({ category: v })}
                          />
                          <LField
                            label="Īss apraksts rakstu sarakstam"
                            value={article.excerpt}
                            large
                            onChange={(v) => updateArticle({ excerpt: v })}
                          />
                          <Upload
                            label="Raksta vāka attēls"
                            value={article.image}
                            onChange={(v) => updateArticle({ image: v })}
                          />
                          <LField
                            label="Teksts. Apakšvirsrakstam izmanto ##, rindkopas atdali ar tukšu rindu."
                            value={article.body}
                            large
                            onChange={(v) => updateArticle({ body: v })}
                          />
                          <p className="admin-hint">
                            {"Teksts tiek attēlots droši. HTML un ārēji skripti netiek atbalstīti."}
                          </p>
                          <button
                            className="button"
                            disabled={pending}
                            onClick={() => save("articles", articles)}
                          >
                            <Save size={17} />
                            {"Saglabāt rakstus"}
                          </button>
                          {article.published && (
                            <Link
                              className="text-link"
                              href={`/articles/${article.slug}`}
                              target="_blank"
                            >
                              {"Atvērt publicēto rakstu"}
                              <ExternalLink size={15} />
                            </Link>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="admin-empty">
                        <FileText size={30} />
                        <p>{"Izvēlies rakstu sarakstā vai nospied +, lai izveidotu jaunu."}</p>
                      </div>
                    )}
                  </section>
                </div>
              )}
              {tab === "settings" && (
                <div className="admin-editor">
                  <section className="admin-panel">
                    <h2>{"Pieraksta iestatījumi"}</h2>
                    <div className="form">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.bookingEnabled}
                          onChange={(e) => updateSetting("bookingEnabled", e.target.checked)}
                        />
                        <span>{"Pieņemt vizīšu pieteikumus"}</span>
                      </label>
                      <LField
                        label="Paziņojums klientam pirms pieraksta"
                        value={settings.bookingNotice}
                        large
                        onChange={(v) => updateSetting("bookingNotice", v)}
                      />
                      <div className="form-row">
                        <label>
                          {"Pārtraukums starp vizītēm, min"}
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={settings.bufferMinutes}
                            onChange={(e) => updateSetting("bufferMinutes", Number(e.target.value))}
                          />
                        </label>
                        <label>
                          {"Atcelšanas termiņš pirms vizītes, h"}
                          <input
                            type="number"
                            min={0}
                            max={168}
                            value={settings.cancellationHours}
                            onChange={(e) =>
                              updateSetting("cancellationHours", Number(e.target.value))
                            }
                          />
                        </label>
                      </div>
                      <p className="admin-hint">
                        {
                          "Pieraksts pieejams 90 dienām uz priekšu, vismaz 1 stundu iepriekš. Vizīšu sākuma solis: 30 minūtes. Laika josla: Europe/Riga."
                        }
                      </p>
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>{"Nedēļas darba laiks"}</h2>
                    <p className="admin-hint">
                      {
                        "Slēgtās dienas netiek rādītas kā pieejamas pierakstam. Atsevišķām brīvdienām izmanto laika bloķēšanu kalendārā."
                      }
                    </p>
                    <div className="schedule-editor">
                      {settings.schedule.map((day, i) => (
                        <div key={i}>
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={day.enabled}
                              onChange={(e) =>
                                updateSetting(
                                  "schedule",
                                  settings.schedule.map((d, j) =>
                                    j === i ? { ...d, enabled: e.target.checked } : d,
                                  ),
                                )
                              }
                            />
                            {["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se"][i]}
                          </label>
                          <input
                            type="time"
                            aria-label={`Darba sākums: ${i}`}
                            value={day.start}
                            disabled={!day.enabled}
                            onChange={(e) =>
                              updateSetting(
                                "schedule",
                                settings.schedule.map((d, j) =>
                                  j === i ? { ...d, start: e.target.value } : d,
                                ),
                              )
                            }
                          />
                          <span>{"līdz"}</span>
                          <input
                            type="time"
                            aria-label={`Darba beigas: ${i}`}
                            value={day.end}
                            disabled={!day.enabled}
                            onChange={(e) =>
                              updateSetting(
                                "schedule",
                                settings.schedule.map((d, j) =>
                                  j === i ? { ...d, end: e.target.value } : d,
                                ),
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>{"Kontakti un rekvizīti"}</h2>
                    <div className="form">
                      {(
                        [
                          ["city", "Pilsēta"],
                          ["address", "Studijas adrese"],
                          ["phone", "Tālrunis"],
                          ["email", "E-pasts"],
                          ["instagram", "Instagram saite"],
                          ["legalName", "Juridiskais nosaukums / datu pārzinis"],
                          ["legalRegistration", "Uzņēmuma reģistrācijas numurs"],
                          ["legalAddress", "Juridiskā adrese"],
                          ["privacyEmail", "E-pasts jautājumiem par datiem"],
                        ] as [keyof SiteSettings, string][]
                      ).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            value={String(settings[key])}
                            onChange={(e) => updateSetting(key, e.target.value as never)}
                          />
                        </label>
                      ))}
                      <p className="admin-hint">
                        {
                          "Rekvizīti automātiski tiek attēloti privātuma politikā. Tukši kontakti vietnē netiek rādīti."
                        }
                      </p>
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>{"Meklēšana un indeksācija"}</h2>
                    <div className="form">
                      <LField
                        label="Vietnes apraksts meklētājiem"
                        value={settings.seoDescription}
                        large
                        onChange={(v) => updateSetting("seoDescription", v)}
                      />
                      <p className="admin-hint">
                        {
                          "Virsraksti, canonical, hreflang, Open Graph un strukturētie dati tiek veidoti automātiski. Publicēšana negarantē pozīciju vai indeksācijas termiņu."
                        }
                      </p>
                      <div className="admin-link-row">
                        <a href="/sitemap.xml" target="_blank">
                          Sitemap
                          <ExternalLink size={13} />
                        </a>
                        <a href="/robots.txt" target="_blank">
                          Robots
                          <ExternalLink size={13} />
                        </a>
                        <a href="/llms.txt" target="_blank">
                          LLMs
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </section>
                  <div className="admin-savebar">
                    <button
                      className="button"
                      disabled={pending}
                      onClick={() => save("settings", settings)}
                    >
                      <Save size={17} />
                      {"Saglabāt iestatījumus"}
                    </button>
                  </div>
                  <section className="admin-panel">
                    <h2>{"Drošība"}</h2>
                    <p className="admin-hint">
                      {
                        "Paroles maiņa beigs pārējās administratora sesijas. Jaunajai parolei jābūt vismaz 12 rakstzīmēm."
                      }
                    </p>
                    <form
                      className="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const data = new FormData(form);
                        if (data.get("password") !== data.get("repeat")) {
                          setError("Paroles nesakrīt.");
                          return;
                        }
                        act(async () => {
                          await api("/api/admin/password", {
                            current: data.get("current"),
                            password: data.get("password"),
                          });
                          form.reset();
                        }, "Parole mainīta. Saglabā to savā paroļu pārvaldniekā.");
                      }}
                    >
                      <label>
                        {"Pašreizējā parole"}
                        <input
                          type="password"
                          name="current"
                          required
                          autoComplete="current-password"
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          {"Jaunā parole"}
                          <input
                            type="password"
                            name="password"
                            required
                            minLength={12}
                            maxLength={200}
                            autoComplete="new-password"
                          />
                        </label>
                        <label>
                          {"Atkārto paroli"}
                          <input
                            type="password"
                            name="repeat"
                            required
                            minLength={12}
                            maxLength={200}
                            autoComplete="new-password"
                          />
                        </label>
                      </div>
                      <button className="button button-outline" disabled={pending}>
                        <ShieldCheck size={16} />
                        {"Mainīt paroli"}
                      </button>
                    </form>
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
const copyLabels: Record<string, string> = {
  rhythmEyebrow: "Vizītes ritms: sadaļas apzīmējums",
  rhythmTitle: "Vizītes ritms: virsraksts",
  rhythmIntro: "Vizītes ritms: ievads",
  rhythmServices: "Vizītes ritms: pakalpojumu skaita apzīmējums",
  rhythmDuration: "Vizītes ritms: ilguma apzīmējums",
  rhythmChartTitle: "Vizītes ritms: diagrammas virsraksts",
  rhythmChartNote: "Vizītes ritms: diagrammas paskaidrojums",
  servicesTitle: "Pakalpojumi: virsraksta pirmā rinda",
  servicesAccent: "Pakalpojumi: otrā rinda",
  servicesIntro: "Pakalpojumi: ievads",
  quote: "Pieeja: citāts",
  processTitle: "Vizītes norise: virsraksts",
  bookingTitle: "Pieraksts: virsraksts",
  bookingAccent: "Pieraksts: otrā rinda",
  bookingIntro: "Pieraksts: apraksts",
  faqTitle: "Jautājumi: virsraksts",
  journalTitle: "Dienasgrāmata: virsraksts",
  journalAccent: "Dienasgrāmata: otrā rinda",
  contactTitle: "Kontakti: virsraksts",
  contactAccent: "Kontakti: otrā rinda",
  contactIntro: "Kontakti: apraksts",
  contactFormTitle: "Kontakti: formas virsraksts",
  footerDescription: "Kājenes apraksts",
};

function copyLabel(key: string) {
  if (copyLabels[key]) return copyLabels[key];
  const value = key.match(/^value([1-3])(Title|Text)$/);
  if (value)
    return `Mūsu pieeja: vērtība ${value[1]}, ${value[2] === "Title" ? "nosaukums" : "apraksts"}`;
  const process = key.match(/^process([1-3])(Title|Text)$/);
  if (process)
    return `Vizītes solis ${process[1]}: ${process[2] === "Title" ? "nosaukums" : "apraksts"}`;
  const faq = key.match(/^faq([1-4])(Question|Answer)$/);
  if (faq) return `Biežie jautājumi ${faq[1]}: ${faq[2] === "Question" ? "jautājums" : "atbilde"}`;
  return "Lapas teksts";
}
