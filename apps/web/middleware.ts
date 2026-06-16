import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { IS_DEMO } from "@/lib/mode";

// Only the operator dashboard requires auth; the storefront is public.
const isProtected = createRouteMatcher(["/dashboard(.*)"]);

const realMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

// In demo mode there is no auth at all — everything is public so the Vercel
// preview is fully viewable.
function demoMiddleware() {
  return undefined;
}

export default IS_DEMO ? demoMiddleware : realMiddleware;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
