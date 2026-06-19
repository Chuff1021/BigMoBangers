import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { AUTH_ENABLED } from "@/lib/mode";

// Operator tools require auth; the storefront stays public.
const isDashboardProtected = createRouteMatcher(["/dashboard(.*)"]);
const isAdminTool = createRouteMatcher(["/dashboard(.*)", "/staff(.*)"]);
const isProtectedApi = createRouteMatcher([
  "/api/customers(.*)",
  "/api/inventory(.*)",
  "/api/orders(.*)",
  "/api/pos(.*)",
  "/api/staff(.*)",
  "/api/upload(.*)",
]);

function isProtectedProductMutation(req: NextRequest) {
  const url = new URL(req.url);
  return url.pathname.startsWith("/api/products") && req.method !== "GET";
}

function hasAdminPassword(req: Request) {
  const password = process.env.BANGERS_ADMIN_PASSWORD;
  if (!password) return false;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(header.slice("Basic ".length));
    const [, candidate] = decoded.split(":");
    return candidate === password;
  } catch {
    return false;
  }
}

function basicAuthResponse() {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Big MO Staff"',
      "Cache-Control": "no-store",
    },
  });
}

function requiresBasicAuth(req: NextRequest) {
  return (
    isAdminTool(req) || isProtectedApi(req) || isProtectedProductMutation(req)
  );
}

const realMiddleware = clerkMiddleware(async (auth, req) => {
  if (requiresBasicAuth(req) && !hasAdminPassword(req)) {
    return basicAuthResponse();
  }
  if (isDashboardProtected(req)) await auth.protect();
});

function adminPasswordMiddleware(req: NextRequest) {
  if (requiresBasicAuth(req) && !hasAdminPassword(req)) {
    return basicAuthResponse();
  }
  return undefined;
}

export default AUTH_ENABLED ? realMiddleware : adminPasswordMiddleware;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
