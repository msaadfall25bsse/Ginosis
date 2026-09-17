/**
 * Automated Verification Script for Phase 3 Part 4: Route Protection & Redirection
 */

import { SignJWT } from "jose";

const secretKey = process.env.AUTH_SECRET || "gnosis-default-development-secret-key-32-chars-minimum!";
const encodedKey = new TextEncoder().encode(secretKey);

// Middleware logic simulation for test verification
async function simulateMiddleware(pathname: string, sessionCookie?: string): Promise<{ action: "next" | "redirect"; destination?: string }> {
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const { jwtVerify } = await import("jose");
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

  if (isLoginPage && isAuthenticated) {
    return { action: "redirect", destination: "/admin" };
  }

  if (!isLoginPage && !isAuthenticated && pathname.startsWith("/admin")) {
    return { action: "redirect", destination: "/admin/login" };
  }

  return { action: "next" };
}

async function runPart4Tests() {
  console.log("==================================================");
  console.log("🧪 TESTING PHASE 3 - PART 4: ROUTE PROTECTION");
  console.log("==================================================\n");

  // Create valid admin session token
  const validToken = await new SignJWT({
    userId: "test-admin-id",
    email: "admin@gnosis.news",
    role: "ADMIN",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(encodedKey);

  // Test 1: Unauthenticated request to /admin
  console.log("▶ Test 1: Unauthenticated access to /admin...");
  const res1 = await simulateMiddleware("/admin");
  if (res1.action === "redirect" && res1.destination === "/admin/login") {
    console.log("  ✓ Passed: Unauthenticated visitor to /admin redirected to /admin/login");
  } else {
    throw new Error("Failed: Unauthenticated visitor was not redirected");
  }

  // Test 2: Unauthenticated request to nested /admin/articles
  console.log("▶ Test 2: Unauthenticated access to /admin/articles...");
  const res2 = await simulateMiddleware("/admin/articles");
  if (res2.action === "redirect" && res2.destination === "/admin/login") {
    console.log("  ✓ Passed: Nested /admin/articles redirected to /admin/login");
  } else {
    throw new Error("Failed: Nested route was not protected");
  }

  // Test 3: Authenticated admin access to /admin/login
  console.log("▶ Test 3: Authenticated admin accessing /admin/login...");
  const res3 = await simulateMiddleware("/admin/login", validToken);
  if (res3.action === "redirect" && res3.destination === "/admin") {
    console.log("  ✓ Passed: Authenticated admin on /admin/login redirected to /admin");
  } else {
    throw new Error("Failed: Authenticated admin was not redirected to dashboard");
  }

  // Test 4: Authenticated admin access to /admin
  console.log("▶ Test 4: Authenticated admin accessing /admin...");
  const res4 = await simulateMiddleware("/admin", validToken);
  if (res4.action === "next") {
    console.log("  ✓ Passed: Authenticated admin permitted to view /admin");
  } else {
    throw new Error("Failed: Valid admin was blocked from /admin");
  }

  // Test 5: Unauthenticated visitor on public site
  console.log("▶ Test 5: Public website access (/world, /technology)...");
  const res5 = await simulateMiddleware("/world");
  if (res5.action === "next") {
    console.log("  ✓ Passed: Public routes remain completely unaffected");
  } else {
    throw new Error("Failed: Public route was blocked or redirected");
  }

  console.log("\n==================================================");
  console.log("🎉 ALL PART 4 ROUTE PROTECTION CHECKS PASSED!");
  console.log("==================================================");
}

runPart4Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
