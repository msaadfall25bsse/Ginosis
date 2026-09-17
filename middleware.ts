import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "gnosis_admin_session";
const secretKey = process.env.AUTH_SECRET || "gnosis-default-development-secret-key-32-chars-minimum!";
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Next.js Edge Middleware for Route Protection.
 * Runs before all /admin/* route requests.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Check if session token is valid and not expired
  let isAuthenticated = false;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });
      if (payload && payload.role === "ADMIN") {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  const isLoginPage = pathname === "/admin/login";

  // 1. If accessing /admin/login while already authenticated, redirect to /admin
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 2. If accessing any /admin route (except login) without active authentication, redirect to /admin/login
  if (!isLoginPage && !isAuthenticated) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Limit middleware execution strictly to /admin and its subroutes
 */
export const config = {
  matcher: ["/admin/:path*"],
};
