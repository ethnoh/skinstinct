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
const emptyText = (): Localized => ({ lv: "", ru: "" });
const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
const labels = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  cancelled: "Отменена",
  completed: "Завершена",
};
const tabs: { id: Tab; label: string; icon: typeof Leaf }[] = [
  { id: "overview", label: "Обзор", icon: LayoutDashboard },
  { id: "calendar", label: "Календарь", icon: CalendarDays },
  { id: "bookings", label: "Записи", icon: UsersRound },
  { id: "inquiries", label: "Обращения", icon: Inbox },
  { id: "content", label: "Тексты и фото", icon: ImagePlus },
  { id: "services", label: "Услуги", icon: SlidersHorizontal },
  { id: "articles", label: "Статьи", icon: FileText },
  { id: "settings", label: "Настройки", icon: Settings2 },
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
      setError(errorMessage(e, "ru"));
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
          Твоё пространство
          <br />
          <em>для заботы.</em>
        </h1>
        <p>Управляй студией, записями и историями.</p>
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
            Пароль администратора
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
            {pending ? <LoaderCircle className="spin" size={18} /> : <ShieldCheck size={18} />}Войти
            в студию
          </button>
        </form>
        <Link className="back-link" href="/">
          <ArrowLeft size={15} />
          Вернуться на сайт
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
        {(["lv", "ru"] as const).map((lang) => (
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
          ? "Проверь данные. Для публикации заполни заголовки и текст на обоих языках; проверь цены, длительность и контакты."
          : errorMessage(e, "ru"),
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
          {pending ? "Загружаем..." : "Заменить фото"}
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
        <span>JPG, PNG, WebP, AVIF · до 8 МБ</span>
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
    load(true).catch((e) => setError(errorMessage(e, "ru")));
  }, []);
  async function act(action: () => Promise<unknown>, success = "Сохранено") {
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
          ? "Проверь данные. Для публикации заполни заголовки и текст на обоих языках; проверь цены, длительность и контакты."
          : errorMessage(e, "ru"),
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
              <th>Когда</th>
              <th>Клиент</th>
              <th>Услуга</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{dateLabel(b.date, "ru")}</strong>
                  <span>
                    {time(b.start_min)} - {time(b.end_min)}
                  </span>
                </td>
                <td>
                  <strong>{b.name}</strong>
                  {b.phone && <a href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}>{b.phone}</a>}
                  {b.email && <a href={`mailto:${b.email}`}>{b.email}</a>}
                </td>
                <td>{b.service_title}</td>
                <td>
                  <select
                    aria-label={`Статус записи ${b.name}`}
                    className={`status-select status-${b.status}`}
                    value={b.status}
                    disabled={pending}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (
                        next === "cancelled" &&
                        !window.confirm(
                          "Отменить запись клиента? Время станет доступно для новых заявок.",
                        )
                      )
                        return;
                      act(
                        () => api("/api/admin/booking", { id: b.id, status: next }),
                        "Статус записи обновлён",
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
        <p>Записей пока нет.</p>
      </div>
    );
  }
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand">
          <img src="/images/skinstinct-logo.webp" width={44} height={44} alt="" />
          <span>
            SKINSTINCT<small>ПРОСТРАНСТВО СТУДИИ</small>
          </span>
        </Link>
        <nav aria-label="Управление студией">
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
            Посмотреть сайт
            <ExternalLink size={15} />
          </Link>
          <button onClick={logout}>
            <LogOut size={16} />
            Выйти
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
            aria-label="Обновить данные студии"
            onClick={() => act(() => load(), "Обновлено")}
            disabled={pending}
          >
            <RefreshCw size={15} className={pending ? "spin" : ""} />
            <span>Обновить</span>
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
              <p>Открываем студию...</p>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="admin-welcome">
                    <div>
                      <span className="eyebrow">RŪPES, KAS PALIEK.</span>
                      <h2>
                        Добро пожаловать,
                        <br />
                        <em>{settings.specialistName.split(" ")[0]}.</em>
                      </h2>
                      <p>Всё, что нужно для спокойной работы студии.</p>
                    </div>
                    <Leaf size={70} strokeWidth={0.7} />
                  </div>
                  <div className="admin-stats">
                    {[
                      ["Ближайшие визиты", upcoming.length],
                      [
                        "Ждут подтверждения",
                        bookings.filter((b) => b.status === "pending" && b.date >= today).length,
                      ],
                      ["Новые обращения", state.inquiries.filter((i) => i.status === "new").length],
                      ["Опубликовано статей", state.articles.filter((a) => a.published).length],
                    ].map(([label, n]) => (
                      <div className="stat-card" key={label}>
                        <span>{label}</span>
                        <strong>{n}</strong>
                      </div>
                    ))}
                  </div>
                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <h2>Ближайшие встречи</h2>
                      <button className="text-button" onClick={() => selectTab("bookings")}>
                        Все записи
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                    {bookingRows(upcoming.slice(0, 6))}
                  </section>
                  <section className="admin-panel launch-checklist">
                    <h2>Перед первым приёмом</h2>
                    <p>
                      Начальное расписание: пн-пт, 10:00-18:00. Это шаблон, проверь его в
                      настройках. Заявки занимают время в календаре, а подтверждаешь их ты.
                    </p>
                    <div>
                      {[
                        !!settings.address ? "Точный адрес добавлен" : "Добавь точный адрес студии",
                        !!(settings.phone || settings.email)
                          ? "Контакт для связи добавлен"
                          : "Добавь рабочий телефон или почту",
                        !!settings.legalRegistration
                          ? "Реквизиты добавлены"
                          : "Заполни юридическое название, номер и адрес",
                        state.services.every((s) => !s.active || s.price !== null)
                          ? "Цены заполнены"
                          : "Укажи цены и проверь длительность услуг",
                      ].map((text) => (
                        <span key={text}>
                          <ShieldCheck size={16} />
                          {text}
                        </span>
                      ))}
                    </div>
                    <button className="text-link" onClick={() => selectTab("settings")}>
                      Перейти к настройкам
                      <ArrowUpRight size={15} />
                    </button>
                  </section>
                </>
              )}
              {tab === "bookings" && (
                <section className="admin-panel">
                  <div className="admin-filters">
                    <input
                      placeholder="Найти по имени или контакту"
                      aria-label="Поиск записи"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    />
                    <input
                      type="date"
                      aria-label="Дата записи"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <select
                      aria-label="Фильтр статуса"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      {Object.entries(labels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="admin-hint">
                    Все часы указаны по Europe/Riga. Статус «Ожидает» уже резервирует время. Отмена
                    освобождает его.
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
                        aria-label="Предыдущий месяц"
                        onClick={() => {
                          const d = new Date(`${month}-01T12:00:00Z`);
                          d.setUTCMonth(d.getUTCMonth() - 1);
                          setMonth(d.toISOString().slice(0, 7));
                        }}
                      >
                        <ChevronLeft />
                      </button>
                      <h2>
                        {new Intl.DateTimeFormat("ru-RU", {
                          month: "long",
                          year: "numeric",
                        }).format(new Date(`${month}-01T12:00:00Z`))}
                      </h2>
                      <button
                        className="icon-button"
                        aria-label="Следующий месяц"
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
                      {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
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
                                  {count} {count === 1 ? "визит" : "визита"}
                                </span>
                              )}
                              {blocked && <small>Блок</small>}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </section>
                  {selectedDay && (
                    <section className="admin-panel">
                      <h2>{dateLabel(selectedDay, "ru")}</h2>
                      {bookingRows(bookings.filter((b) => b.date === selectedDay))}
                    </section>
                  )}
                  <section className="admin-panel">
                    <h2>Закрыть время для записи</h2>
                    <p className="admin-hint">
                      Отпуск, выходной или перерыв. Уже существующие визиты сохраняются, при
                      необходимости отмени их отдельно.
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
                          "Время закрыто для новых записей",
                        );
                      }}
                    >
                      <label>
                        Дата
                        <input
                          type="date"
                          name="date"
                          required
                          defaultValue={selectedDay || today}
                        />
                      </label>
                      <label>
                        С<input type="time" name="start" required defaultValue="00:00" />
                      </label>
                      <label>
                        До
                        <input type="time" name="end" required defaultValue="23:59" />
                      </label>
                      <label>
                        Причина для тебя
                        <input name="note" maxLength={200} placeholder="Выходной / перерыв" />
                      </label>
                      <button className="button button-small" disabled={pending}>
                        Закрыть время
                      </button>
                    </form>
                    <div className="blocks-list">
                      {state.blocks.map((b) => (
                        <div key={b.id}>
                          <CalendarDays size={17} />
                          <span>
                            <strong>
                              {dateLabel(b.date, "ru")} · {time(b.start_min)} - {time(b.end_min)}
                            </strong>
                            <small>{b.note || "Закрытое время"}</small>
                          </span>
                          <button
                            className="icon-button"
                            aria-label="Убрать блокировку"
                            onClick={() => {
                              if (window.confirm("Сделать это время снова доступным для записи?"))
                                act(() => api("/api/admin/unblock", { id: b.id }), "Время открыто");
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
                  <h2>Сообщения с сайта</h2>
                  <p className="admin-hint">
                    Новые обращения сохраняются здесь. Автоматические письма и SMS пока не
                    отправляются.
                  </p>
                  {state.inquiries.length ? (
                    <div className="inquiry-list">
                      {state.inquiries.map((i) => (
                        <article key={i.id}>
                          <div>
                            <strong>{i.name}</strong>
                            <time>
                              {new Intl.DateTimeFormat("ru-RU", {
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
                          <p style={{ whiteSpace: "pre-wrap" }}>{i.message || "Без сообщения"}</p>
                          <select
                            aria-label={`Статус обращения ${i.name}`}
                            value={i.status}
                            disabled={pending}
                            onChange={(e) =>
                              act(
                                () =>
                                  api("/api/admin/inquiry", { id: i.id, status: e.target.value }),
                                "Обращение обновлено",
                              )
                            }
                          >
                            <option value="new">Новое</option>
                            <option value="contacted">Связались</option>
                            <option value="closed">Закрыто</option>
                          </select>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">
                      <Inbox size={30} />
                      <p>Пока никто не написал. Форма на сайте уже работает.</p>
                    </div>
                  )}
                </section>
              )}
              {tab === "content" && (
                <div className="admin-editor">
                  <section className="admin-panel">
                    <h2>Первый экран</h2>
                    <Upload
                      label="Логотип в шапке и подвале"
                      value={settings.logoImage}
                      onChange={(v) => updateSetting("logoImage", v)}
                    />
                    <p className="admin-hint">
                      Редактируй обе языковые версии. Изменения появятся на сайте после сохранения.
                    </p>
                    <div className="form">
                      <LField
                        label="Надпись над заголовком"
                        value={settings.heroEyebrow}
                        onChange={(v) => updateSetting("heroEyebrow", v)}
                      />
                      <LField
                        label="Главный заголовок"
                        value={settings.heroTitle}
                        onChange={(v) => updateSetting("heroTitle", v)}
                      />
                      <LField
                        label="Акцент курсивом"
                        value={settings.heroAccent}
                        onChange={(v) => updateSetting("heroAccent", v)}
                      />
                      <LField
                        label="Описание"
                        value={settings.heroDescription}
                        large
                        onChange={(v) => updateSetting("heroDescription", v)}
                      />
                      <Upload
                        label="Фото первого экрана"
                        value={settings.heroImage}
                        onChange={(v) => updateSetting("heroImage", v)}
                      />
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>Специалист</h2>
                    <div className="form">
                      <label>
                        Имя и фамилия
                        <input
                          value={settings.specialistName}
                          onChange={(e) => updateSetting("specialistName", e.target.value)}
                        />
                      </label>
                      <label>
                        Регистрационный номер
                        <input
                          value={settings.registration}
                          onChange={(e) => updateSetting("registration", e.target.value)}
                        />
                      </label>
                      <LField
                        label="Специальность"
                        value={settings.specialistTitle}
                        onChange={(v) => updateSetting("specialistTitle", v)}
                      />
                      <LField
                        label="Заголовок блока. Перенос строки допустим."
                        value={settings.aboutTitle}
                        large
                        onChange={(v) => updateSetting("aboutTitle", v)}
                      />
                      <LField
                        label="О себе. Абзацы разделяй пустой строкой."
                        value={settings.aboutBody}
                        large
                        onChange={(v) => updateSetting("aboutBody", v)}
                      />
                      <Upload
                        label="Портрет специалиста"
                        value={settings.aboutImage}
                        onChange={(v) => updateSetting("aboutImage", v)}
                      />
                    </div>
                  </section>
                  {settings.copy && (
                    <section className="admin-panel">
                      <h2>Остальные тексты страницы</h2>
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
                      {pending ? "Сохраняем..." : "Сохранить тексты и фото"}
                    </button>
                    <Link href="/" target="_blank" className="text-link">
                      Открыть сайт
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </div>
              )}
              {tab === "services" && (
                <div className="admin-editor">
                  <p className="admin-hint">
                    Пустая цена означает «По согласованию». Длительность и перерыв в настройках
                    влияют на свободное время в календаре.
                  </p>
                  {services.map((s, i) => (
                    <section className="admin-panel" key={s.id}>
                      <div className="admin-panel-heading">
                        <h2>
                          {String(i + 1).padStart(2, "0")}. {s.title.lv || "Новая услуга"}
                        </h2>
                        <button
                          className="icon-button"
                          aria-label="Удалить услугу"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Убрать услугу с сайта? Существующие записи сохранятся.",
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
                          <span>Услуга доступна на сайте и в записи</span>
                        </label>
                        <LField
                          label="Название"
                          value={s.title}
                          onChange={(v) => updateService(s.id, { title: v })}
                        />
                        <LField
                          label="Метка категории"
                          value={s.category}
                          onChange={(v) => updateService(s.id, { category: v })}
                        />
                        <LField
                          label="Описание"
                          value={s.description}
                          large
                          onChange={(v) => updateService(s.id, { description: v })}
                        />
                        <div className="form-row">
                          <label>
                            Длительность, мин
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
                            Цена, EUR
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
                              placeholder="По согласованию"
                            />
                          </label>
                        </div>
                        <Upload
                          label="Фото услуги"
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
                    Добавить услугу
                  </button>
                  <div className="admin-savebar">
                    <button
                      className="button"
                      disabled={pending}
                      onClick={() => save("services", services)}
                    >
                      <Save size={17} />
                      Сохранить услуги
                    </button>
                  </div>
                </div>
              )}
              {tab === "articles" && (
                <div className="article-editor-layout">
                  <section className="admin-panel article-picker">
                    <div className="admin-panel-heading">
                      <h2>Дневник</h2>
                      <button
                        className="icon-button"
                        aria-label="Новая статья"
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
                              category: { lv: "STUDIJAS JAUNUMI", ru: "НОВОСТИ СТУДИИ" },
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
                          <strong>{a.title.lv || a.title.ru || "Новая статья"}</strong>
                          <small>{a.published ? "Опубликована" : "Черновик"}</small>
                        </span>
                      </button>
                    ))}
                    <button
                      className="button button-small"
                      disabled={pending}
                      onClick={() => save("articles", articles)}
                    >
                      <Save size={15} />
                      Сохранить все статьи
                    </button>
                  </section>
                  <section className="admin-panel">
                    {article ? (
                      <>
                        <div className="admin-panel-heading">
                          <h2>Редактор статьи</h2>
                          <button
                            className="icon-button"
                            aria-label="Удалить статью"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Удалить статью? Изменение вступит в силу после сохранения.",
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
                            <span>Опубликовать на сайте</span>
                          </label>
                          <LField
                            label="Название статьи"
                            value={article.title}
                            onChange={(v) => updateArticle({ title: v })}
                          />
                          <label>
                            Адрес статьи. Латинские буквы, цифры и дефисы.
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
                            label="Категория"
                            value={article.category}
                            onChange={(v) => updateArticle({ category: v })}
                          />
                          <LField
                            label="Короткое описание в списке"
                            value={article.excerpt}
                            large
                            onChange={(v) => updateArticle({ excerpt: v })}
                          />
                          <Upload
                            label="Обложка статьи"
                            value={article.image}
                            onChange={(v) => updateArticle({ image: v })}
                          />
                          <LField
                            label="Текст. Используй ## перед подзаголовком, пустую строку между абзацами."
                            value={article.body}
                            large
                            onChange={(v) => updateArticle({ body: v })}
                          />
                          <p className="admin-hint">
                            Текст отображается безопасно. HTML и сторонние скрипты не
                            поддерживаются.
                          </p>
                          <button
                            className="button"
                            disabled={pending}
                            onClick={() => save("articles", articles)}
                          >
                            <Save size={17} />
                            Сохранить статьи
                          </button>
                          {article.published && (
                            <Link
                              className="text-link"
                              href={`/articles/${article.slug}`}
                              target="_blank"
                            >
                              Открыть опубликованную статью
                              <ExternalLink size={15} />
                            </Link>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="admin-empty">
                        <FileText size={30} />
                        <p>Выбери статью слева или нажми +, чтобы создать новую.</p>
                      </div>
                    )}
                  </section>
                </div>
              )}
              {tab === "settings" && (
                <div className="admin-editor">
                  <section className="admin-panel">
                    <h2>Режим записи</h2>
                    <div className="form">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={settings.bookingEnabled}
                          onChange={(e) => updateSetting("bookingEnabled", e.target.checked)}
                        />
                        <span>Принимать предварительные заявки на визит</span>
                      </label>
                      <LField
                        label="Сообщение клиенту перед записью"
                        value={settings.bookingNotice}
                        large
                        onChange={(v) => updateSetting("bookingNotice", v)}
                      />
                      <div className="form-row">
                        <label>
                          Перерыв между визитами, мин
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={settings.bufferMinutes}
                            onChange={(e) => updateSetting("bufferMinutes", Number(e.target.value))}
                          />
                        </label>
                        <label>
                          Отмена клиентом не позднее, ч
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
                        Запись на 90 дней вперёд, не менее чем за 1 час. Шаг начала визита: 30
                        минут. Часовой пояс: Europe/Riga.
                      </p>
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>Недельное расписание</h2>
                    <p className="admin-hint">
                      Закрытые дни не отображаются как доступные для записи. Для отдельных выходных
                      используй блокировки в календаре.
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
                            {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][i]}
                          </label>
                          <input
                            type="time"
                            aria-label={`Начало ${i}`}
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
                          <span>до</span>
                          <input
                            type="time"
                            aria-label={`Конец ${i}`}
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
                    <h2>Контакты и реквизиты</h2>
                    <div className="form">
                      {(
                        [
                          ["city", "Город"],
                          ["address", "Адрес студии"],
                          ["phone", "Телефон"],
                          ["email", "Электронная почта"],
                          ["instagram", "Ссылка на Instagram"],
                          ["legalName", "Юридическое название / оператор данных"],
                          ["legalRegistration", "Регистрационный номер компании"],
                          ["legalAddress", "Юридический адрес"],
                          ["privacyEmail", "Почта для вопросов о данных"],
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
                        Реквизиты автоматически отображаются в политике конфиденциальности. Пустые
                        контакты не показываются на сайте.
                      </p>
                    </div>
                  </section>
                  <section className="admin-panel">
                    <h2>Поиск и индексация</h2>
                    <div className="form">
                      <LField
                        label="Описание сайта для поисковых систем"
                        value={settings.seoDescription}
                        large
                        onChange={(v) => updateSetting("seoDescription", v)}
                      />
                      <p className="admin-hint">
                        Заголовки, canonical, hreflang, Open Graph и структурированные данные
                        формируются автоматически. Публикация не гарантирует позицию или сроки
                        индексации.
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
                      Сохранить настройки
                    </button>
                  </div>
                  <section className="admin-panel">
                    <h2>Безопасность</h2>
                    <p className="admin-hint">
                      Смена пароля завершит остальные администраторские сеансы. Новый пароль: не
                      менее 12 символов.
                    </p>
                    <form
                      className="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const data = new FormData(form);
                        if (data.get("password") !== data.get("repeat")) {
                          setError("Пароли не совпадают.");
                          return;
                        }
                        act(async () => {
                          await api("/api/admin/password", {
                            current: data.get("current"),
                            password: data.get("password"),
                          });
                          form.reset();
                        }, "Пароль изменён. Сохрани его в своём менеджере паролей.");
                      }}
                    >
                      <label>
                        Текущий пароль
                        <input
                          type="password"
                          name="current"
                          required
                          autoComplete="current-password"
                        />
                      </label>
                      <div className="form-row">
                        <label>
                          Новый пароль
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
                          Повтори пароль
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
                        Изменить пароль
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
  servicesTitle: "Услуги: первая строка заголовка",
  servicesAccent: "Услуги: акцент",
  servicesIntro: "Услуги: вступление",
  quote: "Философия: цитата",
  processTitle: "Как проходит визит: заголовок",
  bookingTitle: "Запись: заголовок",
  bookingAccent: "Запись: акцент",
  bookingIntro: "Запись: описание",
  faqTitle: "Вопросы: заголовок",
  journalTitle: "Журнал: заголовок",
  journalAccent: "Журнал: акцент",
  contactTitle: "Контакты: заголовок",
  contactAccent: "Контакты: акцент",
  contactIntro: "Контакты: описание",
  contactFormTitle: "Контакты: заголовок формы",
  footerDescription: "Описание в подвале",
};

function copyLabel(key: string) {
  if (copyLabels[key]) return copyLabels[key];
  const value = key.match(/^value([1-3])(Title|Text)$/);
  if (value)
    return `Наш подход: ценность ${value[1]}, ${value[2] === "Title" ? "название" : "описание"}`;
  const process = key.match(/^process([1-3])(Title|Text)$/);
  if (process)
    return `Шаг визита ${process[1]}: ${process[2] === "Title" ? "название" : "описание"}`;
  const faq = key.match(/^faq([1-4])(Question|Answer)$/);
  if (faq) return `Частые вопросы ${faq[1]}: ${faq[2] === "Question" ? "вопрос" : "ответ"}`;
  return "Текст страницы";
}
