// app/api/ip/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Recupera l'IP dalla richiesta: controlla "x-forwarded-for" e "x-real-ip"
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";
  
  // Se l'IP è una lista, prendi il primo (come accade spesso con i proxy)
  if (ip && ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  
  // Se l'IP è un loopback (localhost) oppure non è disponibile, usa un fallback
  if (ip === "::1" || ip === "127.0.0.1" || !ip) {
    ip = "8.8.8.8"; // fallback: l'IP di Google DNS
  }
  
  // Chiama l'API di ip-api per ottenere i dati di geolocalizzazione
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  
  if (!response.ok) {
    return NextResponse.json(
      { error: "Errore durante il recupero della geolocalizzazione" },
      { status: 500 }
    );
  }
  
  const geoData = await response.json();
  
  // Restituisci il JSON ottenuto (contiene lat, lon, country, city, ecc.)
  return NextResponse.json(geoData);
}
