import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes";

// Middleware principale
export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  console.log("🔍 Middleware attivato per:", nextUrl.pathname);

  // ✅ Escludi completamente il webhook Stripe
  if (nextUrl.pathname.includes("/api/stripe/webhook")) {
    console.log("✅ Webhook Stripe escluso dal middleware!");
    return NextResponse.next();
  }

  console.log("🚨 Middleware in azione su:", nextUrl.pathname);

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Gestione delle rotte API di autenticazione
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Gestione delle rotte di autenticazione
  if (isAuthRoute) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // Controllo se l'utente è autenticato
  const isLoggedIn = !!req.cookies.get("authToken");

  // Se la rotta è privata e l'utente non è loggato, reindirizzalo al login
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    const loginUrl = `/auth/login?callbackUrl=${encodedCallbackUrl}`;

    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  return NextResponse.next();
}

// ✅ Configurazione del matcher per escludere `/api/stripe/webhook`
export const config = {
  matcher: [
    "/((?!api/stripe/webhook$).*)", // Esclude esattamente /api/stripe/webhook
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
