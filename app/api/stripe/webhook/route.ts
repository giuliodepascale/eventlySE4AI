import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


export const config = { api: { bodyParser: false } };


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,);


export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('❌ Errore: Firma Stripe mancante!');
    return new NextResponse('Firma di Stripe mancante', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Ottieni il corpo raw della richiesta come ArrayBuffer
    const rawBody = await req.arrayBuffer();
    const buf = Buffer.from(rawBody);

    // Verifica il webhook con la firma segreta
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('❌ Errore nella verifica del webhook:', err);
    return new NextResponse(`Webhook Error:`, { status: 400 });
  }

 
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
    console.log('💰 Pagamento ricevuto!');
    console.log(`ID Pagamento: ${paymentIntent.id}`);
    console.log(`Importo: ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);
    console.log(`Stato: ${paymentIntent.status}`);
    console.log(`Metodo di pagamento: ${paymentIntent.payment_method}`);
    console.log(`Email del cliente: ${paymentIntent.receipt_email}`);
    console.log(`ID Cliente: ${paymentIntent.customer}`);
    console.log(`Metadati: ${JSON.stringify(paymentIntent.metadata)}`);

    if(paymentIntent.metadata.type ==="ticket"){
      console.log("azione biglietto")
    }
  }
  


  console.log('✅ Webhook gestito con successo!');
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
}
