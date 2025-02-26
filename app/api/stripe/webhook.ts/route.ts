// app/api/stripe/webhook/route.ts
import { updateOrganizationTicketingStatus } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Inizializza l'istanza di Stripe con la chiave segreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Firma di Stripe mancante' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Ottieni il corpo raw della richiesta come testo
    const rawBody = await req.text();

    // Verifica e costruisci l'evento utilizzando la firma e il corpo raw
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Errore nella costruzione dell\'evento webhook di Stripe:', err);
    return NextResponse.json({ error: 'Errore nella costruzione dell\'evento webhook' }, { status: 400 });
  }

  // Gestisci l'evento specifico
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;

    // Verifica se l'account è completamente verificato
    if (account.charges_enabled && account.payouts_enabled) {
      // Chiama la funzione per aggiornare lo stato del ticketing dell'organizzazione
      await updateOrganizationTicketingStatus(account.id);
    }
  }

  // Rispondi a Stripe per confermare la ricezione dell'evento
  return NextResponse.json({ received: true });
}
