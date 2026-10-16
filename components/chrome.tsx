"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { DocumentLanguage } from "./document-language";
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
import { tr } from "@/lib/i18n";
import type { Lang, SiteSettings } from "@/lib/types";

export function Brand({
  footer = false,
  logo = "/images/skinstinct-logo.webp",
  lang = "lv",
}: {
  footer?: boolean;
  logo?: string;
  lang?: Lang;
}) {
  return (
    <span className={`brand ${footer ? "brand-footer" : ""}`}>
      <img src={logo} width={68} height={68} alt="SKINSTINCT" />
      <span>
        <strong>SKINSTINCT</strong>
        <small>
          {lang === "en"
            ? "SKINCARE STUDIO"
            : lang === "ru"
              ? "СТУДИЯ КОСМЕТОЛОГИИ"
              : "KOSMETOLOĢIJAS STUDIJA"}
        </small>
      </span>
    </span>
  );
}
export function Header({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const localPath = pathname.replace(/^\/(en|ru)(?=\/|$)/, "");
  const base = basePath(lang);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <>
      <DocumentLanguage lang={lang} />
      <div className="announcement">
        <span>
          {lang === "en"
            ? "Care that stays with you."
            : lang === "ru"
              ? "Забота, которая остаётся."
              : "Rūpes, kas paliek."}
        </span>
        <span>
          <span className="tiny-dot" />
          {settings.city}, {lang === "en" ? "Latvia" : lang === "ru" ? "Латвия" : "Latvija"}
        </span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href={base || "/"} aria-label="SKINSTINCT" onClick={() => setOpen(false)}>
            <Brand logo={settings.logoImage} lang={lang} />
          </Link>
          <nav
            className="desktop-nav"
            aria-label={tr(lang, "Galvenā navigācija", "Основная навигация")}
          >
            <Link href={`${base}/#pieeja`}>{tr(lang, "Mūsu pieeja", "Наш подход")}</Link>
            <Link href={`${base}/#pakalpojumi`}>{tr(lang, "Pakalpojumi", "Услуги")}</Link>
            <Link href={`${base}/#par-mani`}>{tr(lang, "Par mani", "Обо мне")}</Link>
            <Link href={`${base}/articles`}>{tr(lang, "Dienasgrāmata", "Журнал")}</Link>
          </nav>
          <div className="header-actions">
            <div className="language-switch" aria-label={tr(lang, "Valoda", "Язык")}>
              {(["lv", "en", "ru"] as const).map((language) => (
                <Link
                  key={language}
                  href={`${basePath(language)}${localPath || "/"}`}
                  hrefLang={language}
                  lang={language}
                  aria-current={lang === language ? "page" : undefined}
                  aria-label={{ lv: "Latviešu", en: "English", ru: "Русский" }[language]}
                >
                  {language.toUpperCase()}
                </Link>
              ))}
            </div>
            <ThemeToggle lang={lang} />
            <Link
              className="account-link"
              href={`${base}/account`}
              aria-label={tr(lang, "Mani pieraksti", "Мои записи")}
            >
              <UserRound size={19} />
            </Link>
            <Link href={`${base}/#pieraksts`} className="button button-small header-book">
              {tr(lang, "Pieteikt vizīti", "Записаться")}
              <ArrowUpRight size={16} />
            </Link>
            <button
              className="icon-button menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={tr(lang, "Izvēlne", "Меню")}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open && (
            <nav
              id="mobile-menu"
              className="mobile-menu"
              aria-label={tr(lang, "Mobilā izvēlne", "Мобильное меню")}
            >
              {[
                ["pieeja", tr(lang, "Mūsu pieeja", "Наш подход")],
                ["pakalpojumi", tr(lang, "Pakalpojumi", "Услуги")],
                ["par-mani", tr(lang, "Par mani", "Обо мне")],
                ["pieraksts", tr(lang, "Pieteikt vizīti", "Записаться")],
                ["kontakti", tr(lang, "Kontakti", "Контакты")],
              ].map(([id, text]) => (
                <Link key={id} href={`${base}/#${id}`} onClick={() => setOpen(false)}>
                  {text}
                  <ArrowUpRight size={17} />
                </Link>
              ))}
              <Link href={`${base}/articles`} onClick={() => setOpen(false)}>
                {tr(lang, "Dienasgrāmata", "Журнал")}
              </Link>
              <Link href={`${base}/account`} onClick={() => setOpen(false)}>
                {tr(lang, "Mani pieraksti", "Мои записи")}
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
export function Footer({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const base = basePath(lang);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href={base || "/"}>
              <Brand footer logo={settings.logoImage} lang={lang} />
            </Link>
            <p>{settings.copy.footerDescription[lang]}</p>
          </div>
          <div className="footer-links">
            <Link href={`${base}/#pakalpojumi`}>{tr(lang, "Pakalpojumi", "Услуги")}</Link>
            <Link href={`${base}/#par-mani`}>{tr(lang, "Par mani", "Обо мне")}</Link>
            <Link href={`${base}/articles`}>{tr(lang, "Dienasgrāmata", "Журнал")}</Link>
            <Link href={`${base}/account`}>{tr(lang, "Mani pieraksti", "Мои записи")}</Link>
          </div>
          <div className="footer-contact">
            <span className="eyebrow">
              {settings.city}, {lang === "en" ? "LATVIA" : lang === "ru" ? "ЛАТВИЯ" : "LATVIJA"}
            </span>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram size={18} /> @vr_skinstinct <ArrowUpRight size={16} />
            </a>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>
            )}
            {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            <span className="footer-signature">
              {lang === "en"
                ? "Care that stays with you."
                : lang === "ru"
                  ? "Забота, которая остаётся."
                  : "Rūpes, kas paliek."}
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SKINSTINCT</span>
          <div>
            <Link href={`${base}/privacy`}>
              {tr(lang, "Privātuma politika", "Конфиденциальность")}
            </Link>
            <button onClick={() => window.dispatchEvent(new Event("cookie-settings"))}>
              {tr(lang, "Sīkdatņu iestatījumi", "Настройки cookies")}
            </button>
            <Link href="/admin">{tr(lang, "Administrācija", "Администратор")}</Link>
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
        <aside className="cookie-notice" aria-label={tr(lang, "Sīkdatnes", "Файлы cookies")}>
          <span className="cookie-leaf">
            <Leaf size={24} />
          </span>
          <div>
            <strong>{tr(lang, "Ar rūpēm arī par taviem datiem", "Забота и о твоих данных")}</strong>
            <p>
              {tr(
                lang,
                "Izmantojam tikai pierakstam un ieejai nepieciešamās sīkdatnes. Bez reklāmas izsekotājiem.",
                "Используем только необходимые файлы cookies для записи и входа. Без рекламных трекеров.",
              )}
            </p>
            <div className="cookie-actions">
              <button className="text-button" onClick={() => dialog.current?.showModal()}>
                {tr(lang, "Uzzināt vairāk", "Подробнее")}
              </button>
              <button className="button button-small" onClick={save}>
                {tr(lang, "Sapratu", "Понятно")}
                <span aria-hidden>✓</span>
              </button>
            </div>
          </div>
        </aside>
      )}
      <dialog ref={dialog} className="cookie-dialog">
        <button
          className="icon-button dialog-close"
          aria-label={tr(lang, "Aizvērt", "Закрыть")}
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <ShieldCheck size={30} />
        <h2>{tr(lang, "Tavi privātuma iestatījumi", "Твои настройки приватности")}</h2>
        <p>
          {tr(
            lang,
            "Nepieciešamās sīkdatnes nodrošina drošu piekļuvi taviem pierakstiem un administratora ieejai. Glabāšanas laiks: līdz 12 mēnešiem pierakstiem un 12 stundas administratoram.",
            "Необходимые cookies сохраняют безопасный доступ к твоим записям и вход администратора. Их срок: до 12 месяцев для записи и 12 часов для администратора.",
          )}
        </p>
        <div className="cookie-category">
          <span>{tr(lang, "Nepieciešamās", "Необходимые")}</span>
          <strong>{tr(lang, "Vienmēr aktīvas", "Всегда включены")}</strong>
        </div>
        <div className="cookie-category">
          <span>{tr(lang, "Analītika un reklāma", "Аналитика и реклама")}</span>
          <strong>{tr(lang, "Netiek izmantotas", "Не используются")}</strong>
        </div>
        <p>
          {tr(
            lang,
            "Izvēle tiek glabāta pārlūkā 12 mēnešus. Google Calendar šobrīd nav pieslēgts. Fonti un fotogrāfijas tiek ielādēti no mūsu vietnes.",
            "Выбор сохраняется в браузере на 12 месяцев. Google Calendar пока не подключён. Шрифты и фотографии загружаются с нашего сайта.",
          )}
        </p>
        <Link href={`${basePath(lang)}/privacy`}>
          {tr(lang, "Privātuma politika", "Политика конфиденциальности")}
        </Link>
        <button className="button" onClick={save}>
          {tr(lang, "Saglabāt un aizvērt", "Сохранить и закрыть")}
        </button>
      </dialog>
    </>
  );
}
export function MobileBooking({ lang }: { lang: Lang }) {
  return (
    <Link className="mobile-booking" href={`${basePath(lang)}/#pieraksts`}>
      <CalendarDays size={19} />
      {tr(lang, "Pieteikt vizīti", "Записаться на визит")}
      <ArrowUpRight size={18} />
    </Link>
  );
}
