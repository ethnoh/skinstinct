"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getLatviaSunTimes,
  parseThemeMode,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeMode,
} from "@/lib/theme";

type ThemeState = { mode: ThemeMode; theme: Theme; times: ReturnType<typeof getLatviaSunTimes> };
const ThemeContext = createContext<(ThemeState & { choose: (mode: ThemeMode) => void }) | null>(
  null,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState | null>(null);
  const modeRef = useRef<ThemeMode>("auto");
  const refreshRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    try {
      modeRef.current = parseThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {}
    let timer: number;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      const mode = modeRef.current;
      const times = getLatviaSunTimes(now);
      const theme = resolveTheme(mode, now);
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themeMode = mode;
      document.documentElement.style.colorScheme = theme;
      setState({ mode, theme, times });
      const nextBoundary =
        now.getTime() < times.sunrise
          ? times.sunrise
          : now.getTime() < times.sunset
            ? times.sunset
            : Infinity;
      timer = window.setTimeout(
        refresh,
        mode === "auto"
          ? Math.min(60_000, Math.max(100, nextBoundary - now.getTime() + 30))
          : 60_000,
      );
    };
    refreshRef.current = refresh;
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        modeRef.current = parseThemeMode(event.newValue);
        refresh();
      }
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timer);
      refreshRef.current = null;
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const choose = (mode: ThemeMode) => {
    modeRef.current = mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
    refreshRef.current?.();
  };
  return (
    <ThemeContext.Provider value={state ? { ...state, choose } : null}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
