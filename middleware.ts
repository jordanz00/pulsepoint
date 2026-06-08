import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_COOKIE_NAME, isDemoModeEnabled } from "@/lib/demo-mode-gates";
import {
  ENTRA_SESSION_COOKIE,
  verifyEntraSessionEdge,
} from "@/lib/entra-edge-session";
import { isEntraPilotMiddlewareEnv } from "@/lib/integration-profile-gates";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/demo",
  "/compare-protech",
  "/whats-new",
  "/api/demo/(.*)",
  "/api/auth/entra/(.*)",
  "/api/webhooks(.*)",
  "/api/public/register",
  "/:orgSlug/e/:eventSlug",
  "/:orgSlug/advocacy/:campaignId",
  "/:orgSlug/advocacy/issues/:issueSlug",
]);

function isPublicPath(path: string): boolean {
  const isPublicEvent = /^\/[^/]+\/e\/[^/]+$/.test(path);
  const isPublicGive =
    /^\/[^/]+\/give$/.test(path) || /^\/[^/]+\/give\/[^/]+$/.test(path);
  const isPublicAdvocacyCampaign = /^\/[^/]+\/advocacy\/[^/]+$/.test(path);
  const isPublicAdvocacyIssue = /^\/[^/]+\/advocacy\/issues\/[^/]+$/.test(path);
  return (
    path === "/" ||
    path === "/compare-protech" ||
    path === "/whats-new" ||
    path.startsWith("/demo") ||
    path.startsWith("/api/demo") ||
    path.startsWith("/api/auth/entra") ||
    path === "/api/health" ||
    path.startsWith("/api/public") ||
    path.startsWith("/api/webhooks") ||
    path.startsWith("/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    isPublicEvent ||
    isPublicGive ||
    isPublicAdvocacyCampaign ||
    isPublicAdvocacyIssue ||
    path.startsWith("/_next") ||
    path.includes(".")
  );
}

function standaloneMiddleware(request: NextRequest): NextResponse {
  const path = request.nextUrl.pathname;

  if (isPublicPath(path)) {
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

async function entraPilotMiddleware(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;

  if (isPublicPath(path)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ENTRA_SESSION_COOKIE)?.value;
  const valid = await verifyEntraSessionEdge(
    cookie,
    process.env.ENTRA_SESSION_SECRET,
  );
  if (valid) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/sign-in";
  url.searchParams.set("returnTo", path);
  return NextResponse.redirect(url);
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;
  await auth.protect();
});

export default async function middleware(
  request: NextRequest,
  event: Parameters<typeof clerkHandler>[1],
): Promise<ReturnType<typeof clerkHandler>> {
  if (isDemoModeEnabled()) {
    return standaloneMiddleware(request);
  }
  if (isEntraPilotMiddlewareEnv()) {
    return entraPilotMiddleware(request);
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
