"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="not-found" id="main-content"><span className="eyebrow">SKINSTINCT</span><h1>Atvilksim elpu.</h1><p>Radās savienojuma kļūda. / Ошибка соединения.</p><button className="button" onClick={reset}>Mēģināt vēlreiz / Попробовать снова</button></main>;}
