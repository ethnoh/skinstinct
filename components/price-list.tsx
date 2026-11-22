"use client";

import { Printer } from "lucide-react";
import { basePath } from "@/lib/client";
import { priceGroups } from "@/lib/price-catalogue";
import { isPriceRange, serviceDuration, servicePrice } from "@/lib/service-display";
import type { Lang, Service } from "@/lib/types";
import { cataloguePriceDate, diagnosticNotice, introductoryNotice, OFFER_END } from '@/lib/opening-offer';
import { TreatmentPrice } from './treatment-price';

export function ChooseTreatment({
  service,
  lang,
  className = "text-link",
}: {
  service: Service;
  lang: Lang;
  className?: string;
}) {
  const base = basePath(lang);
  if (service.bookable === false) return <span className="small muted">{{lv:'Pieraksts vēl nav atvērts',en:'Booking not yet open',ru:'Запись пока закрыта'}[lang]}</span>;
  return (
    <a
      className={className}
      href={`${base || "/"}?service=${encodeURIComponent(service.id)}#pieraksts`}
      onClick={(event) => {
        if (window.location.pathname === (base || "/")) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("choose-service", { detail: service.id }));
          document.getElementById("pieraksts")?.scrollIntoView({ behavior: "smooth" });
        }
      }}
    >
      {{ lv: "Pieteikties", en: "Book this treatment", ru: "Записаться" }[lang]}
      <span className="visually-hidden">
        : {service.title[lang]}, {servicePrice(service, lang)}
      </span>
    </a>
  );
}

export function PrintPriceList({ lang }: { lang: Lang }) {
  return (
    <button
      type="button"
      className="button button-outline price-print-button"
      onClick={() => window.print()}
    >
      <Printer size={18} aria-hidden="true" />
      {
        {
          lv: "Drukāt vai saglabāt PDF",
          en: "Print or save as PDF",
          ru: "Распечатать или сохранить PDF",
        }[lang]
      }
    </button>
  );
}

export function PriceList({
  services,
  lang,
  compact = false,
  today,
}: {
  services: Service[];
  lang: Lang;
  compact?: boolean;
  today: string;
}) {
  const active = services.filter((s) => s.active);
  const groups = Object.keys(priceGroups) as (keyof typeof priceGroups)[];
  return (
    <div className={`price-list${compact ? " price-list-compact" : ""}`}>
      {today <= OFFER_END && <p className="price-offer-notice">{introductoryNotice[lang]}</p>}
      <div className="price-groups">
        {groups.map((group) => {
          const entries = active.filter((s) => (s.group || "other") === group);
          if (!entries.length) return null;
          return (
            <section
              className="price-group"
              key={group}
              data-group={group}
              aria-labelledby={`price-${group}`}
            >
              <h3 id={`price-${group}`}>{priceGroups[group][lang]}</h3>
              <ul>
                {entries.map((service) => (
                  <li className="price-row" key={service.id} data-service-id={service.id}>
                    <div className="price-row-copy">
                      <h4>{service.title[lang]}</h4>
                      <p>{service.description[lang]}</p>
                    </div>
                    <div className="price-row-value">
                      <strong>
                        <TreatmentPrice service={service} lang={lang} date={cataloguePriceDate(today)} />
                        {isPriceRange(service) && <span aria-hidden="true">*</span>}
                      </strong>
                      <span>{serviceDuration(service, lang)}</span>
                    </div>
                    <ChooseTreatment service={service} lang={lang} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="price-footnote">{diagnosticNotice[lang]}</p>
      {active.some(isPriceRange) && (
        <p className="price-footnote">
          {
            {
              lv: "* Injekciju procedūrām precīza cena atkarīga no preparāta daudzuma, izvēlētajām zonām un individuālā plāna. To saskaņosim pirms procedūras.",
              en: "* The exact price of injectable treatments depends on the product quantity, chosen areas and individual plan. We will agree on it before the treatment.",
              ru: "* Точная стоимость инъекционных процедур зависит от количества препарата, выбранных зон и индивидуального плана. Согласуем её до процедуры.",
            }[lang]
          }
        </p>
      )}
    </div>
  );
}
