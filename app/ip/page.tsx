// app/ip/page.tsx
import { headers } from 'next/headers';

type GeoData = {
  query: string;
  country: string;
  regionName: string;
  city: string;
  // Altri campi se necessari
};

async function getGeoData(ip: string): Promise<GeoData> {
  const res = await fetch(`http://ip-api.com/json/${ip}`);
  if (!res.ok) throw new Error('Errore nella richiesta di geolocalizzazione');
  return res.json();
}

export default async function Page() {
  // Aspetta che gli header siano disponibili
  const reqHeaders = await headers();

  // Estrai l'IP dall'header 'x-forwarded-for'
  let ip = reqHeaders.get('x-forwarded-for') || '';

  // Se l'IP è una lista separata da virgole, prendi il primo
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Controlla se l'IP è un loopback (localhost)
  if (ip === '::1' || ip === '127.0.0.1' || !ip) {
    // Usa un fallback solo per scopi di sviluppo
    ip = '8.8.8.8'; // Ad esempio, l'IP di Google DNS
  }

  // Recupera i dati di geolocalizzazione
  const geoData = await getGeoData(ip);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Geolocalizzazione basata su IP</h1>
      <p><strong>IP rilevato:</strong> {geoData.query}</p>
      <p><strong>Nazione:</strong> {geoData.country}</p>
      <p><strong>Regione:</strong> {geoData.regionName}</p>
      <p><strong>Città:</strong> {geoData.city}</p>
    </div>
  );
}
