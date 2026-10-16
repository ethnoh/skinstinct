export function siteUrl() {
  return (
    process.env.SITE_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "http://localhost:3000")
  ).replace(/\/$/, "");
}
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
