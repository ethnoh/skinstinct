"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Leaf,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { api, basePath, dateLabel, errorMessage, localeCode, money } from "@/lib/client";
import { tr } from "@/lib/i18n";
import type { Booking, Lang, Service, SiteSettings } from "@/lib/types";

type Slots = { time: string; available: boolean }[];
export function BookingWidget({
  lang,
  services,
  settings,
  initialToday,
}: {
  lang: Lang;
  services: Service[];
  settings: SiteSettings;
  initialToday: string;
}) {
  const ru = lang === "ru";
  const active = services.filter((s) => s.active);
  const [serviceId, setService] = useState(active[0]?.id || "");
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(initialToday.slice(0, 7));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [days, setDays] = useState<Record<string, number>>({});
  const [slots, setSlots] = useState<Slots>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ booking: Booking; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const service = active.find((s) => s.id === serviceId);
  useEffect(() => {
    const choose = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (active.some((s) => s.id === id)) {
        setService(id);
        setStep(2);
        setDate("");
        setTime("");
        setResult(null);
      }
    };
    window.addEventListener("choose-service", choose);
    return () => window.removeEventListener("choose-service", choose);
  }, [services]);
  useEffect(() => {
    if (!serviceId || !settings.bookingEnabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/availability?month=${month}&service=${serviceId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setDays(data.days))
      .catch((e) => {
        if (e.name !== "AbortError") setError(errorMessage(e, lang));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month, serviceId, settings.bookingEnabled, lang]);
  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setTime("");
    fetch(`/api/availability?date=${date}&service=${serviceId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setSlots(data.slots))
      .catch((e) => {
        if (e.name !== "AbortError") setError(errorMessage(e, lang));
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false);
      });
    return () => controller.abort();
  }, [date, serviceId, lang]);
  function changeMonth(delta: number) {
    const current = new Date(`${month}-01T12:00:00Z`);
    current.setUTCMonth(current.getUTCMonth() + delta);
    setMonth(current.toISOString().slice(0, 7));
    setDate("");
    setTime("");
    setError("");
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const data = await api<{ booking: Booking; code: string }>("/api/bookings", {
        name: form.get("name"),
        phone,
        email,
        consent: form.get("consent") === "on",
        website: form.get("website"),
        serviceId,
        date,
        time,
        lang,
      });
      setResult(data);
    } catch (e) {
      setError(errorMessage(e, lang));
      if (e instanceof Error && e.message === "SLOT_UNAVAILABLE") {
        setStep(2);
        setTime("");
        setDate("");
        setDays({});
        try {
          const d = await api<{ days: Record<string, number> }>(
            `/api/availability?month=${month}&service=${serviceId}`,
          );
          setDays(d.days);
        } catch {}
      }
    } finally {
      setSending(false);
    }
  }
  if (!settings.bookingEnabled || !active.length)
    return (
      <div className="booking-paused">
        <Leaf size={32} />
        <h3>{tr(lang, "Drīz tiksimies", "Скоро увидимся")}</h3>
        <p>{settings.bookingNotice[lang]}</p>
        <a className="button" href={settings.instagram} target="_blank" rel="noopener noreferrer">
          Instagram
          <ArrowRight size={18} />
        </a>
      </div>
    );
  if (result)
    return (
      <div className="booking-success" role="status">
        <span className="success-icon">
          <CalendarCheck size={35} />
        </span>
        <span className="eyebrow">
          {tr(lang, "VIZĪTES PIETEIKUMS SAGLABĀTS", "ЗАЯВКА НА ВИЗИТ СОХРАНЕНА")}
        </span>
        <h3>{tr(lang, "Laiks sev\njau ieplānots.", "Время для себя\nуже в планах.")}</h3>
        <p>
          {tr(
            lang,
            "Es sazināšos ar tevi, lai apstiprinātu vizīti. Izvēlētais laiks jau rezervēts.",
            "Я свяжусь с тобой, чтобы подтвердить визит. Выбранное время уже зарезервировано.",
          )}
        </p>
        <div className="success-details">
          <strong>{result.booking.service_title}</strong>
          <span>
            {dateLabel(date, lang)} · {time} · Europe/Riga
          </span>
        </div>
        <div className="booking-code">
          <span>
            {tr(lang, "Tavs pieraksta kods. Saglabā to:", "Твой код записи. Сохрани его:")}
          </span>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(result.code);
                setCopied(true);
              } catch {
                setError(tr(lang, "Iezīmē un nokopē kodu.", "Выдели код и скопируй его вручную."));
              }
            }}
          >
            <code>{result.code}</code>
            {copied ? <Check size={17} /> : <Copy size={17} />}
          </button>
        </div>
        <p className="small muted">
          {tr(
            lang,
            "Piekļuvei no citas ierīces vajadzēs šo kodu un norādīto kontaktu. E-pasti un SMS šobrīd netiek sūtīti automātiski.",
            "Для входа с другого устройства понадобятся этот код и указанный контакт. Письма и SMS пока не отправляются автоматически.",
          )}
        </p>
        <div className="success-actions">
          <Link className="button" href={`${basePath(lang)}/account`}>
            {tr(lang, "Mani pieraksti", "Мои записи")}
            <ArrowRight size={18} />
          </Link>
          <a className="button button-outline" href={`/api/calendar?id=${result.booking.id}`}>
            <CalendarDays size={17} />
            {tr(lang, "Kalendārā", "В календарь")}
          </a>
        </div>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  const firstWeekday = (new Date(`${month}-01T12:00:00Z`).getUTCDay() + 6) % 7;
  const daysCount = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 0).getDate();
  const maxMonth = new Date(`${initialToday}T12:00:00Z`);
  maxMonth.setUTCDate(maxMonth.getUTCDate() + 90);
  return (
    <div className="booking-widget">
      <div className="booking-progress">
        {[
          tr(lang, "Pakalpojums", "Услуга"),
          tr(lang, "Datums un laiks", "Дата и время"),
          tr(lang, "Tavi dati", "Твои данные"),
        ].map((title, i) => (
          <button
            key={title}
            disabled={i + 1 > step}
            onClick={() => {
              setStep(i + 1);
              setError("");
            }}
            className={i + 1 === step ? "current" : i + 1 < step ? "complete" : ""}
          >
            <span>{i + 1 < step ? <Check size={14} /> : String(i + 1).padStart(2, "0")}</span>
            {title}
          </button>
        ))}
      </div>
      <div className="booking-stage" key={step}>
        {step === 1 && (
          <>
            <div className="stage-heading">
              <span className="eyebrow">
                01 / {tr(lang, "TAVS PIRMAIS SOLIS", "ТВОЙ ПЕРВЫЙ ШАГ")}
              </span>
              <h3>{tr(lang, "Ar ko sāksim?", "С чего начнём?")}</h3>
              <p>
                {tr(
                  lang,
                  "Izvēlies sev piemērotāko. Ja šaubies, sāc ar iepazīšanās vizīti.",
                  "Выбери подходящую услугу. Если сомневаешься, начни с первой встречи.",
                )}
              </p>
            </div>
            <div className="service-options">
              {active.map((s) => (
                <button
                  className={`service-option ${s.id === serviceId ? "selected" : ""}`}
                  key={s.id}
                  onClick={() => {
                    setService(s.id);
                    setDate("");
                    setTime("");
                  }}
                >
                  <span className="radio-mark">{s.id === serviceId && <span />}</span>
                  <span>
                    <strong>{s.title[lang]}</strong>
                    <small>
                      {s.duration} min · {money(s.price, lang)}
                    </small>
                  </span>
                  <Leaf size={22} />
                </button>
              ))}
            </div>
            <p className="booking-notice">
              <ShieldCheck size={18} />
              {settings.bookingNotice[lang]}
            </p>
            <button className="button booking-next" onClick={() => setStep(2)} disabled={!service}>
              {tr(lang, "Izvēlēties laiku", "Выбрать время")}
              <ArrowRight size={18} />
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="stage-heading">
              <span className="eyebrow">02 / {tr(lang, "LAIKS TEV", "ВРЕМЯ ДЛЯ ТЕБЯ")}</span>
              <h3>{tr(lang, "Atrodi savu mirkli.", "Найди свой момент.")}</h3>
              <p>
                {service?.title[lang]} · {service?.duration} min · Europe/Riga
              </p>
            </div>
            <div className="calendar-header">
              <button
                className="icon-button"
                onClick={() => changeMonth(-1)}
                disabled={month <= initialToday.slice(0, 7)}
                aria-label={tr(lang, "Iepriekšējais mēnesis", "Предыдущий месяц")}
              >
                <ChevronLeft size={20} />
              </button>
              <strong>
                {new Intl.DateTimeFormat(localeCode(lang), {
                  month: "long",
                  year: "numeric",
                }).format(new Date(`${month}-01T12:00:00Z`))}
              </strong>
              <button
                className="icon-button"
                onClick={() => changeMonth(1)}
                disabled={month >= maxMonth.toISOString().slice(0, 7)}
                aria-label={tr(lang, "Nākamais mēnesis", "Следующий месяц")}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div
              className={`calendar-grid ${loading ? "is-loading" : ""}`}
              aria-label={tr(lang, "Datuma izvēle", "Выбор даты")}
              aria-busy={loading}
            >
              {(ru
                ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
                : lang === "en"
                  ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
                  : ["Pr", "Ot", "Tr", "Ce", "Pk", "Se", "Sv"]
              ).map((d) => (
                <span className="weekday" key={d}>
                  {d}
                </span>
              ))}
              {Array.from({ length: firstWeekday }, (_, i) => (
                <span key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysCount }, (_, i) => {
                const key = `${month}-${String(i + 1).padStart(2, "0")}`;
                const available = days[key] > 0;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`calendar-day ${key === date ? "selected" : ""} ${available ? "available" : "unavailable"}`}
                    disabled={!available || loading}
                    aria-label={`${dateLabel(key, lang)}, ${available ? tr(lang, "ir brīvi laiki", "есть время") : tr(lang, "nav brīvu laiku", "нет свободного времени")}`}
                    aria-pressed={key === date}
                    onClick={() => {
                      setDate(key);
                      setError("");
                    }}
                  >
                    {i + 1}
                    <span aria-hidden />
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span>
                <i />
                {tr(lang, "Ir brīvi laiki", "Есть свободное время")}
              </span>
              <span>
                <i />
                {tr(lang, "Aizņemts / nav pieņemšanas", "Занято / нет приёма")}
              </span>
            </div>
            {date && (
              <div className="time-picker">
                <strong>{dateLabel(date, lang)}</strong>
                {slotsLoading ? (
                  <p className="loading-line">
                    <LoaderCircle className="spin" size={17} />
                    {tr(lang, "Ielādējam laikus...", "Загружаем время...")}
                  </p>
                ) : (
                  <div className="time-slots">
                    {slots.length ? (
                      slots.map((s) => (
                        <button
                          className={s.time === time ? "selected" : ""}
                          key={s.time}
                          disabled={!s.available}
                          aria-pressed={time === s.time}
                          onClick={() => setTime(s.time)}
                        >
                          {s.time}
                        </button>
                      ))
                    ) : (
                      <p>
                        {tr(
                          lang,
                          "Brīvu laiku vairs nav. Izvēlies citu datumu.",
                          "Свободного времени уже нет. Выбери другую дату.",
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="stage-actions">
              <button className="text-button" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                {tr(lang, "Atpakaļ", "Назад")}
              </button>
              <button
                className="button"
                disabled={!date || !time || slotsLoading}
                onClick={() => {
                  setStep(3);
                  setError("");
                }}
              >
                {tr(lang, "Turpināt", "Продолжить")}
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="stage-heading">
              <span className="eyebrow">03 / {tr(lang, "GANDRĪZ GATAVS", "ПОЧТИ ГОТОВО")}</span>
              <h3>{tr(lang, "Kā ar tevi sazināties?", "Как с тобой связаться?")}</h3>
            </div>
            <div className="booking-summary">
              <CalendarDays size={21} />
              <div>
                <strong>
                  {dateLabel(date, lang)} · {time}
                </strong>
                <span>
                  {service?.title[lang]} · {service?.duration} min
                </span>
                <small>{money(service?.price ?? null, lang)}</small>
              </div>
            </div>
            <form onSubmit={submit} className="form">
              <label>
                {tr(lang, "Tavs vārds", "Твоё имя")}
                <span aria-hidden> *</span>
                <input
                  name="name"
                  autoComplete="given-name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder={tr(lang, "Kā tevi uzrunāt?", "Как к тебе обращаться?")}
                />
              </label>
              <div className="form-row">
                <label>
                  {tr(lang, "Tālrunis", "Телефон")}
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!email}
                    maxLength={30}
                    placeholder="+371"
                  />
                </label>
                <label>
                  {tr(lang, "E-pasts", "Эл. почта")}
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={!phone}
                    maxLength={200}
                    placeholder="hello@example.com"
                  />
                </label>
              </div>
              <p className="field-hint">
                {tr(
                  lang,
                  "Norādi tālruni vai e-pastu. Vari norādīt abus.",
                  "Укажи телефон или почту. Можно оба.",
                )}
              </p>
              <label className="honeypot" aria-hidden>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="consent" required />
                <span>
                  {tr(lang, "Esmu iepazinies ar ", "Я ознакомился с ")}
                  <Link href={`${basePath(lang)}/privacy`} target="_blank">
                    {tr(lang, "privātuma politiku", "политикой конфиденциальности")}
                  </Link>
                  {tr(
                    lang,
                    " un lūdzu sazināties ar mani par pierakstu.",
                    " и прошу связаться со мной по поводу записи.",
                  )}
                </span>
              </label>
              <div className="stage-actions">
                <button className="text-button" type="button" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} />
                  {tr(lang, "Atpakaļ", "Назад")}
                </button>
                <button className="button" type="submit" disabled={sending}>
                  {sending ? <LoaderCircle size={18} className="spin" /> : <Check size={18} />}{" "}
                  {sending
                    ? tr(lang, "Saglabājam...", "Сохраняем...")
                    : tr(lang, "Pieteikt vizīti", "Записаться")}
                </button>
              </div>
              <p className="small muted">
                {tr(
                  lang,
                  "Bez tiešsaistes priekšapmaksas. Vizīti apstiprinās studija personīgi.",
                  "Без предоплаты онлайн. Студия подтвердит визит лично.",
                )}
              </p>
            </form>
          </>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
