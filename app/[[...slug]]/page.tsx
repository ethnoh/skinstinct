import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getArticles, getServices, getSettings } from "@/lib/db";
import { today } from "@/lib/booking";
import { basePath } from "@/lib/client";
import { tr } from "@/lib/i18n";
import { safeJson, siteUrl } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { CookieNotice, Footer, Header, MobileBooking } from "@/components/chrome";
import { ArticleCard, Home } from "@/components/home";
import { Account } from "@/components/account";
import { Privacy } from "@/components/legal";
import { JournalSocial } from "@/components/journal-social";
import { instagramIntroduction, journalArticles } from "@/lib/journal-content";
import { journalTopicArticles } from '@/lib/journal-topics';
import { PriceList, PrintPriceList } from "@/components/price-list";
import { studioMapsUrl } from '@/lib/studio-details';
import {Contacts} from '@/components/contacts';

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug?: string[] }> };
function resolve(slug: string[] = []) {
  const parts = [...slug];
  const lang: Lang = parts[0] === "ru" || parts[0] === "en" ? (parts.shift() as Lang) : "lv";
  return { lang, parts };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, parts } = resolve((await params).slug);
  const s = getSettings();
  const article =
    parts[0] === "articles" && parts[1]
      ? getArticles().find((a) => a.slug === parts[1] && a.published)
      : null;
  const title = article
    ? article.title[lang]
    : parts[0] === "contacts"
      ? {lv:'Kontakti un rekvizīti',en:'Contact and company details',ru:'Контакты и реквизиты'}[lang]
    : parts[0] === "account"
      ? tr(lang, "Mani pieraksti", "Мои записи")
      : parts[0] === "privacy"
        ? tr(lang, "Privātuma politika", "Конфиденциальность")
        : parts[0] === "prices"
          ? { lv: "Procedūras un cenrādis", en: "Treatments and prices", ru: "Процедуры и цены" }[
              lang
            ]
          : parts[0] === "articles"
            ? tr(lang, "Studijas dienasgrāmata", "Журнал студии")
            : tr(lang, "Kosmetoloģija Jēkabpilī", "Косметология в Екабпилсе");
  const suffix = parts.length ? `/${parts.join("/")}` : "";
  const canonical = `${siteUrl()}${basePath(lang)}${suffix}`;
  const description = article?.excerpt[lang] || s.seoDescription[lang];
  return {
    title,
    description,
    verification: process.env.GOOGLE_SITE_VERIFICATION ? {google:process.env.GOOGLE_SITE_VERIFICATION} : undefined,
    alternates: {
      canonical,
      languages: {
        lv: `${siteUrl()}${suffix}`,
        en: `${siteUrl()}/en${suffix}`,
        ru: `${siteUrl()}/ru${suffix}`,
        "x-default": `${siteUrl()}${suffix}`,
      },
    },
    robots:
      parts[0] === "account" ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | SKINSTINCT`,
      description,
      url: canonical,
      siteName: "SKINSTINCT",
      locale: tr(lang, "lv_LV", "ru_LV"),
      type: article ? "article" : "website",
      images: [
        {
          url: `${siteUrl()}${article?.image || "/images/og-cover.jpg"}`,
          width: 1200,
          height: 630,
          alt: "SKINSTINCT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SKINSTINCT`,
      description,
      images: [`${siteUrl()}/images/og-cover.jpg`],
    },
  };
}
function ArticleBody({ text }: { text: string }) {
  return (
    <div className="article-body">
      {text.split(/\n\n+/).map((block, i) =>
        block.startsWith("## ") ? (
          <section key={i}>
            {block
              .split("\n")
              .map((line, j) =>
                line.startsWith("## ") ? <h2 key={j}>{line.slice(3)}</h2> : <p key={j}>{line}</p>,
              )}
          </section>
        ) : (
          <p key={i} style={{ whiteSpace: "pre-line" }}>
            {block}
          </p>
        ),
      )}
    </div>
  );
}
export default async function Page({ params }: Props) {
  const { lang, parts } = resolve((await params).slug);
  const s = getSettings();
  const services = getServices();
  const articles = getArticles().filter((a) => a.published).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
  const base = basePath(lang);
  let content: React.ReactNode;
  let structured: unknown = null;
  if (parts.length === 0) {
    content = (
      <Home
        lang={lang}
        settings={s}
        services={services}
        articles={articles}
        initialToday={today()}
      />
    );
    structured = {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "@id": `${siteUrl()}/#studio`,
      name: "SKINSTINCT",
      alternateName: "VR SKINSTINCT",
      url: siteUrl(),
      description: s.seoDescription[lang],
      image: `${siteUrl()}${s.heroImage}`,
      logo: `${siteUrl()}${s.logoImage}`,
      hasMap: studioMapsUrl,
      areaServed: { '@type':'City', name:s.city },
      sameAs: [studioMapsUrl, s.instagram, ...(s.facebook ? [s.facebook] : [])],
      address: {
        "@type": "PostalAddress",
        addressLocality: s.city,
        addressCountry: "LV",
        ...(s.address ? { streetAddress: s.address } : {}),
        ...(s.address === 'Pļaviņu iela 51' && s.city === 'Jēkabpils' ? {postalCode:'LV-5201'} : {}),
      },
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.email ? { email: s.email } : {}),
      employee: { "@type": "Person", name: s.specialistName, jobTitle: s.specialistTitle[lang] },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: tr(lang, "Pakalpojumi", "Услуги"),
        itemListElement: services
          .filter((v) => v.active)
          .map((v) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: v.title[lang],
              description: v.description[lang],
            },
          })),
      },
    };
  } else if (parts.length === 1 && parts[0] === "account")
    content = <Account lang={lang} settings={s} />;
  else if (parts.length === 1 && parts[0] === 'contacts') {
    content=<Contacts lang={lang} settings={s}/>;
    structured={'@context':'https://schema.org','@type':'ContactPage',url:`${siteUrl()}${base}/contacts`,name:{lv:'Kontakti un rekvizīti',en:'Contact and company details',ru:'Контакты и реквизиты'}[lang],about:{'@type':'Organization',name:s.legalName,identifier:s.legalRegistration,vatID:s.vatNumber,telephone:s.phone,email:s.email,address:{'@type':'PostalAddress',streetAddress:s.legalAddress,addressCountry:'LV'}}};
  }
  else if (parts.length === 1 && ["privacy", "cookies"].includes(parts[0]))
    content = <Privacy lang={lang} settings={s} />;
  else if (parts.length === 1 && parts[0] === "prices")
    content = (
      <main id="main-content" className="container inner-page price-page">
        <div className="price-page-heading">
          <img
            className="price-print-logo"
            src={s.logoImage}
            width={100}
            height={100}
            alt="SKINSTINCT"
          />
          <div>
            <span className="eyebrow">
              SKINSTINCT /{" "}
              {
                {
                  lv: "PROFESIONĀLA ĀDAS KOPŠANA",
                  en: "PROFESSIONAL SKINCARE",
                  ru: "ПРОФЕССИОНАЛЬНЫЙ УХОД ЗА КОЖЕЙ",
                }[lang]
              }
            </span>
            <h1>
              {{ lv: "Procedūras un ", en: "Treatments and ", ru: "Процедуры и " }[lang]}
              <em>{{ lv: "cenas.", en: "prices.", ru: "цены." }[lang]}</em>
            </h1>
            <p>
              {
                {
                  lv: "Pārskatāms studijas cenrādis. Visas cenas norādītas eiro; izvēloties procedūru, tās cena būs redzama arī pierakstā.",
                  en: "A clear studio price list. All prices are in euros; your chosen treatment's price is also shown during booking.",
                  ru: "Понятный прайс-лист студии. Все цены указаны в евро; стоимость выбранной процедуры видна и при записи.",
                }[lang]
              }
            </p>
          </div>
          <PrintPriceList lang={lang} />
        </div>
        <PriceList services={services} lang={lang} today={today()} />
      </main>
    );
  else if (parts.length === 1 && parts[0] === "articles")
    content = (
      <main id="main-content" className="container inner-page">
        <div className="page-heading">
          <span className="eyebrow">
            SKINSTINCT / {tr(lang, "STUDIJAS DIENASGRĀMATA", "ЖУРНАЛ СТУДИИ")}
          </span>
          <h1>
            {tr(lang, "Tuvāk Tavai ", "Рядом с Твоей ")}
            <em>{tr(lang, "ādai.", "кожей.")}</em>
          </h1>
          <p>
            {tr(
              lang,
              "Mani pieraksti, vērtības un studijas jaunumi. Apzinātām rūpēm par sevi.",
              "Мои заметки, ценности и новости студии. Для осознанной заботы о себе.",
            )}
          </p>
        </div>
        <div className="journal-grid">
          {articles.map((a) => (
            <ArticleCard article={a} lang={lang} key={a.id} />
          ))}
        </div>
        {!articles.length && (
          <p>{tr(lang, "Pirmie pieraksti drīzumā.", "Первые заметки скоро появятся.")}</p>
        )}
        <JournalSocial lang={lang} instagram={s.instagram} facebook={s.facebook} />
      </main>
    );
  else if (parts.length === 2 && parts[0] === "articles") {
    const article = articles.find((a) => a.slug === parts[1]);
    if (!article) notFound();
    structured = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title[lang],
      description: article.excerpt[lang],
      image: `${siteUrl()}${article.image}`,
      datePublished: article.createdAt,
      author: { "@type": "Person", name: s.specialistName },
      publisher: {
        "@type": "Organization",
        name: "SKINSTINCT",
        logo: { "@type": "ImageObject", url: `${siteUrl()}/images/skinstinct-logo.webp` },
      },
      mainEntityOfPage: `${siteUrl()}${base}/articles/${article.slug}`,
      inLanguage: lang,
    };
    content = (
      <main id="main-content" className="container inner-page">
        <article className="article-detail">
          <Link className="back-link" href={`${base}/articles`}>
            <ArrowLeft size={16} />
            {tr(lang, "Studijas dienasgrāmata", "Журнал студии")}
          </Link>
          <span className="eyebrow">{article.category[lang]}</span>
          <h1>{article.title[lang]}</h1>
          <div className="article-meta">
            <span className="eyebrow">{s.specialistName}</span>
            <time dateTime={article.createdAt}>
              {new Intl.DateTimeFormat(tr(lang, "lv-LV", "ru-RU"), {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date(article.createdAt))}
            </time>
          </div>
          <div className="article-cover">
            <Image
              src={article.image}
              alt={article.title[lang]}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 820px"
            />
          </div>
          <ArticleBody text={article.body[lang]} />
          {(article.id === "intro" || journalArticles.some((item) => item.id === article.id) || journalTopicArticles.some(item=>item.id===article.id)) && (
            <a
              className="text-link article-source"
              href={journalTopicArticles.some(item=>item.id===article.id) ? s.instagram : instagramIntroduction}
              target="_blank"
              rel="noopener noreferrer"
            >
              {
                journalTopicArticles.some(item=>item.id===article.id) ? {lv:'Posti un reels Instagram',en:'Posts and reels on Instagram',ru:'Посты и reels в Instagram'}[lang] : {
                  lv: "Saistītais Instagram ieraksts",
                  en: "Related Instagram post",
                  ru: "Пост в Instagram по теме",
                }[lang]
              }
            </a>
          )}
          <div className="article-cta">
            <Link href={`${base}/#pieraksts`} className="button">
              {tr(lang, "Laiks sev", "Время для себя")}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </article>
      </main>
    );
  } else notFound();
  return (
    <>
      <Header lang={lang} settings={s} />
      {structured && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(structured) }}
        />
      )}
      {content}
      <Footer lang={lang} settings={s} />
      <MobileBooking lang={lang} />
      <CookieNotice lang={lang} />
    </>
  );
}
