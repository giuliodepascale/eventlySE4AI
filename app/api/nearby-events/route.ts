// app/api/nearby-events/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // raggio della Terra in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Recupera le coordinate: se mancano, rispondiamo con un errore
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");
  if (!lat || !lng) {
    return NextResponse.json({ error: "Coordinate mancanti" }, { status: 400 });
  }
  
  // Altri parametri: query, category, page, limit
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "6");

  // Costruzione dei filtri dinamici per Prisma (simile a getAllEvents)
  const filterConditions = {
    AND: [
      ...(category ? [{ category }] : []),
      ...(query ? [{ title: { contains: query, mode: "insensitive" as const } }] : []),
      { eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } },
    ],
  };

  // Recupera tutti gli eventi "attivi" che rispettano i filtri
  const events = await db.event.findMany({
    where: filterConditions,
    // NOTA: non applichiamo il take/skip qui, perché il filtraggio per distanza avviene dopo
  });

  // Calcola la distanza per ogni evento
  const eventsWithDistance = events.map((event) => {
    const eventLat = parseFloat(event.latitudine);
    const eventLng = parseFloat(event.longitudine);
    const distance = haversineDistance(lat, lng, eventLat, eventLng);
    return { ...event, distance };
  });

  // Filtra per un raggio (ad es. 50 km)
  const radius = 50; // km
  const filteredEvents = eventsWithDistance.filter((e) => e.distance <= radius);

  // Ordina gli eventi per distanza (dal più vicino al più lontano)
  filteredEvents.sort((a, b) => a.distance - b.distance);

  // Applica la paginazione in base al risultato finale
  const totalEvents = filteredEvents.length;
  const offset = (page - 1) * limit;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  // Converte le date in stringhe ISO per il client
  const finalEvents = paginatedEvents.map((event) => ({
    ...event,
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));

  return NextResponse.json({
    events: finalEvents,
    pagination: {
      total: totalEvents,
      page,
      limit,
      totalPages: Math.ceil(totalEvents / limit),
    },
  });
}
