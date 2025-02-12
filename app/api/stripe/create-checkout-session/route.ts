import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { eventId, userId } = await req.json();

console.log("🔍 SITE URL:", process.env.NEXT_PUBLIC_SITE_URL);
console.log("🔍 EVENT ID:", eventId);
console.log("🔍 USER ID:", userId);



    if (!eventId || !userId) {
      return NextResponse.json({ error: "Manca eventId o userId" }, { status: 400 });
    }

    // Recuperiamo i dettagli dell'evento
    const event = await db.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    });
    
console.log("🔍 EVENT PRICE:", event?.price);
console.log("🔍 ORGANIZATION STRIPE ID:", event?.organization?.stripeAccountId);

    if (!event || !event.organization || !event.organization.stripeAccountId || !event.price) {
      return NextResponse.json({ error: "Evento o organizzazione non trovata." }, { status: 404 });
    }

    // Controllo che NEXT_PUBLIC_SITE_URL sia definito
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("❌ ERRORE: NEXT_PUBLIC_SITE_URL non è definito.");
      return NextResponse.json({ error: "Errore di configurazione: NEXT_PUBLIC_SITE_URL mancante." }, { status: 500 });
    }

    // Prezzo in centesimi
    const price = event.price * 100;

    // Creiamo la sessione di pagamento su Stripe
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"], // Apple Pay e Google Pay sono inclusi automaticamente
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Biglietto per ${event.title}`,
              },
              unit_amount: price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${siteUrl}/checkout/success`,
        cancel_url: `${siteUrl}/checkout/cancel`,
        locale: "it", // ✅ Traduzione in italiano
        payment_intent_data: {
          application_fee_amount: Math.round(price * 0.1),
          transfer_data: {
            destination: event.organization.stripeAccountId,
          },
        },
      });
      

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Errore nella creazione della sessione di checkout:", error);
    return NextResponse.json({ error: "Errore nella creazione del checkout." }, { status: 500 });
  }
}

