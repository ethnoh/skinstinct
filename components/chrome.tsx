"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Instagram,
  Leaf,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { basePath } from "@/lib/client";
import type { Lang, SiteSettings } from "@/lib/types";

export function Brand({
  footer = false,
  logo = "/images/skinstinct-logo.webp",
}: {
  footer?: boolean;
  logo?: string;
}) {
  return (
    <span className={`brand ${footer ? "brand-footer" : ""}`}>
      <img src={logo} width={68} height={68} alt="SKINSTINCT" />
      <span>
        <strong>SKINSTINCT</strong>
        <small>KOSMETOLOĢIJAS STUDIJA</small>
      </span>
    </span>
  );
}
export function Header({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const base = basePath(lang);
  const ru = lang === "ru";
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <div className="announcement">
        <span>Rūpes, kas paliek.</span>
        <span>
          <span className="tiny-dot" />
          {settings.city}, Latvija
        </span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href={base || "/"} aria-label="SKINSTINCT" onClick={() => setOpen(false)}>
            <Brand logo={settings.logoImage} />
          </Link>
          <nav
            className="desktop-nav"
            aria-label={ru ? "Основная навигация" : "Galvenā navigācija"}
          >
            <Link href={`${base}/#pieeja`}>{ru ? "Наш подход" : "Mūsu pieeja"}</Link>
            <Link href={`${base}/#pakalpojumi`}>{ru ? "Услуги" : "Pakalpojumi"}</Link>
            <Link href={`${base}/#par-mani`}>{ru ? "Обо мне" : "Par mani"}</Link>
            <Link href={`${base}/articles`}>{ru ? "Журнал" : "Dienasgrāmata"}</Link>
          </nav>
          <div className="header-actions">
            <div className="language-switch" aria-label={ru ? "Язык" : "Valoda"}>
              <Link href="/" lang="lv" aria-current={!ru ? "page" : undefined}>
                LV
              </Link>
              <span>/</span>
              <Link href="/ru" lang="ru" aria-current={ru ? "page" : undefined}>
                RU
              </Link>
            </div>
            <Link
              className="account-link"
              href={`${base}/account`}
              aria-label={ru ? "Мои записи" : "Mani pieraksti"}
            >
              <UserRound size={19} />
            </Link>
            <Link href={`${base}/#pieraksts`} className="button button-small header-book">
              {ru ? "Записаться" : "Pieteikt vizīti"}
              <ArrowUpRight size={16} />
            </Link>
            <button
              className="icon-button menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={ru ? "Меню" : "Izvēlne"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open && (
            <nav
              id="mobile-menu"
              className="mobile-menu"
              aria-label={ru ? "Мобильное меню" : "Mobilā izvēlne"}
            >
              {[
                ["pieeja", ru ? "Наш подход" : "Mūsu pieeja"],
                ["pakalpojumi", ru ? "Услуги" : "Pakalpojumi"],
                ["par-mani", ru ? "Обо мне" : "Par mani"],
                ["pieraksts", ru ? "Записаться" : "Pieteikt vizīti"],
                ["kontakti", ru ? "Контакты" : "Kontakti"],
              ].map(([id, text]) => (
                <Link key={id} href={`${base}/#${id}`} onClick={() => setOpen(false)}>
                  {text}
                  <ArrowUpRight size={17} />
                </Link>
              ))}
              <Link href={`${base}/articles`} onClick={() => setOpen(false)}>
                {ru ? "Журнал" : "Dienasgrāmata"}
              </Link>
              <Link href={`${base}/account`} onClick={() => setOpen(false)}>
                {ru ? "Мои записи" : "Mani pieraksti"}
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
export function Footer({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const ru = lang === "ru";
  const base = basePath(lang);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href={base || "/"}>
              <Brand footer logo={settings.logoImage} />
            </Link>
            <p>{settings.copy.footerDescription[lang]}</p>
          </div>
          <div className="footer-links">
            <Link href={`${base}/#pakalpojumi`}>{ru ? "Услуги" : "Pakalpojumi"}</Link>
            <Link href={`${base}/#par-mani`}>{ru ? "Обо мне" : "Par mani"}</Link>
            <Link href={`${base}/articles`}>{ru ? "Журнал" : "Dienasgrāmata"}</Link>
            <Link href={`${base}/account`}>{ru ? "Мои записи" : "Mani pieraksti"}</Link>
          </div>
          <div className="footer-contact">
            <span className="eyebrow">{settings.city}, LATVIJA</span>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram size={18} /> @vr_skinstinct <ArrowUpRight size={16} />
            </a>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>
            )}
            {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            <span className="footer-signature">Rūpes, kas paliek.</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SKINSTINCT</span>
          <div>
            <Link href={`${base}/privacy`}>{ru ? "Конфиденциальность" : "Privātuma politika"}</Link>
            <button onClick={() => window.dispatchEvent(new Event("cookie-settings"))}>
              {ru ? "Настройки cookies" : "Sīkdatņu iestatījumi"}
            </button>
            <Link href="/admin">{ru ? "Администратор" : "Administrācija"}</Link>
          </div>
          <a href="https://b41.ai" target="_blank" rel="noopener noreferrer" className="made-by">
            Made with care by <strong>B41</strong>
            <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
export function CookieNotice({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const ru = lang === "ru";
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("skinstinct-privacy") || "null");
      setVisible(!saved || saved.expires < Date.now());
    } catch {
      setVisible(true);
    }
    const show = () => dialog.current?.showModal();
    window.addEventListener("cookie-settings", show);
    return () => window.removeEventListener("cookie-settings", show);
  }, []);
  function save() {
    try {
      localStorage.setItem(
        "skinstinct-privacy",
        JSON.stringify({ essential: true, expires: Date.now() + 365 * 86400_000 }),
      );
    } catch {}
    setVisible(false);
    dialog.current?.close();
  }
  return (
    <>
      {visible && (
        <aside className="cookie-notice" aria-label={ru ? "Файлы cookies" : "Sīkdatnes"}>
          <span className="cookie-leaf">
            <Leaf size={24} />
          </span>
          <div>
            <strong>{ru ? "Забота и о твоих данных" : "Ar rūpēm arī par taviem datiem"}</strong>
            <p>
              {ru
                ? "Используем только необходимые файлы cookies для записи и входа. Без рекламных трекеров."
                : "Izmantojam tikai pierakstam un ieejai nepieciešamās sīkdatnes. Bez reklāmas izsekotājiem."}
            </p>
            <div className="cookie-actions">
              <button className="text-button" onClick={() => dialog.current?.showModal()}>
                {ru ? "Подробнее" : "Uzzināt vairāk"}
              </button>
              <button className="button button-small" onClick={save}>
                {ru ? "Понятно" : "Sapratu"}
                <span aria-hidden>✓</span>
              </button>
            </div>
          </div>
        </aside>
      )}
      <dialog ref={dialog} className="cookie-dialog">
        <button
          className="icon-button dialog-close"
          aria-label={ru ? "Закрыть" : "Aizvērt"}
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <ShieldCheck size={30} />
        <h2>{ru ? "Твои настройки приватности" : "Tavi privātuma iestatījumi"}</h2>
        <p>
          {ru
            ? "Необходимые cookies сохраняют безопасный доступ к твоим записям и вход администратора. Их срок: до 12 месяцев для записи и 12 часов для администратора."
            : "Nepieciešamās sīkdatnes nodrošina drošu piekļuvi taviem pierakstiem un administratora ieejai. Glabāšanas laiks: līdz 12 mēnešiem pierakstiem un 12 stundas administratoram."}
        </p>
        <div className="cookie-category">
          <span>{ru ? "Необходимые" : "Nepieciešamās"}</span>
          <strong>{ru ? "Всегда включены" : "Vienmēr aktīvas"}</strong>
        </div>
        <div className="cookie-category">
          <span>{ru ? "Аналитика и реклама" : "Analītika un reklāma"}</span>
          <strong>{ru ? "Не используются" : "Netiek izmantotas"}</strong>
        </div>
        <p>
          {ru
            ? "Выбор сохраняется в браузере на 12 месяцев. Google Calendar пока не подключён. Шрифты и фотографии загружаются с нашего сайта."
            : "Izvēle tiek glabāta pārlūkā 12 mēnešus. Google Calendar šobrīd nav pieslēgts. Fonti un fotogrāfijas tiek ielādēti no mūsu vietnes."}
        </p>
        <Link href={`${basePath(lang)}/privacy`}>
          {ru ? "Политика конфиденциальности" : "Privātuma politika"}
        </Link>
        <button className="button" onClick={save}>
          {ru ? "Сохранить и закрыть" : "Saglabāt un aizvērt"}
        </button>
      </dialog>
    </>
  );
}
export function MobileBooking({ lang }: { lang: Lang }) {
  return (
    <Link className="mobile-booking" href={`${basePath(lang)}/#pieraksts`}>
      <CalendarDays size={19} />
      {lang === "lv" ? "Pieteikt vizīti" : "Записаться на визит"}
      <ArrowUpRight size={18} />
    </Link>
  );
}
