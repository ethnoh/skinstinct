"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  Clock3,
  Flower2,
  Heart,
  Instagram,
  Leaf,
  LoaderCircle,
  MapPin,
  Plus,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api, basePath, dateLabel, errorMessage, money } from "@/lib/client";
import { tr } from "@/lib/i18n";
import type { Article, Lang, Service, SiteSettings } from "@/lib/types";
import { BookingWidget } from "./booking";
import { ScrollEffects } from "./scroll-effects";
import { Rhythm } from "./rhythm";

export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg className={`botanical ${className}`} viewBox="0 0 240 360" fill="none" aria-hidden="true">
      <path
        d="M46 346C84 251 116 151 181 25M94 230C38 223 18 183 18 150C75 146 107 176 94 230ZM123 162C77 142 72 104 80 70C132 82 145 117 123 162ZM145 116C161 65 189 56 226 59C221 107 189 129 145 116ZM70 290C115 241 154 238 190 259C168 298 124 313 70 290ZM111 200C149 155 188 161 212 180C189 219 150 230 111 200Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M94 230L40 177M123 162L93 95M145 116L208 74M70 290L165 268M111 200L189 185"
        stroke="currentColor"
        strokeWidth=".7"
      />
    </svg>
  );
}
export function Home({
  lang,
  settings,
  services,
  articles,
  initialToday,
}: {
  lang: Lang;
  settings: SiteSettings;
  services: Service[];
  articles: Article[];
  initialToday: string;
}) {
  const ru = lang === "ru";
  const base = basePath(lang);
  const t = (key: string, fallback: string) => settings.copy?.[key]?.[lang] || fallback;
  const values = ru
    ? [
        {
          icon: ScanFace,
          title: "Твоя кожа уникальна",
          text: "Начинаем с понимания её потребностей.",
        },
        {
          icon: Leaf,
          title: "Бережно к естественному",
          text: "С вниманием к защитному барьеру кожи.",
        },
        { icon: Heart, title: "Забота надолго", text: "Помогаю разобраться в ежедневном уходе." },
      ]
    : [
        {
          icon: ScanFace,
          title: "Tava āda ir unikāla",
          text: "Sākam ar Tavas ādas vajadzību izpratni.",
        },
        { icon: Leaf, title: "Saudzīgi pret dabisko", text: "Ar cieņu pret ādas aizsargbarjeru." },
        { icon: Heart, title: "Rūpes ilgtermiņā", text: "Palīdzu izprast ikdienas ādas kopšanu." },
      ];
  return (
    <main id="main-content">
      <ScrollEffects lang={lang} />
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" />
            {settings.heroEyebrow[lang]}
          </div>
          <h1>
            {settings.heroTitle[lang]}
            <em>{settings.heroAccent[lang]}</em>
          </h1>
          <p className="hero-description">{settings.heroDescription[lang]}</p>
          <div className="hero-actions">
            <a className="button" href="#pieraksts">
              {tr(lang, "Atrodi laiku sev", "Найти время для себя")}
              <ArrowUpRight size={19} />
            </a>
            <a className="hero-secondary" href="#pieeja">
              {tr(lang, "Iepazīsti SKINSTINCT", "Знакомься со SKINSTINCT")}
              <ArrowDown size={16} />
            </a>
          </div>
          <div className="hero-credential">
            <span className="credential-icon">
              <BadgeCheck size={24} />
            </span>
            <div>
              <strong>{tr(lang, "Speciālista rokās", "В руках специалиста")}</strong>
              <span>
                {settings.specialistName} ·{" "}
                {tr(lang, "Ārstniecības persona", "Медицинский работник")}
              </span>
            </div>
          </div>
          <Botanical className="hero-botanical" />
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrap">
            <Image
              src={settings.heroImage}
              alt={tr(
                lang,
                "Saudzīga ādas kopšana siltā studijas atmosfērā",
                "Бережный уход за кожей в тёплой атмосфере студии",
              )}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <span className="image-grain" />
          </div>
          <div className="hero-image-label">
            <span className="label-flower">
              <Flower2 size={30} strokeWidth={1} />
            </span>
            <span>
              {tr(lang, "Tavs dabiskais skaistums", "Твоя естественная красота")}
              <em>{tr(lang, "sākas ar rūpēm", "начинается с заботы")}</em>
            </span>
          </div>
          <div className="hero-side-note">
            {lang === "en"
              ? "PERSONAL. GENTLE. THOUGHTFUL."
              : lang === "ru"
                ? "ЛИЧНО. БЕРЕЖНО. ОСОЗНАННО."
                : "PERSONĪGI. SAUDZĪGI. APZINĀTI."}
          </div>
        </div>
      </section>
      <section className="philosophy-strip" id="pieeja">
        <div className="container values-grid">
          {values.map((v, i) => (
            <div className="value" key={v.title}>
              <v.icon size={29} strokeWidth={1.25} />
              <div>
                <h2>{t(`value${i + 1}Title`, v.title)}</h2>
                <p>{t(`value${i + 1}Text`, v.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section services-section container" id="pakalpojumi">
        <div className="section-top">
          <div>
            <span className="eyebrow">
              01 / {tr(lang, "PĀRDOMĀTA ĀDAS KOPŠANA", "ПРОДУМАННЫЙ УХОД")}
            </span>
            <h2>
              {settings.copy.servicesTitle[lang]}
              <br />
              <em>{settings.copy.servicesAccent[lang]}</em>
            </h2>
          </div>
          <p className="section-intro">{settings.copy.servicesIntro[lang]}</p>
        </div>
        <div className="services-grid">
          {services
            .filter((s) => s.active)
            .map((s, i) => (
              <article className="service-card" key={s.id}>
                <a
                  href="#pieraksts"
                  className="service-image"
                  onClick={() =>
                    window.dispatchEvent(new CustomEvent("choose-service", { detail: s.id }))
                  }
                >
                  <Image
                    src={s.image}
                    alt={s.title[lang]}
                    fill
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                  <span className="service-number">0{i + 1}</span>
                  <span className="service-image-arrow">
                    <ArrowUpRight size={23} />
                  </span>
                </a>
                <div className="service-card-content">
                  <span className="eyebrow">{s.category[lang]}</span>
                  <h3>{s.title[lang]}</h3>
                  <p>{s.description[lang]}</p>
                  <div className="service-meta">
                    <span>
                      <Clock3 size={14} />
                      {s.duration} min
                    </span>
                    <span>{money(s.price, lang)}</span>
                  </div>
                </div>
              </article>
            ))}
        </div>
        <p className="services-note">
          <Sparkles size={15} />
          {tr(
            lang,
            "Nezini, ar ko sākt? Iepazīšanās vizīte palīdzēs saprast Tavas ādas vajadzības.",
            "Не знаешь, с чего начать? Первая встреча поможет понять Твою кожу.",
          )}
        </p>
      </section>
      <Rhythm lang={lang} services={services} settings={settings} />
      <section className="about-section" id="par-mani">
        <div className="container about-grid">
          <div
            className={`about-photo${settings.aboutImage === "/images/valerija-original-white.jpeg" ? " about-photo-original" : ""}`}
          >
            <div className="portrait-image-frame">
              <Image
                src={settings.aboutImage}
                unoptimized={settings.aboutImage === "/images/valerija-original-white.jpeg"}
                alt={settings.specialistName}
                fill
                sizes="(max-width: 760px) 100vw, 42vw"
              />
            </div>
            <span className="portrait-caption">SKINSTINCT / {settings.specialistName}</span>
            <div className="portrait-badge">
              <Leaf size={25} />
              <span>
                {tr(lang, "Ar rūpēm", "С заботой")}
                <em>{tr(lang, "par Tevi", "о Тебе")}</em>
              </span>
            </div>
          </div>
          <div className="about-copy">
            <span className="eyebrow">02 / {tr(lang, "TAVA SPECIĀLISTE", "ТВОЙ СПЕЦИАЛИСТ")}</span>
            <h2>
              {settings.aboutTitle[lang].split("\n").map((line, i) => (
                <span key={i}>{i === 1 ? <em>{line}</em> : line}</span>
              ))}
            </h2>
            <div className="prose">
              {settings.aboutBody[lang].split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="about-registration">
              <BadgeCheck size={22} />
              <div>
                <strong>{settings.specialistTitle[lang]}</strong>
                <small>
                  {tr(lang, "Ārstniecības personu reģistrs", "Реестр медицинских работников")} · Nr.{" "}
                  {settings.registration}
                </small>
              </div>
            </div>
            <a className="text-link" href="#pieraksts">
              {tr(lang, "Iepazīsimies klātienē", "Давай познакомимся")}
              <ArrowUpRight size={19} />
            </a>
          </div>
        </div>
        <Botanical className="about-botanical" />
      </section>
      <section className="quote-section container">
        <Flower2 size={35} strokeWidth={1} />
        <blockquote>{settings.copy.quote[lang]}</blockquote>
        <span className="eyebrow">
          {lang === "en"
            ? "THE SKINSTINCT PHILOSOPHY"
            : lang === "ru"
              ? "ФИЛОСОФИЯ SKINSTINCT"
              : "SKINSTINCT FILOZOFIJA"}
        </span>
      </section>
      <section className="process-section">
        <div className="container">
          <div className="process-heading">
            <span className="eyebrow">
              {tr(lang, "MIERPILNI. SAPROTAMI. PERSONĪGI.", "СПОКОЙНО. ПОНЯТНО. ЛИЧНО.")}
            </span>
            <h2>{settings.copy.processTitle[lang]}</h2>
          </div>
          <div className="process-grid">
            {(ru
              ? [
                  ["Выбери своё время", "Загляни в календарь и найди удобный день для встречи."],
                  [
                    "Познакомимся с Твоей кожей",
                    "Поговорим о Твоих привычках, потребностях и ожиданиях.",
                  ],
                  ["Забери заботу с собой", "Уйди с пониманием, как продолжить уход дома."],
                ]
              : [
                  ["Izvēlies savu laiku", "Ieskaties kalendārā un atrodi ērtu dienu mūsu sarunai."],
                  ["Iepazīsim Tavu ādu", "Pārrunāsim Tavus paradumus, vajadzības un gaidas."],
                  [
                    "Paņem rūpes līdzi",
                    "Dodies mājās ar izpratni, kā turpināt ādas kopšanu ikdienā.",
                  ],
                ]
            ).map(([title, text], i) => (
              <div className="process-step" key={title}>
                <span className="process-number">0{i + 1}</span>
                <h3>{t(`process${i + 1}Title`, title)}</h3>
                <p>{t(`process${i + 1}Text`, text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="booking-section section container" id="pieraksts">
        <div className="booking-intro">
          <span className="eyebrow">03 / {tr(lang, "TAVS LAIKS SEV", "ТВОЁ ВРЕМЯ ДЛЯ СЕБЯ")}</span>
          <h2>
            {settings.copy.bookingTitle[lang]} <em>{settings.copy.bookingAccent[lang]}</em>
          </h2>
          <p>{settings.copy.bookingIntro[lang]}</p>
          <div className="booking-intro-points">
            <span>
              <CalendarCheck size={19} />
              {tr(lang, "Aktuāli pieejamie laiki", "Актуальные свободные часы")}
            </span>
            <span>
              <ShieldCheck size={19} />
              {tr(lang, "Bez tiešsaistes priekšapmaksas", "Без предоплаты онлайн")}
            </span>
            <span>
              <Heart size={19} />
              {tr(lang, "Personīgs vizītes apstiprinājums", "Личное подтверждение визита")}
            </span>
          </div>
          <div className="booking-help">
            <img src={settings.logoImage} width={64} height={64} alt="" />
            <div>
              <span>{tr(lang, "Ir jautājumi? Esmu tepat.", "Есть вопросы? Я рядом.")}</span>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
                {tr(lang, "Uzraksti man Instagram", "Напиши мне в Instagram")}
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
          <Botanical />
        </div>
        <BookingWidget
          lang={lang}
          services={services}
          settings={settings}
          initialToday={initialToday}
        />
      </section>
      <section className="faq-section container">
        <div>
          <span className="eyebrow">{tr(lang, "NEDAUDZ SKAIDRĪBAS", "НЕМНОГО ЯСНОСТИ")}</span>
          <h2>{settings.copy.faqTitle[lang]}</h2>
        </div>
        <div className="faq-list">
          {(ru
            ? [
                [
                  "Что выбрать для первого визита?",
                  "Начни со знакомства с Твоей кожей. Мы обсудим Твой уход, пожелания и подберём дальнейшие шаги лично.",
                ],
                [
                  "Как подтверждается запись?",
                  "После заявки выбранный час резервируется в системе. Я свяжусь с Тобой по указанному телефону или почте, чтобы подтвердить встречу и уточнить детали.",
                ],
                [
                  "Как посмотреть или отменить запись?",
                  `Раздел «Мои записи» показывает визиты, оформленные в этом браузере. С другого устройства можно войти по коду записи и своему контакту. Отмена на сайте доступна не позднее чем за ${settings.cancellationHours} ч до визита. Позже напиши мне в Instagram.`,
                ],
                [
                  "Где находится студия?",
                  settings.address
                    ? `Студия находится по адресу: ${settings.address}, ${settings.city}.`
                    : `Я создаю студию в Екабпилсе. Точный адрес и детали встречи сообщу при подтверждении визита. Следи за новостями в Instagram.`,
                ],
              ]
            : lang === "en"
              ? [
                  [settings.copy.faq1Question.en, settings.copy.faq1Answer.en],
                  [settings.copy.faq2Question.en, settings.copy.faq2Answer.en],
                  [
                    "How can I view or cancel an appointment?",
                    `My appointments shows visits booked in this browser. On another device, use your booking code and the contact you provided. Online cancellation is available until ${settings.cancellationHours} h before your visit. After that, message me on Instagram.`,
                  ],
                  [
                    "Where is the studio?",
                    settings.address
                      ? `The studio is at ${settings.address}, ${settings.city}.`
                      : "I'm creating the studio in Jēkabpils. I'll share the exact address and meeting details when confirming your visit. Follow the updates on Instagram.",
                  ],
                ]
              : [
                  [
                    "Ko izvēlēties pirmajai vizītei?",
                    "Sāc ar iepazīšanās vizīti. Pārrunāsim Tavu ikdienas kopšanu, vēlmes un kopā izvēlēsimies turpmākos soļus.",
                  ],
                  [
                    "Kā tiek apstiprināts pieraksts?",
                    "Pēc pieteikuma izvēlētais laiks tiek rezervēts sistēmā. Es sazināšos pa norādīto tālruni vai e-pastu, lai apstiprinātu tikšanos un precizētu detaļas.",
                  ],
                  [
                    "Kā apskatīt vai atcelt pierakstu?",
                    `Sadaļā «Mani pieraksti» redzēsi šajā pārlūkā veiktos pierakstus. No citas ierīces vari izmantot pieraksta kodu un savu kontaktu. Atcelšana vietnē pieejama vismaz ${settings.cancellationHours} h pirms vizītes. Vēlāk uzraksti man Instagram.`,
                  ],
                  [
                    "Kur atrodas studija?",
                    settings.address
                      ? `Studija atrodas: ${settings.address}, ${settings.city}.`
                      : `Šobrīd veidoju studiju Jēkabpilī. Precīzu adresi un tikšanās detaļas paziņošu, apstiprinot vizīti. Seko jaunumiem Instagram.`,
                  ],
                ]
          ).map(([question, answer], i) => (
            <details key={question}>
              <summary>
                {t(`faq${i + 1}Question`, question)}
                <Plus size={19} />
              </summary>
              <p>{t(`faq${i + 1}Answer`, answer)}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="section journal-section">
        <div className="container">
          <div className="section-top">
            <div>
              <span className="eyebrow">
                04 / {tr(lang, "SKINSTINCT PIERAKSTI", "ЗАМЕТКИ SKINSTINCT")}
              </span>
              <h2>
                {settings.copy.journalTitle[lang]} <em>{settings.copy.journalAccent[lang]}</em>
              </h2>
            </div>
            <Link className="text-link" href={`${base}/articles`}>
              {tr(lang, "Atvērt dienasgrāmatu", "Открыть журнал")}
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="journal-grid">
            {articles
              .filter((a) => a.published)
              .slice(0, 2)
              .map((a) => (
                <ArticleCard key={a.id} article={a} lang={lang} />
              ))}
            <a
              className="instagram-card"
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={27} strokeWidth={1.25} />
              <div>
                <span className="eyebrow">@VR_SKINSTINCT</span>
                <h3>
                  {tr(
                    lang,
                    "Studija top.\nEsi daļa no stāsta.",
                    "Студия рождается.\nБудь частью истории.",
                  )}
                </h3>
                <p>
                  {tr(
                    lang,
                    "Iepazīšanās, vērtības un mazie rūpju mirkļi Instagram.",
                    "Знакомство, ценности и маленькие моменты заботы в Instagram.",
                  )}
                </p>
              </div>
              <span className="text-link">
                {tr(lang, "Tiekamies tur", "Встретимся там")}
                <ArrowUpRight size={18} />
              </span>
              <Botanical />
            </a>
          </div>
        </div>
      </section>
      <ContactSection lang={lang} settings={settings} />
    </main>
  );
}
export function ArticleCard({ article, lang }: { article: Article; lang: Lang }) {
  return (
    <article className="article-card">
      <Link href={`${basePath(lang)}/articles/${article.slug}`} className="article-image">
        <Image
          src={article.image}
          alt={article.title[lang]}
          fill
          sizes="(max-width: 760px) 100vw, 50vw"
        />
        <span className="service-image-arrow">
          <ArrowUpRight size={22} />
        </span>
      </Link>
      <div className="article-meta">
        <span className="eyebrow">{article.category[lang]}</span>
        <time dateTime={article.createdAt}>{dateLabel(article.createdAt.slice(0, 10), lang)}</time>
      </div>
      <h3>
        <Link href={`${basePath(lang)}/articles/${article.slug}`}>{article.title[lang]}</Link>
      </h3>
      <p>{article.excerpt[lang]}</p>
    </article>
  );
}
function ContactSection({ lang, settings }: { lang: Lang; settings: SiteSettings }) {
  const ru = lang === "ru";
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/inquiries", {
        name: form.get("name"),
        phone,
        email,
        message: form.get("message"),
        website: form.get("website"),
        consent: form.get("consent") === "on",
      });
      setSent(true);
    } catch (e) {
      setError(errorMessage(e, lang));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="contact-section section container" id="kontakti">
      <div className="contact-copy">
        <span className="eyebrow">{tr(lang, "SĀKSIM AR SARUNU", "НАЧНЁМ С РАЗГОВОРА")}</span>
        <h2>
          {settings.copy.contactTitle[lang]} <em>{settings.copy.contactAccent[lang]}</em>
        </h2>
        <p>{settings.copy.contactIntro[lang]}</p>
        <div className="contact-detail">
          <MapPin size={20} />
          <div>
            <strong>
              {settings.city}, {lang === "en" ? "Latvia" : lang === "ru" ? "Латвия" : "Latvija"}
            </strong>
            <span>
              {settings.address ||
                tr(
                  lang,
                  "Adresi precizēsim, apstiprinot vizīti",
                  "Адрес уточним при подтверждении визита",
                )}
            </span>
          </div>
        </div>
        <a
          className="text-link"
          href={settings.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram size={19} />
          @vr_skinstinct
          <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="contact-form-wrap">
        {sent ? (
          <div className="contact-success" role="status">
            <span className="success-icon">
              <Check size={30} />
            </span>
            <h3>{tr(lang, "Paldies par uzticēšanos.", "Спасибо за доверие.")}</h3>
            <p>
              {tr(
                lang,
                "Tava ziņa ir saglabāta. Es sazināšos ar Tevi, izmantojot norādīto kontaktu.",
                "Твоё сообщение сохранено. Я свяжусь с Тобой по указанному контакту.",
              )}
            </p>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <h3>{settings.copy.contactFormTitle[lang]}</h3>
            <label>
              {tr(lang, "Tavs vārds", "Твоё имя")} *
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="given-name"
                placeholder={tr(lang, "Kā Tevi sauc?", "Как Тебя зовут?")}
              />
            </label>
            <div className="form-row">
              <label>
                {tr(lang, "Tālrunis", "Телефон")}
                <input
                  type="tel"
                  autoComplete="tel"
                  name="phone"
                  placeholder="+371"
                  maxLength={30}
                  required={!email}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label>
                {tr(lang, "E-pasts", "Эл. почта")}
                <input
                  type="email"
                  autoComplete="email"
                  name="email"
                  placeholder="hello@example.com"
                  maxLength={200}
                  required={!phone}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            <p className="field-hint">
              {tr(
                lang,
                "Nepieciešams vismaz viens kontakts: tālrunis vai e-pasts.",
                "Нужен хотя бы один способ связи: телефон или почта.",
              )}
            </p>
            <label>
              {tr(lang, "Kas Tevi interesē?", "Что Тебя интересует?")}
              <textarea
                name="message"
                rows={3}
                maxLength={2000}
                placeholder={tr(
                  lang,
                  "Pastāsti, ko vēlies pajautāt",
                  "Расскажи, о чём хочешь спросить",
                )}
              />
            </label>
            <p className="field-hint">
              {tr(
                lang,
                "Nesūti medicīniskos dokumentus vai sensitīvu informāciju par veselību.",
                "Не отправляй медицинские документы и конфиденциальные сведения о здоровье.",
              )}
            </p>
            <label className="honeypot" aria-hidden>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label className="checkbox-label">
              <input name="consent" type="checkbox" required />
              <span>
                {tr(lang, "Esmu iepazinies ar ", "Я ознакомился с ")}
                <Link href={`${basePath(lang)}/privacy`} target="_blank">
                  {tr(lang, "privātuma politiku", "политикой конфиденциальности")}
                </Link>
                {tr(lang, " un lūdzu sazināties ar mani.", " и прошу связаться со мной.")}
              </span>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={pending}>
              {pending ? <LoaderCircle size={18} className="spin" /> : <ArrowUpRight size={18} />}{" "}
              {pending
                ? tr(lang, "Sūtām...", "Отправляем...")
                : tr(lang, "Nosūtīt ziņu", "Отправить сообщение")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
