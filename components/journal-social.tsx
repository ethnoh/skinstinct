"use client";

import { useState } from "react";
import Image from "next/image";
import { Instagram, Facebook } from "lucide-react";
import type { Lang, Localized } from "@/lib/types";
import { instagramIntroduction } from "@/lib/journal-content";

const copy = {
  eyebrow: { lv: "NO STUDIJAS IKDIENAS", en: "EVERYDAY STUDIO MOMENTS", ru: "ИЗ ЖИЗНИ СТУДИИ" },
  title: {
    lv: "Mazie mirkļi. Tā pati pieeja.",
    en: "Small moments. The same care.",
    ru: "Маленькие моменты. Та же забота.",
  },
  body: {
    lv: "Detaļas no studijas, mani pieraksti un sarunas Instagram. Viss, kas veido SKINSTINCT.",
    en: "Studio details, personal notes and conversations on Instagram. The moments that make SKINSTINCT.",
    ru: "Детали студии, мои заметки и общение в Instagram. Всё, из чего складывается SKINSTINCT.",
  },
  quote: {
    lv: "Vēlos, lai SKINSTINCT būtu ne tikai vieta procedūrām, bet arī vieta, kur sieviete labāk izprot savu ādu.",
    en: "I want SKINSTINCT to be a place where women can better understand their skin, as well as a place for treatments.",
    ru: "Хочу, чтобы SKINSTINCT был не только местом процедур, но и местом, где женщина лучше понимает свою кожу.",
  },
  post: {
    lv: "Iepazīsimies. Mans stāsts Instagram.",
    en: "Let's meet. My story on Instagram.",
    ru: "Познакомимся. Моя история в Instagram.",
  },
  load: { lv: "Skatīt ierakstu šeit", en: "View the post here", ru: "Посмотреть пост здесь" },
  external: {
    lv: "Atvērt Instagram ierakstu",
    en: "Open the Instagram post",
    ru: "Открыть пост в Instagram",
  },
  privacy: {
    lv: "Ierakstu ielādēsim no Instagram tikai pēc Tava klikšķa.",
    en: "The post loads from Instagram only after you click.",
    ru: "Пост загрузится из Instagram только после Твоего нажатия.",
  },
  profile: {
    lv: "Posti un reels Instagram",
    en: "Posts and reels on Instagram",
    ru: "Посты и reels в Instagram",
  },
} satisfies Record<string, Localized>;

export function JournalSocial({
  lang,
  instagram,
  facebook,
}: {
  lang: Lang;
  instagram: string;
  facebook?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <section className="journal-social" aria-labelledby="journal-social-title">
      <div className="journal-social-heading">
        <span className="eyebrow">{copy.eyebrow[lang]}</span>
        <h2 id="journal-social-title">{copy.title[lang]}</h2>
        <p>{copy.body[lang]}</p>
      </div>
      <div className="journal-social-grid">
        <div className="journal-photo-pair">
          <figure>
            <Image
              src="/images/journal-brushes.webp"
              alt={
                {
                  lv: "Kopšanas otiņas un studijas detaļas",
                  en: "Skincare brushes and studio details",
                  ru: "Кисти для ухода и детали студии",
                }[lang]
              }
              fill
              sizes="(max-width: 760px) 45vw, 25vw"
            />
          </figure>
          <figure>
            <Image
              src="/images/journal-details.webp"
              alt={
                {
                  lv: "Profesionālās kopšanas līdzekļi SKINSTINCT studijā",
                  en: "Professional skincare products at SKINSTINCT",
                  ru: "Профессиональные средства ухода в студии SKINSTINCT",
                }[lang]
              }
              fill
              sizes="(max-width: 760px) 45vw, 25vw"
            />
          </figure>
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="journal-profile-link"
          >
            <Instagram size={19} aria-hidden="true" />
            {copy.profile[lang]}
          </a>
          {facebook && (
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="journal-profile-link"
            >
              <Facebook size={19} aria-hidden="true" />
              Facebook · @vrskinstinct
            </a>
          )}
        </div>
        <div className="journal-instagram-post">
          <span className="eyebrow">
            <Instagram size={18} aria-hidden="true" /> @VR_SKINSTINCT
          </span>
          <h3>{copy.post[lang]}</h3>
          {loaded ? (
            <iframe
              src="https://www.instagram.com/p/DeGuHoeDNfY/embed/captioned/"
              title={copy.post[lang]}
              className="journal-instagram-frame"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <>
              <blockquote>{copy.quote[lang]}</blockquote>
              <button type="button" className="button button-small" onClick={() => setLoaded(true)}>
                {copy.load[lang]}
              </button>
              <p className="journal-embed-notice">{copy.privacy[lang]}</p>
            </>
          )}
          <a
            href={instagramIntroduction}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            {copy.external[lang]}
          </a>
        </div>
      </div>
    </section>
  );
}
