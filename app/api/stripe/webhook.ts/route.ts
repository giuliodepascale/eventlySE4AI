"use server"

import { updateOrganizationTicketingStatus } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


// Inizializza Stripe con la versione API corretta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  console.log("🔵 Webhook ricevuto!");

  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error("❌ Errore: Firma Stripe mancante!");
    return new NextResponse("Firma di Stripe mancante", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Ottieni il corpo raw della richiesta
    const rawBody = await req.text();
    console.log("📝 Corpo ricevuto: ", rawBody);

    // Verifica il webhook con la firma segreta
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    console.error("❌ Webhook Error:");
    return new NextResponse(`Webhook Error: `, { status: 400 });
  }

  console.log(`✅ Evento ricevuto da Stripe: ${event.type}`);

  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;

    console.log(`🔄 Account aggiornato: ${account.id}`);
    console.log(`✅ Charges Enabled: ${account.charges_enabled}`);
    console.log(`✅ Payouts Enabled: ${account.payouts_enabled}`);
    console.log(`✅ Details Submitted: ${account.details_submitted}`);
    console.log(`✅ Disabled Reason: ${account.requirements?.disabled_reason}`);

    let newStatus = "pending"; // Stato predefinito

    if (account.charges_enabled && account.payouts_enabled && account.details_submitted) {
      newStatus = "active"; // L'account è completamente verificato
    } else if (!account.details_submitted) {
      newStatus = "pending"; // L'utente non ha inviato tutti i dati
    } else if (account.requirements?.disabled_reason) {
      newStatus = "restricted"; // Stripe ha disabilitato il conto per qualche problema
    } else {
      newStatus = "pending_review"; // Lo stato è in revisione
    }

    console.log(`🔵 Nuovo stato determinato: ${newStatus}`);
    await updateOrganizationTicketingStatus(account.id, newStatus);
  }

  console.log("✅ Webhook gestito con successo!");
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
