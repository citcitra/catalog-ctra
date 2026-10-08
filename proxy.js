import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!supabaseUrl || !supabasePublishableKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export { proxy as middleware };
export default proxy;

