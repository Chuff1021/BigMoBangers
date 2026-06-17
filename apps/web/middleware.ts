import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { AUTH_ENABLED } from "@/lib/mode";

// Only the operator dashboard requires auth; the storefront is always public.
const isProtected = createRouteMatcher(["/dashboard(.*)"]);

const realMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

// When Clerk isn't configured, run open (everything public) so the dashboard
// is reachable. Lock it down by adding Clerk keys.
function openMiddleware() {
  return undefined;
}

export default AUTH_ENABLED ? realMiddleware : openMiddleware;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
