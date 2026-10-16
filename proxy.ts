import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-site-lang", /^\/ru(?:\/|$)/.test(request.nextUrl.pathname) ? "ru" : "lv");
  return NextResponse.next({ request: { headers: requestHeaders } });
}
export const config = { matcher: ["/((?!api|_next/static|_next/image|images|fonts|favicon|robots.txt|sitemap.xml|llms.txt).*)"] };
