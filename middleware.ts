import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/demo",
  "/api/demo/(.*)",
  "/api/webhooks(.*)",
  "/api/public/register",
  "/:orgSlug/e/:eventSlug",
]);

// Edge-safe demo-mode pass-through. The cookie is only loosely checked here
// (presence + env flags); cryptographic verification happens in lib/auth.ts
// during the actual server-side session check. A forged cookie can at most
// skip Clerk's middleware redirect — it cannot pass `requireStaffSession`.
function isDemoModeAllowed(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.DEMO_MODE !== "true") return false;
  const secret = process.env.DEMO_SESSION_SECRET ?? "";
  return secret.length >= 32;
}

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;
  if (isDemoModeAllowed() && request.cookies.get("pp_demo")?.value) return;
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
