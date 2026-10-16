import Link from "next/link";
import { headers } from "next/headers";
export default async function NotFound() {
  const requested = (await headers()).get("x-site-lang");
  const lang = requested === "en" || requested === "ru" ? requested : "lv";
  return (
    <main className="not-found" id="main-content">
      <span className="eyebrow">SKINSTINCT</span>
      <h1>404</h1>
      <p>{{lv: "Lapa nav atrasta.", en: "Page not found.", ru: "Страница не найдена."}[lang]}</p>
      <Link className="button" href={lang === "lv" ? "/" : `/${lang}`}>
        {{lv: "Atgriezties sākumā", en: "Back to home", ru: "На главную"}[lang]}
      </Link>
    </main>
  );
}
