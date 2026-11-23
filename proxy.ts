import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { parseSetCookie } from "cookie";
import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

const matchesRoute = (pathname: string, routes: string[]) =>
  routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

const refreshSession = async (): Promise<boolean> => {
  try {
    const response = await checkSession();
    const setCookie = response.headers["set-cookie"];

    if (!response.data.success || !setCookie) return false;

    const cookieStore = await cookies();

    for (const cookieStr of setCookie) {
      const parsed = parseSetCookie(cookieStr);

      if (parsed.value) {
        cookieStore.set(parsed.name, parsed.value, parsed);
      }
    }

    return true;
  } catch {
    return false;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const isAuthenticated =
    Boolean(accessToken) || (Boolean(refreshToken) && (await refreshSession()));

  if (!isAuthenticated && matchesRoute(pathname, privateRoutes)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthenticated && matchesRoute(pathname, publicRoutes)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Pass refreshed tokens to server components within this same request.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Cookie", cookieStore.toString());

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
