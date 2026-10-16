"use client";
import { usePathname } from "next/navigation";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const path = usePathname();
  const lang = path === "/en" || path.startsWith("/en/") ? "en" : path === "/ru" || path.startsWith("/ru/") ? "ru" : "lv";
  return (
    <main className="not-found" id="main-content">
      <span className="eyebrow">SKINSTINCT</span>
      <h1>{{lv: "Atvilksim elpu.", en: "Let's take a breath.", ru: "Сделаем паузу."}[lang]}</h1>
      <p>{{lv: "Radās savienojuma kļūda.", en: "A connection error occurred.", ru: "Ошибка соединения."}[lang]}</p>
      <button className="button" onClick={reset}>
        {{lv: "Mēģināt vēlreiz", en: "Try again", ru: "Попробовать снова"}[lang]}
      </button>
    </main>
  );
}
