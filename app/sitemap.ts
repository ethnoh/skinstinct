import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/db";
import { siteUrl } from "@/lib/seo";
export const dynamic="force-dynamic";
export default function sitemap():MetadataRoute.Sitemap {
  return ["","/articles","/privacy",...getArticles().filter(a=>a.published).map(a=>`/articles/${a.slug}`)].flatMap(p=>["","/ru"].map(prefix=>({url:`${siteUrl()}${prefix}${p}`,changeFrequency:"weekly" as const,priority:p===""?1:p.startsWith("/articles/")?.7:.5,alternates:{languages:{lv:`${siteUrl()}${p}`,ru:`${siteUrl()}/ru${p}`}}})));
}
