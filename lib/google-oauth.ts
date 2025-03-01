// File: /lib/google-oauth.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function exchangeGoogleCodeForTokens(code: string, redirectUri: string): Promise<any> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', clientId || '');
    params.append('client_secret', clientSecret || '');
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');
  
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Errore nello scambio del code: ${errorText}`);
    }
  
    // La risposta contiene access_token, id_token, refresh_token, expires_in, token_type, ecc.
    return await response.json();
  }
  