"use client";

import { useRef } from "react";
import { Check, Clock3, Moon, Sun, X } from "lucide-react";
import type { Lang } from "@/lib/types";
import { LATVIA_TIME_ZONE, type ThemeMode } from "@/lib/theme";
import { useTheme } from "./theme-provider";

const copy = {
  lv: {
    title: "Vietnes izskats",
    auto: "Automātiski",
    light: "Gaišā tēma",
    dark: "Tumšā tēma",
    hint: "Dienā gaiša, pēc saulrieta tumša. Vari izvēlēties arī pati.",
    sunrise: "Saullēkts",
    sunset: "Saulriets",
    close: "Aizvērt",
  },
  en: {
    title: "Website appearance",
    auto: "Automatic",
    light: "Light theme",
    dark: "Dark theme",
    hint: "Light by day, dark after sunset. You can also choose your own theme.",
    sunrise: "Sunrise",
    sunset: "Sunset",
    close: "Close",
  },
  ru: {
    title: "Оформление сайта",
    auto: "Автоматически",
    light: "Светлая тема",
    dark: "Тёмная тема",
    hint: "Днём светлая, после заката тёмная. Можно выбрать тему вручную.",
    sunrise: "Восход",
    sunset: "Закат",
    close: "Закрыть",
  },
};

export function ThemeToggle({ lang }: { lang: Lang }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const state = useTheme();
  const t = copy[lang];
  const options = [
    { mode: "auto", icon: Clock3 },
    { mode: "light", icon: Sun },
    { mode: "dark", icon: Moon },
  ] as const;
  const clock = (timestamp: number) =>
    new Intl.DateTimeFormat(lang === "en" ? "en-GB" : `${lang}-${lang === "lv" ? "LV" : "RU"}`, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: LATVIA_TIME_ZONE,
    }).format(timestamp);
  function choose(mode: ThemeMode) {
    state?.choose(mode);
    dialog.current?.close();
  }
  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        aria-label={t.title}
        title={t.title}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <Sun className="theme-sun" size={17} aria-hidden="true" />
        <Moon className="theme-moon" size={17} aria-hidden="true" />
      </button>
      <dialog
        ref={dialog}
        className="theme-dialog"
        aria-labelledby="theme-dialog-title"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="theme-dialog-inner">
          <button
            type="button"
            className="icon-button dialog-close"
            aria-label={t.close}
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <h2 id="theme-dialog-title">{t.title}</h2>
          <p>{t.hint}</p>
          <div className="theme-options">
            {options.map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                data-theme-option={mode}
                aria-pressed={(state?.mode ?? "auto") === mode}
                onClick={() => choose(mode)}
              >
                <Icon size={20} />
                <span>{t[mode]}</span>
                {(state?.mode ?? "auto") === mode && <Check size={18} />}
              </button>
            ))}
          </div>
          {state && (
            <div className="sun-times">
              <span>
                Jēkabpils, {lang === "en" ? "Latvia" : lang === "ru" ? "Латвия" : "Latvija"}
              </span>
              <span>
                {t.sunrise} {clock(state.times.sunrise)} · {t.sunset} {clock(state.times.sunset)}
              </span>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
