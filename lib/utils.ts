import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/transform.ts
import { WithId, Document, ObjectId } from "mongodb";
import { SafeEvent, SafeOrganization, SafePrenotazione } from "@/app/types"; // percorso corretto alla tua definizione
import { manualStatus } from "@prisma/client";

/**
 * Trasforma un documento Mongo di tipo WithId<Document> in un oggetto SafeEvent.
 */
export function transformMongoDocToSafeEvent(doc: WithId<Document>): SafeEvent {
  return {
    id: doc._id.toString(),
    title: String(doc.title),
    description: String(doc.description),
    imageSrc: doc.imageSrc != null ? String(doc.imageSrc) : null,
    createdAt: (doc.createdAt as Date).toISOString(),
    category: String(doc.category),
    comune: String(doc.comune),
    provincia: String(doc.provincia),
    regione: String(doc.regione),
    latitudine: String(doc.latitudine),
    longitudine: String(doc.longitudine),
    favoriteCount: typeof doc.favoriteCount === "number" ? doc.favoriteCount : 0,
    eventDate: (doc.eventDate as Date).toISOString(),
    indirizzo: String(doc.indirizzo),
    organizationId: (doc.organizationId as ObjectId).toString(),
    status: doc.status as manualStatus,
    seoUrl: String(doc.seoUrl),
    isReservationActive: Boolean(doc.isReservationActive),
  };
}

/**
 * Trasforma un array di documenti Mongo (WithId<Document>[]) in un array di SafeEvent[].
 */
export function transformMongoEvents(
  docs: WithId<Document>[]
): SafeEvent[] {
  return docs.map(transformMongoDocToSafeEvent);
}


// utils/date.ts
export function buildDateFilter(dateFilter = "") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayOfWeek = today.getDay(); // 0 = domenica, 6 = sabato
  const friday = new Date(today);
  friday.setDate(
    today.getDate() + (dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek)
  );
  friday.setHours(0, 0, 0, 0);

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);
  sunday.setHours(23, 59, 59, 999);

  if (dateFilter === "today") {
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    return { eventDate: { $gte: today, $lte: endOfDay } };
  } else if (dateFilter === "tomorrow") {
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    return { eventDate: { $gte: tomorrow, $lte: endOfTomorrow } };
  } else if (dateFilter === "weekend") {
    return { eventDate: { $gte: friday, $lte: sunday } };
  }

  // Default: eventi a partire da 4 ore fa in poi
  return { eventDate: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } };
}


/**
 * Trasforma un documento MongoDB in un oggetto SafeOrganization plain.
 */
export function transformMongoDocToSafeOrganization(doc: WithId<Document>): SafeOrganization {
  return {
    id: doc._id.toString(),
    name: String(doc.name),
    email: String(doc.email),
    regione: doc.regione != null ? String(doc.regione) : null,
    description: String(doc.description),
    indirizzo: doc.indirizzo != null ? String(doc.indirizzo) : null,
    comune: doc.comune != null ? String(doc.comune) : null,
    provincia: doc.provincia != null ? String(doc.provincia) : null,
    phone: doc.phone != null ? String(doc.phone) : null,
    linkEsterno: doc.linkEsterno != null ? String(doc.linkEsterno) : null,
    imageSrc: doc.imageSrc != null ? String(doc.imageSrc) : null,
    seoUrl: doc.seoUrl != null ? String(doc.seoUrl) : null,
    latitudine: doc.latitudine != null ? String(doc.latitudine) : null,
    longitudine: doc.longitudine != null ? String(doc.longitudine) : null,
    stripeAccountId: doc.stripeAccountId != null ? String(doc.stripeAccountId) : null,
    ticketingStatus: String(doc.ticketingStatus),
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}

/**
 * Trasforma un array di documenti MongoDB in un array di SafeOrganization.
 */
export function transformMongoOrganizations(
  docs: WithId<Document>[]
): SafeOrganization[] {
  return docs.map(transformMongoDocToSafeOrganization);
}


export function transformMongoDocToSafePrenotazione(doc: WithId<Document>): SafePrenotazione {
  return {
    id: doc._id.toString(),
    eventId: (doc.eventId as ObjectId).toString(),
    userId: (doc.userId as ObjectId).toString(),
    reservedAt: (doc.reservedAt as Date).toISOString(),
    qrCode: String(doc.qrCode),
  };
}

export function transformMongoPrenotazioni(docs: WithId<Document>[]): SafePrenotazione[] {
  return docs.map(transformMongoDocToSafePrenotazione);
}