import { type NextRequest, NextResponse } from "next/server";
import { parsePath } from "@/lib/routes";

/**
 * Paths that can never be a page (`/nope`, `/about/x`) get a real 404 status before rendering.
 * Pages stream, so a notFound() thrown while rendering can only send 200 + noindex; unknown
 * project slugs still go that way since checking them needs the content.
 */
export function proxy(request: NextRequest) {
  if (parsePath(request.nextUrl.pathname) !== undefined) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  // Pages only: skip Next internals, OG images, metadata files and anything with an extension.
  matcher: ["/((?!_next/|og(?:/|$)|sitemap\\.xml|robots\\.txt|.*\\.[A-Za-z0-9]+$).*)"],
};
