import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_COOKIE_NAME, isDemoModeEnabled } from "@/lib/demo-mode-gates";

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

function standaloneMiddleware(request: NextRequest): NextResponse {
  const path = request.nextUrl.pathname;

  const isPublicEvent = /^\/[^/]+\/e\/[^/]+$/.test(path);
  if (
    path === "/" ||
    path.startsWith("/demo") ||
    path.startsWith("/api/demo") ||
    path.startsWith("/api/public") ||
    path.startsWith("/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    isPublicEvent ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  if (request.cookies.get(DEMO_COOKIE_NAME)?.value) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/demo";
  url.search = "";
  return NextResponse.redirect(url);
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;
  await auth.protect();
});

export default function middleware(
  request: NextRequest,
  event: Parameters<typeof clerkHandler>[1],
): ReturnType<typeof clerkHandler> {
  if (isDemoModeEnabled()) {
    return standaloneMiddleware(request);
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
