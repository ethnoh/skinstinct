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
import { isPriceRange, serviceDuration, servicePrice } from "@/lib/service-display";
import { BOOKING_START, OFFER_END } from '@/lib/opening-offer';
import {OpeningOffer} from './opening-offer';
import {bookingFollowup} from '@/lib/booking-communication';
import {PhoneText} from './phone-text';
import { TreatmentPrice } from './treatment-price';

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
  const active = services.filter((s) => s.active && s.bookable !== false);
  const firstDate = initialToday < BOOKING_START ? BOOKING_START : initialToday;
  const [serviceId, setService] = useState(active[0]?.id || "");
  const [step, setStep] = useState(1);
  const [month, setMonth] = useState(firstDate.slice(0, 7));
  const [date, setDate] = useState("");
  const priceDate = date || `${month}-01`;
  const [time, setTime] = useState("");
  const [days, setDays] = useState<Record<string, number>>({});
  const [slots, setSlots] = useState<Slots>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappReady,setWhatsappReady]=useState(false);
  const [whatsappOptIn,setWhatsappOptIn]=useState(false);
  useEffect(()=>{let active=true;setWhatsappReady(false);setWhatsappOptIn(false);api<{whatsapp:Record<Lang,boolean>}>('/api/notifications/options').then(data=>{if(active)setWhatsappReady(data.whatsapp[lang])}).catch(()=>{});return()=>{active=false}},[lang]);
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
    const requested = new URLSearchParams(window.location.search).get("service");
    if (requested && active.some((item) => item.id === requested))
      choose(new CustomEvent("choose-service", { detail: requested }));
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
        whatsappOptIn:whatsappReady&&whatsappOptIn,
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
        <p><PhoneText text={settings.bookingNotice[lang]} phone={settings.phone}/></p>
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
          {{lv:'VIZĪTE APSTIPRINĀTA',en:'APPOINTMENT CONFIRMED',ru:'ВИЗИТ ПОДТВЕРЖДЁН'}[lang]}
        </span>
        <h3>{tr(lang, "Laiks sev\njau ieplānots.", "Время для себя\nуже в планах.")}</h3>
        <p>
          <PhoneText text={bookingFollowup[lang]} phone={settings.phone}/>
        </p>
        <div className="success-details">
          <strong>{result.booking.service_title}</strong>
          {service && (
            <strong className="booking-confirmed-price">{servicePrice({price:result.booking.quoted_price_min ?? null,priceMax:result.booking.quoted_price_max},lang)}</strong>
          )}
          <span>
            {dateLabel(date, lang)} · {time} · Europe/Riga
          </span>
          <span>{[settings.address, settings.city].filter(Boolean).join(", ")}</span>
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
            "Piekļuvei no citas ierīces vajadzēs šo kodu un norādīto kontaktu.",
            "Для входа с другого устройства понадобятся этот код и указанный контакт.",
          )}
        </p>
        {Boolean(result.booking.whatsapp_opt_in)&&<p className="booking-whatsapp-status">{{lv:'WhatsApp apstiprinājuma ziņa ir pieteikta nosūtīšanai. Ja līdz vizītei ir vairāk nekā 24 stundas, atgādinājumu saņemsi arī 1 dienu pirms vizītes.',en:'Your WhatsApp confirmation is queued for sending. If your visit is more than 24 hours away, you will also receive a reminder 1 day before it.',ru:'Подтверждение в WhatsApp поставлено в очередь на отправку. Если до визита больше 24 часов, напоминание придёт также за 1 день до него.'}[lang]}</p>}
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
        {initialToday <= OFFER_END && <OpeningOffer lang={lang}/>}
        {step === 1 && (
          <>
            <div className="stage-heading">
              <span className="eyebrow">
                01 / {tr(lang, "TAVS PIRMAIS SOLIS", "ТВОЙ ПЕРВЫЙ ШАГ")}
              </span>
              <h3>{tr(lang, "Ar ko sāksim?", "С чего начнём?")}</h3>
              <p>
                {
                  {
                    lv: "Izvēlies procedūru — tās cenu un ilgumu redzēsi pirms laika izvēles.",
                    en: "Choose a treatment — you can see its price and duration before selecting a time.",
                    ru: "Выбери процедуру — её стоимость и длительность видны до выбора времени.",
                  }[lang]
                }
              </p>
            </div>
            <div className="service-options">
              {active.map((s) => (
                <button
                  className={`service-option ${s.id === serviceId ? "selected" : ""}`}
                  key={s.id}
                  data-service-id={s.id}
                  onClick={() => {
                    setService(s.id);
                    setDate("");
                    setTime("");
                  }}
                >
                  <span className="radio-mark">{s.id === serviceId && <span />}</span>
                  <span className="service-option-copy">
                    <strong>{s.title[lang]}</strong>
                    <small>{serviceDuration(s, lang)}</small>
                    {s.id === 'introductory-treatment' && <small>{s.description[lang]}</small>}
                  </span>
                  <strong className="service-option-price">
                    <TreatmentPrice service={s} lang={lang} date={priceDate} />
                    {isPriceRange(s) && "*"}
                  </strong>
                </button>
              ))}
            </div>
            <p className="booking-notice">
              <ShieldCheck size={18} />
              <span><PhoneText text={settings.bookingNotice[lang]} phone={settings.phone}/></span>
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
                {service?.title[lang]} · {service && serviceDuration(service, lang)} · Europe/Riga
              </p>
              {service && (
                <p className="selected-treatment-price">
                  <span>{{ lv: "Cena", en: "Price", ru: "Стоимость" }[lang]}</span>
                  <strong><TreatmentPrice service={service} lang={lang} date={priceDate} /></strong>
                  {isPriceRange(service) && (
                    <small>
                      {
                        {
                          lv: "Precīzu cenu saskaņosim pirms procedūras atbilstoši preparāta daudzumam un individuālajam plānam.",
                          en: "We will agree on the exact price before treatment, based on product quantity and your individual plan.",
                          ru: "Точную стоимость согласуем до процедуры с учётом количества препарата и индивидуального плана.",
                        }[lang]
                      }
                    </small>
                  )}
                </p>
              )}
            </div>
            <div className="calendar-header">
              <button
                className="icon-button"
                onClick={() => changeMonth(-1)}
                disabled={month <= firstDate.slice(0, 7)}
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
                <i aria-hidden="true" />
                {tr(lang, "Ir brīvi laiki", "Есть свободное время")}
              </span>
              <span>
                <i aria-hidden="true" />
                {tr(lang, "Aizņemts / nav pieņemšanas", "Занято / нет приёма")}
              </span>
            </div>
            <p className="booking-time-help">
              <PhoneText text={{
                lv: 'Neatrodi sev ērtu laiku? Nosūti man SMS vai piezvani pa tālruni {phone}. Kopā mēģināsim piemeklēt Tev piemērotu vizītes laiku.',
                en: 'Cannot find a convenient time? Send me an SMS or call me on {phone}. We will try to find an appointment time that works for you.',
                ru: 'Не находишь удобного времени? Отправь мне SMS или позвони по телефону {phone}. Вместе постараемся подобрать подходящее для Тебя время визита.',
              }[lang]} phone={settings.phone}/>
            </p>
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
              <h3>{tr(lang, "Kā ar Tevi sazināties?", "Как с Тобой связаться?")}</h3>
            </div>
            <div className="booking-summary">
              <CalendarDays size={21} />
              <div>
                <strong>
                  {dateLabel(date, lang)} · {time}
                </strong>
                <span>
                  {service?.title[lang]} · {service && serviceDuration(service, lang)}
                </span>
                <strong className="summary-treatment-price">
                  {service ? <TreatmentPrice service={service} lang={lang} date={priceDate} /> : ""}
                </strong>
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
                  placeholder={tr(lang, "Kā Tevi uzrunāt?", "Как к Тебе обращаться?")}
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
              {whatsappReady&&<label className="checkbox-label booking-whatsapp-choice">
                <input type="checkbox" name="whatsappOptIn" checked={whatsappOptIn} onChange={event=>setWhatsappOptIn(event.target.checked)}/>
                <span>{{lv:'Vēlos saņemt šīs vizītes apstiprinājumu un atgādinājumu WhatsApp uz norādīto tālruņa numuru. Atgādinājumu saņemšu 1 dienu pirms vizītes, ja pierakstīšos vairāk nekā 24 stundas iepriekš.',en:'Send me this appointment’s confirmation and reminder on WhatsApp at the phone number provided. I will receive a reminder 1 day before my visit if I book more than 24 hours ahead.',ru:'Хочу получить подтверждение этого визита и напоминание в WhatsApp на указанный номер. Напоминание придёт за 1 день до визита, если запись оформлена более чем за 24 часа.'}[lang]}</span>
              </label>}
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
                    : ({lv:"Apstiprināt pierakstu",en:"Confirm appointment",ru:"Подтвердить запись"}[lang])}
                </button>
              </div>
              <p className="small muted">
                {tr(
                  lang,
                    "Bez tiešsaistes priekšapmaksas. Izvēlētais laiks tiek apstiprināts automātiski.",
                    "Без предоплаты онлайн. Выбранное время подтверждается автоматически.",
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
