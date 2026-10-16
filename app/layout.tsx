import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SKINSTINCT | Kosmetoloģija Jēkabpilī", template: "%s | SKINSTINCT" },
  description: "SKINSTINCT kosmetoloģijas studija Jēkabpilī. Valērija Razujeva. Individuāla ādas kopšana, diagnostika un korneoterapija.",
  icons: { icon: "/favicon.png", apple: "/apple-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf8f3" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang=(await headers()).get("x-site-lang")==="ru"?"ru":"lv";
  return <html lang={lang}><body><a className="skip-link" href="#main-content">{lang==="ru"?"К содержимому":"Uz galveno saturu"}</a>{children}</body></html>;
}
