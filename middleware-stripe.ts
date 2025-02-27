import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.startsWith("/api/stripe/webhook")) {
    console.log("✅ Middleware Stripe attivato. Nessuna autenticazione richiesta.");
    return NextResponse.next();
  }

  return NextResponse.next();
}

// 🔴 Questo middleware intercetta SOLO il webhook
export const config = {
  matcher: ["/api/stripe/webhook"],
};
