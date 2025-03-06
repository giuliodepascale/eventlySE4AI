// app/ip/page.tsx
import { headers } from 'next/headers';

type GeoData = {
  query: string;
  country: string;
  regionName: string;
  city: string;
  lat: number;
  lon: number;
  // Puoi aggiungere altri campi se ti servono
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

  // Se sei in locale, l'IP risulterà come "::1" o "127.0.0.1"
  if (ip === '::1' || ip === '127.0.0.1' || !ip) {
    // Usa un fallback per scopi di sviluppo
    ip = '8.8.8.8'; // l'IP di Google DNS
  }

  // Recupera i dati di geolocalizzazione, inclusi latitudine e longitudine
  const geoData = await getGeoData(ip);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Geolocalizzazione basata su IP</h1>
      <p><strong>IP rilevato:</strong> {geoData.query}</p>
      <p><strong>Nazione:</strong> {geoData.country}</p>
      <p><strong>Regione:</strong> {geoData.regionName}</p>
      <p><strong>Città:</strong> {geoData.city}</p>
      <p><strong>Latitudine:</strong> {geoData.lat}</p>
      <p><strong>Longitudine:</strong> {geoData.lon}</p>
    </div>
  );
}
