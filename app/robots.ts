import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
export const dynamic="force-dynamic";
export default function robots():MetadataRoute.Robots {return {rules:[{userAgent:"*",allow:"/",disallow:["/admin","/account","/ru/account","/api/"]},{userAgent:["GPTBot","OAI-SearchBot","ChatGPT-User","ClaudeBot","PerplexityBot","Google-Extended"],allow:"/",disallow:["/admin","/account","/ru/account","/api/"]}],sitemap:`${siteUrl()}/sitemap.xml`,host:siteUrl()};}
