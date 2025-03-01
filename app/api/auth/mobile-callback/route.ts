import { createAuthCode } from '@/lib/auth-code';
import { findOrCreateUser } from '@/lib/db';
import { exchangeGoogleCodeForTokens } from '@/lib/google-oauth';
import { NextResponse } from 'next/server';

// Esempio di funzioni di libreria interne (da implementare secondo la tua logica)

export async function POST(request: Request) {
  try {
    const { code, redirectUri } = await request.json();

    // 1. Scambia "code" con i token di Google
    const googleTokens = await exchangeGoogleCodeForTokens(code, redirectUri);
    if (!googleTokens) {
      return NextResponse.json({ error: 'Impossibile ottenere token da Google' }, { status: 400 });
    }

    // 2. Trova o crea l’utente in base ai dati di Google
    const user = await findOrCreateUser(googleTokens);

    // 3. Genera un authCode monouso (o un JWT) da usare nella WebView
    //    Per semplicità, supponiamo una funzione che genera un codice
    const authCode = await createAuthCode(user.id);

    // 4. Restituisci l’authCode al mobile
    return NextResponse.json({ token: authCode });
  } catch (error) {
    console.error('Errore mobileCallback:', error);
    return NextResponse.json({ error: 'Errore durante l’autenticazione' }, { status: 400 });
  }
}
