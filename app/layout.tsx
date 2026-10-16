import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { themeBootstrap } from "@/lib/theme";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./motion.css";
import "./theme.css";

export const metadata: Metadata = {
  title: { default: "SKINSTINCT | Kosmetoloģija Jēkabpilī", template: "%s | SKINSTINCT" },
  description:
    "SKINSTINCT kosmetoloģijas studija Jēkabpilī. Valērija Razujeva. Individuāla ādas kopšana, diagnostika un korneoterapija.",
  icons: { icon: "/favicon.png", apple: "/apple-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#faf8f3" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requested = (await headers()).get("x-site-lang");
  const lang = requested === "ru" || requested === "en" ? requested : "lv";
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootstrap(),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            {lang === "ru"
              ? "К содержимому"
              : lang === "en"
                ? "Skip to content"
                : "Uz galveno saturu"}
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
