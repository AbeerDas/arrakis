import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 "Proxy" (formerly Middleware). Runs on the Node.js runtime.
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth session cookie on every matched request.
 *  2. Do an OPTIMISTIC redirect of signed-out users away from app routes.
 *
 * Per the Next.js guidance, proxy is NOT the authorization boundary — every
 * protected layout/page/route re-checks auth server-side (see src/lib/auth.ts).
 * This just improves UX and keeps tokens fresh.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/startups",
  "/tracker",
  "/settings",
  "/admin",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Before Supabase is provisioned, pass requests through untouched so the
  // scaffold still runs locally.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next internals and static assets, so auth cookies
     * refresh on real navigations but CSS/JS/images aren't intercepted.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
