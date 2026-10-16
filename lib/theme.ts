import { getTimes } from "suncalc";

export type Theme = "light" | "dark";
export type ThemeMode = "auto" | Theme;
export const THEME_STORAGE_KEY = "skinstinct-theme-mode";
export const LATVIA_TIME_ZONE = "Europe/Riga";

// City-centre coordinates, not an inferred studio address.
const LOCATION = { latitude: 56.5, longitude: 25.86 };
const calendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: LATVIA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getLatviaSunTimes(now = new Date()) {
  const parts = calendar.formatToParts(now);
  const part = (name: string) => parts.find((value) => value.type === name)!.value;
  const date = `${part("year")}-${part("month")}-${part("day")}`;
  const noon = new Date(`${date}T12:00:00Z`);
  const times = getTimes(noon, LOCATION.latitude, LOCATION.longitude);
  return { date, sunrise: times.sunrise!.getTime(), sunset: times.sunset!.getTime() };
}

export function resolveTheme(mode: ThemeMode, now = new Date()): Theme {
  if (mode !== "auto") return mode;
  const times = getLatviaSunTimes(now);
  return now.getTime() >= times.sunrise && now.getTime() < times.sunset ? "light" : "dark";
}

export function parseThemeMode(value: string | null): ThemeMode {
  return value === "light" || value === "dark" ? value : "auto";
}

export function themeBootstrap(now = new Date()) {
  const { sunrise, sunset } = getLatviaSunTimes(now);
  return `(()=>{var m='auto';try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s==='light'||s==='dark')m=s}catch(e){}var n=Date.now(),t=m==='auto'?(n>=${sunrise}&&n<${sunset}?'light':'dark'):m;document.documentElement.dataset.theme=t;document.documentElement.dataset.themeMode=m;document.documentElement.style.colorScheme=t})()`;
}
