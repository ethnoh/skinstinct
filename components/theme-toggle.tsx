"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import type { Lang } from "@/lib/types";

export function ThemeToggle({ lang }: { lang: Lang }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  const label = {
    lv: dark ? "Ieslēgt gaišo tēmu" : "Ieslēgt tumšo tēmu",
    en: dark ? "Switch to light theme" : "Switch to dark theme",
    ru: dark ? "Включить светлую тему" : "Включить тёмную тему",
  }[lang];
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      aria-pressed={dark}
      title={label}
      onClick={() => {
        const next = !dark;
        document.documentElement.dataset.theme = next ? "dark" : "light";
        document.documentElement.style.colorScheme = next ? "dark" : "light";
        try {
          localStorage.setItem("skinstinct-theme", next ? "dark" : "light");
        } catch {}
        setDark(next);
      }}
    >
      <Sun className="theme-sun" size={17} aria-hidden="true" />
      <Moon className="theme-moon" size={17} aria-hidden="true" />
    </button>
  );
}
