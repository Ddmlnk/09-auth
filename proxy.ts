import { NextResponse, type NextRequest } from "next/server";
import { parseSetCookie } from "cookie";
import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

const matchesRoute = (pathname: string, routes: string[]) =>
  routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const refreshSession = async (): Promise<string[]> => {
  try {
    const response = await checkSession();
    return response.data.success ? (response.headers["set-cookie"] ?? []) : [];
  } catch {
    return [];
  }
};

const withCookies = (response: NextResponse, setCookies: string[]) => {
  setCookies.forEach((cookie) => response.headers.append("Set-Cookie", cookie));
  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const setCookies = !accessToken && refreshToken ? await refreshSession() : [];
  const isAuthenticated = Boolean(accessToken) || setCookies.length > 0;

  if (!isAuthenticated && matchesRoute(pathname, privateRoutes)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthenticated && matchesRoute(pathname, publicRoutes)) {
    return withCookies(
      NextResponse.redirect(new URL("/profile", request.url)),
      setCookies,
    );
  }

  // Pass refreshed tokens to server components within this same request.
  setCookies.forEach((cookie) => {
    const { name, value } = parseSetCookie(cookie);
    if (value) request.cookies.set(name, value);
  });

  return withCookies(
    NextResponse.next({ request: { headers: request.headers } }),
    setCookies,
  );
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
