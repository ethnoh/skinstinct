import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found" id="main-content">
      <span className="eyebrow">SKINSTINCT</span>
      <h1>404</h1>
      <p>Lapa nav atrasta. / Страница не найдена.</p>
      <Link className="button" href="/">
        Atgriezties sākumā / На главную
      </Link>
    </main>
  );
}
