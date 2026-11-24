"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, LoaderCircle, Search } from "lucide-react";
import { api, basePath, dateLabel, errorMessage } from "@/lib/client";
import { addressCase, tr } from "@/lib/i18n";
import type { Booking, Lang, SiteSettings } from "@/lib/types";
import { servicePrice } from '@/lib/service-display';
import {PhoneText} from './phone-text';

type Visit = Booking & { canCancel: boolean };
const time = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export function Account({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const ru = lang === "ru";
  const [bookings, setBookings] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [lookup, setLookup] = useState<{ code: string; contact: string } | null>(null);
  useEffect(() => {
    let mounted = true;
    api<{ bookings: Visit[] }>("/api/account")
      .then((data) => {
        if (mounted) setBookings(data.bookings);
      })
      .catch((e) => {
        if (mounted) setError(errorMessage(e, lang));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [lang]);
  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const input = { code: String(form.get("code")), contact: String(form.get("contact")) };
    try {
      const data = await api<{ bookings: Visit[] }>("/api/account", input);
      setBookings(data.bookings);
      setLookup(input);
    } catch (e) {
      setError(errorMessage(e, lang));
    } finally {
      setPending(false);
    }
  }
  async function cancel(id: string) {
    if (
      !window.confirm(
        tr(
          lang,
          "Atcelt šo vizīti? Laiks kļūs pieejams citiem klientiem.",
          "Отменить этот визит? Время станет доступно другим клиентам.",
        ),
      )
    )
      return;
    setPending(true);
    setError("");
    try {
      await api("/api/bookings/cancel", { id, ...lookup });
      setBookings((v) =>
        v.map((b) => (b.id === id ? { ...b, status: "cancelled", canCancel: false } : b)),
      );
    } catch (e) {
      setError(errorMessage(e, lang));
    } finally {
      setPending(false);
    }
  }
  const statuses = ru
    ? {
        pending: "Ждёт подтверждения",
        confirmed: "Подтверждена",
        cancelled: "Отменена",
        completed: "Завершена",
      }
    : lang === "en"
      ? {
          pending: "Awaiting confirmation",
          confirmed: "Confirmed",
          cancelled: "Cancelled",
          completed: "Completed",
        }
      : {
          pending: "Gaida apstiprinājumu",
          confirmed: "Apstiprināts",
          cancelled: "Atcelts",
          completed: "Pabeigts",
        };
  return (
    <main className="container inner-page" id="main-content">
      <div className="page-heading">
        <span className="eyebrow">SKINSTINCT / {tr(lang, "TAVA VIETA", "ТВОЁ ПРОСТРАНСТВО")}</span>
        <h1>
          {tr(lang, "Mani ", "Мои ")}
          <em>{tr(lang, "pieraksti.", "записи.")}</em>
        </h1>
        <p>
          {{lv:'Šeit atradīsi šajā pārlūkā veiktos pierakstus arī nākamreiz, kad ienāksi mājaslapā. Saiti «Mani pieraksti» vienmēr atradīsi lapas augšpusē. Ja pierakstu neredzi vai izmanto citu ierīci, atrodi to ar saglabāto kodu un pierakstā norādīto kontaktu.',en:'Appointments made in this browser will still appear here when you return. You can always find “My appointments” at the top of the website. If your appointment is missing or you use another device, look it up with your saved code and the contact details you provided.',ru:'Записи, сделанные в этом браузере, будут доступны и при следующем посещении сайта. Ссылка «Мои записи» всегда находится вверху страницы. Если запись не видна или Ты используешь другое устройство, найди её по сохранённому коду и указанному при записи контакту.'}[lang]}
        </p>
      </div>
      <div className="account-grid">
        <div>
          {loading ? (
            <p className="loading-line">
              <LoaderCircle className="spin" size={18} />
              {tr(lang, "Ielādējam pierakstus...", "Загружаем записи...")}
            </p>
          ) : bookings.length ? (
            <div className="booking-list">
              {bookings.map((b) => (
                <article className="visit-card" key={b.id}>
                  <div className="visit-card-top">
                    <span className="visit-date">
                      <CalendarDays size={16} />
                      {dateLabel(b.date, lang)}
                    </span>
                    <span className={`status-pill status-${b.status}`}>{statuses[b.status]}</span>
                  </div>
                  <h2>{addressCase(b.service_title, b.lang)}</h2>
                  <span className="visit-date">
                    <Clock3 size={15} />
                    {time(b.start_min)} - {time(b.end_min)} · Europe/Riga
                  </span>
                  <p>{b.name}</p>
                  {b.quoted_price_min != null && <p>{servicePrice({price:b.quoted_price_min,priceMax:b.quoted_price_max},lang)}</p>}
                  <p>
                    {settings.address
                      ? `${settings.address}, ${settings.city}`
                      : tr(
                          lang,
                          "Adresi precizēsim, apstiprinot vizīti",
                          "Адрес уточним при подтверждении",
                        )}
                  </p>
                  <div className="visit-actions">
                    {!lookup && b.status !== "cancelled" && (
                      <a className="text-button" href={`/api/calendar?id=${b.id}`}>
                        {tr(lang, "Pievienot kalendāram", "Добавить в календарь")}
                      </a>
                    )}
                    {b.canCancel && (
                      <button
                        className="text-button"
                        disabled={pending}
                        onClick={() => cancel(b.id)}
                      >
                        {tr(lang, "Atcelt vizīti", "Отменить визит")}
                      </button>
                    )}
                    {!b.canCancel && ["pending", "confirmed"].includes(b.status) && (
                      <a
                        className="text-button"
                        href={`tel:${settings.phone.replace(/[^+\d]/g,'')}`}
                      >
                        {tr(lang, "Sazināties ar studiju", "Связаться со студией")}
                      </a>
                    )}
                    {b.status==='cancelled'&&<Link className="text-button" href={`${basePath(lang)}/?service=${encodeURIComponent(b.service_id)}#pieraksts`}>{{lv:'Izvēlēties citu laiku',en:'Choose another time',ru:'Выбрать другое время'}[lang]}<ArrowRight size={16}/></Link>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays size={35} strokeWidth={1} />
              <h2>{tr(lang, "Tavs laiks vēl priekšā.", "Твоё время ещё впереди.")}</h2>
              <p>
                {tr(
                  lang,
                  "Šajā pārlūkā vēl nav pierakstu. Atrodi sev ērtu mirkli.",
                  "В этом браузере пока нет записей. Найди удобный момент для себя.",
                )}
              </p>
              <Link className="button" href={`${basePath(lang)}/#pieraksts`}>
                {tr(lang, "Izvēlēties laiku", "Выбрать время")}
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
          <p className="account-notice">
            <PhoneText text={{lv:`Pierakstu vari atcelt ne vēlāk kā ${settings.cancellationHours} stundas pirms vizītes. Lai izvēlētos citu laiku, atcel esošo pierakstu un rezervē jaunu. Ja tas neizdodas vai atcelšanas termiņš beidzies, nosūti SMS vai piezvani pa tālruni {phone}.`,en:`You can cancel up to ${settings.cancellationHours} hours before your visit. To choose a different time, cancel your existing appointment and book a new one. If this does not work or the cancellation deadline has passed, send an SMS or call {phone}.`,ru:`Отменить запись можно не позднее чем за ${settings.cancellationHours} ч до визита. Чтобы выбрать другое время, отмени текущую запись и оформи новую. Если это не получается или срок отмены истёк, отправь SMS или позвони по телефону {phone}.`}[lang]} phone={settings.phone}/>
          </p>
        </div>
        <div className="account-lookup">
          <Search size={23} strokeWidth={1.3} />
          <h2>
            {tr(lang, "Pierakstījies\nno citas ierīces?", "Записывалась\nс другого устройства?")}
          </h2>
          <p>
            {tr(
              lang,
              "Ievadi pēc pieraksta saņemto kodu un tālruni vai e-pastu, ko norādīji piesakoties. Lai sargātu Tavus datus, meklēšana tikai pēc kontakta nav pieejama.",
              "Введи код, который появился после записи, и телефон или почту, указанные при оформлении. Поиск только по телефону или почте недоступен для защиты Твоих данных.",
            )}
          </p>
          <form onSubmit={search} className="form">
            <label>
              {tr(lang, "Pieraksta kods", "Код записи")}
              <input
                name="code"
                required
                minLength={8}
                maxLength={40}
                autoComplete="off"
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </label>
            <label>
              {tr(lang, "Tavs tālrunis vai e-pasts", "Твой телефон или почта")}
              <input
                name="contact"
                required
                minLength={3}
                maxLength={200}
                autoComplete="off"
                placeholder={tr(lang, "Pierakstā norādītais kontakts", "Контакт из записи")}
              />
            </label>
            <button className="button" disabled={pending}>
              {pending ? <LoaderCircle size={17} className="spin" /> : <Search size={17} />}{" "}
              {tr(lang, "Atrast pierakstu", "Найти запись")}
            </button>
          </form>
          <p className="account-notice">
            <PhoneText text={{lv:'Pazaudēji kodu vai neatrodi pierakstu? Nosūti SMS vai piezvani pa tālruni {phone}.',en:'Lost your code or cannot find your appointment? Send an SMS or call {phone}.',ru:'Код потерян или запись не найдена? Отправь SMS или позвони по телефону {phone}.'}[lang]} phone={settings.phone}/>
          </p>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
