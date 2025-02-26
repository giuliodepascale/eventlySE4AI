// /app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateOrganizationTicketingStatus } from "@/lib/stripe";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Firma di Stripe mancante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Errore nel webhook di Stripe:", err.message);
    return NextResponse.json({ error: `Errore nel webhook: ${err.message}` }, { status: 400 });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await updateOrganizationTicketingStatus(account.id);
  }

  return NextResponse.json({ received: true });
}
