import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getArticles, getServices, getSettings } from "@/lib/db";
import { today } from "@/lib/booking";
import { basePath } from "@/lib/client";
import { safeJson, siteUrl } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { CookieNotice, Footer, Header, MobileBooking } from "@/components/chrome";
import { ArticleCard, Home } from "@/components/home";
import { Account } from "@/components/account";
import { Privacy } from "@/components/legal";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug?: string[] }> };
function resolve(slug: string[] = []) {
  const parts = [...slug];
  const lang: Lang = parts[0] === "ru" ? (parts.shift(), "ru") : "lv";
  return { lang, parts };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, parts } = resolve((await params).slug);
  const s = getSettings();
  const ru = lang === "ru";
  const article =
    parts[0] === "articles" && parts[1]
      ? getArticles().find((a) => a.slug === parts[1] && a.published)
      : null;
  const title = article
    ? article.title[lang]
    : parts[0] === "account"
      ? ru
        ? "Мои записи"
        : "Mani pieraksti"
      : parts[0] === "privacy"
        ? ru
          ? "Конфиденциальность"
          : "Privātuma politika"
        : parts[0] === "articles"
          ? ru
            ? "Журнал студии"
            : "Studijas dienasgrāmata"
          : ru
            ? "Косметология в Екабпилсе"
            : "Kosmetoloģija Jēkabpilī";
  const suffix = parts.length ? `/${parts.join("/")}` : "";
  const canonical = `${siteUrl()}${basePath(lang)}${suffix}`;
  const description = article?.excerpt[lang] || s.seoDescription[lang];
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        lv: `${siteUrl()}${suffix}`,
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
      locale: ru ? "ru_LV" : "lv_LV",
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
  const ru = lang === "ru";
  const s = getSettings();
  const services = getServices();
  const articles = getArticles().filter((a) => a.published);
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
      url: siteUrl(),
      description: s.seoDescription[lang],
      image: `${siteUrl()}${s.heroImage}`,
      sameAs: [s.instagram],
      address: {
        "@type": "PostalAddress",
        addressLocality: s.city,
        addressCountry: "LV",
        ...(s.address ? { streetAddress: s.address } : {}),
      },
      ...(s.phone ? { telephone: s.phone } : {}),
      ...(s.email ? { email: s.email } : {}),
      employee: { "@type": "Person", name: s.specialistName, jobTitle: s.specialistTitle[lang] },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: ru ? "Услуги" : "Pakalpojumi",
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
  else if (parts.length === 1 && ["privacy", "cookies"].includes(parts[0]))
    content = <Privacy lang={lang} settings={s} />;
  else if (parts.length === 1 && parts[0] === "articles")
    content = (
      <main id="main-content" className="container inner-page">
        <div className="page-heading">
          <span className="eyebrow">
            SKINSTINCT / {ru ? "ЖУРНАЛ СТУДИИ" : "STUDIJAS DIENASGRĀMATA"}
          </span>
          <h1>
            {ru ? "Рядом с твоей " : "Tuvāk tavai "}
            <em>{ru ? "кожей." : "ādai."}</em>
          </h1>
          <p>
            {ru
              ? "Мои заметки, ценности и новости студии. Для осознанной заботы о себе."
              : "Mani pieraksti, vērtības un studijas jaunumi. Apzinātām rūpēm par sevi."}
          </p>
        </div>
        <div className="articles-list">
          {articles.map((a) => (
            <ArticleCard article={a} lang={lang} key={a.id} />
          ))}
        </div>
        {!articles.length && (
          <p>{ru ? "Первые заметки скоро появятся." : "Pirmie pieraksti drīzumā."}</p>
        )}
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
            {ru ? "Журнал студии" : "Studijas dienasgrāmata"}
          </Link>
          <span className="eyebrow">{article.category[lang]}</span>
          <h1>{article.title[lang]}</h1>
          <div className="article-meta">
            <span className="eyebrow">{s.specialistName}</span>
            <time dateTime={article.createdAt}>
              {new Intl.DateTimeFormat(ru ? "ru-RU" : "lv-LV", {
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
          <div className="article-cta">
            <Link href={`${base}/#pieraksts`} className="button">
              {ru ? "Время для себя" : "Laiks sev"}
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
