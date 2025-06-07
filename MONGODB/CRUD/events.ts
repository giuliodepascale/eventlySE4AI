/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

/**
 * FILE: CRUD/events.ts
 * Descrizione: Tutte le operazioni CRUD per la collection “events” in MongoDB,
 * più le query di lettura avanzate (filtri, paginazione, eventi correlati).
 * Ogni funzione gira lato server e restituisce dati già trasformati in oggetti “plain”
 * (SafeEvent) o redirige al client in caso di create/update.
 */

/** ––––––––––––––––––––––––––––––––––––––––––
 * IMPORTS
 * –––––––––––––––––––––––––––––––––––––––––– */
import { z } from "zod";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import clientPromise from "@/lib/mongoDB";
import { getCoordinatesFromOSM } from "@/lib/map";
import { CreateEventSchema } from "@/schemas";
import {
  transformMongoDocToSafeEvent,
  transformMongoEvents,
} from "@/lib/utils";
import { buildDateFilter } from "@/lib/utils";
import type { SafeEvent } from "@/app/types";

/** ***************************************************************************
 * SEZIONE 1: CREATE (C)
 * ****************************************************************************/

/**
 * createEvent
 * Valida i campi con CreateEventSchema, ottiene lat/long da OSM, mappa i valori
 * (status e imageSrc), e inserisce il documento in Mongo. Infine effettua redirect
 * alla pagina dell’evento appena creato.
 */
export async function createEvent(
  values: z.infer<typeof CreateEventSchema>
): Promise<{ error?: string }> {
  // 1. Validazione con Zod
  const validated = await CreateEventSchema.safeParseAsync(values);
  if (!validated.success) return { error: "Campi non validi" };

  const {
    title,
    description,
    imageSrc,
    category,
    organizationId,
    eventDate,
    indirizzo,
    comune,
    provincia,
    regione,
    status,
    isReservationActive,
  } = validated.data;

  // 2. Ottieni coordinate da OSM
  const coords = await getCoordinatesFromOSM(indirizzo, comune);
  if (!coords.latitude || !coords.longitude)
    return { error: "Indirizzo non valido" };

  // 3. Mappatura campi
  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;
  const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";

  // 4. Prepara l’oggetto evento
  const eventDoc = {
    title,
    description,
    imageSrc: finalImageSrc,
    category,
    organizationId: new ObjectId(organizationId),
    eventDate: new Date(eventDate),
    indirizzo,
    comune,
    provincia,
    regione,
    latitudine: coords.latitude.toString(),
    longitudine: coords.longitude.toString(),
    isReservationActive,
    status: mappedStatus,
    createdAt: new Date(),
  };

  // 5. Inserisci in MongoDB
  const client = await clientPromise;
  const db = client.db("evently");
  const result = await db.collection("events").insertOne(eventDoc);

  // 6. Redirect alla pagina dell’evento creato
  redirect(`/events/${result.insertedId.toString()}`);
  return {};
}

/** ***************************************************************************
 * SEZIONE 2: READ (R)
 * ****************************************************************************/

/**
 * getEventById
 * Restituisce un singolo evento (SafeEvent) o null se non esiste.
 */
export async function getEventById(id: string): Promise<SafeEvent | null> {
  const client = await clientPromise;
  const db = client.db("evently");

  const rawDoc = await db
    .collection("events")
    .findOne({ _id: ObjectId.createFromHexString(id) });
  if (!rawDoc) return null;

  return transformMongoDocToSafeEvent(rawDoc);
}

/**
 * getEvents
 * Restituisce tutti gli eventi (array di SafeEvent).
 */
export async function getEvents(): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db("evently");

  const rawDocs = await db.collection("events").find().toArray();
  return transformMongoEvents(rawDocs);
}

/**
 * getEventsByOrganization
 * Recupera gli eventi associati a una specifica organizationId, con paginazione.
 * Filtra solo gli eventi futuri (ultime 4 ore).
 */
export async function getEventsByOrganization(
  organizationId: string,
  limit = 6,
  page = 1
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db("evently");
  const offset = (page - 1) * limit;

  const where = {
    organizationId: ObjectId.createFromHexString(organizationId),
    eventDate: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  };

  const rawEvents = await db
    .collection("events")
    .find(where)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(where);
  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * getAllEvents
 * Recupera tutti gli eventi o filtra per query, categoria, data. Restituisce paginazione.
 */
export async function getAllEvents(
  query = "",
  limit = 6,
  page = 1,
  category = "",
  dateFilter = ""
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db("evently");
  const offset = (page - 1) * limit;
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawEvents = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(filters);
  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * getAllActiveEvents
 * Come getAllEvents, ma filtra solo gli eventi con status = "ACTIVE".
 */
export async function getAllActiveEvents(
  query = "",
  limit = 25,
  page = 1,
  category = "",
  dateFilter = ""
): Promise<{ events: SafeEvent[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const client = await clientPromise;
  const db = client.db("evently");
  const offset = (page - 1) * limit;
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { status: "ACTIVE", ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawEvents = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .skip(offset)
    .limit(limit)
    .toArray();

  const total = await db.collection("events").countDocuments(filters);
  const events = transformMongoEvents(rawEvents);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
/**
 * getAllActiveEventsNoLimits
 * Come getAllActiveEvents ma con limite di 50 risultati.
 */
export async function getAllActiveEventsNoLimits(
  query = "",
  category = "",
  dateFilter = ""
): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db("evently");
  const dateFilterCondition = buildDateFilter(dateFilter);

  const filters: any = { status: "ACTIVE", ...dateFilterCondition };
  if (query) filters.title = { $regex: query, $options: "i" };
  if (category) filters.category = category;

  const rawDocs = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .limit(50)
    .toArray();

  return transformMongoEvents(rawDocs);
}
/**
 * getRelatedEventsByCategory
 * Recupera eventi con la stessa categoria, escludendo un eventId specifico.
 */
export async function getRelatedEventsByCategory(
  category: string,
  limit = 5,
  excludeEventId: string | null = null
): Promise<SafeEvent[]> {
  const client = await clientPromise;
  const db = client.db("evently");

  const filters: any = {
    category,
    status: "ACTIVE",
    eventDate: { $gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
  };
  if (excludeEventId) {
    filters._id = { $ne: ObjectId.createFromHexString(excludeEventId) };
  }

  const rawDocs = await db
    .collection("events")
    .find(filters)
    .sort({ eventDate: 1 })
    .limit(limit)
    .toArray();

  return transformMongoEvents(rawDocs);
}

/** ***************************************************************************
 * SEZIONE 3: UPDATE (U)
 * ****************************************************************************/

/**
 * updateEvent
 * Valida i campi, ottiene nuove coordinate da OSM, mappa i campi e aggiorna
 * il documento esistente. Se successo, redirige sulla pagina evento.
 */
export async function updateEvent(
  eventId: string,
  values: z.infer<typeof CreateEventSchema>
): Promise<{ error?: string }> {
  // 1. Validazione
  const validated = await CreateEventSchema.safeParseAsync(values);
  if (!validated.success) return { error: "Campi non validi" };

  const {
    title,
    description,
    imageSrc,
    category,
    organizationId,
    eventDate,
    indirizzo,
    comune,
    provincia,
    regione,
    status,
    isReservationActive,
  } = validated.data;

  // 2. Coordinate da OSM
  const coords = await getCoordinatesFromOSM(indirizzo, comune);
  if (!coords.latitude || !coords.longitude)
    return { error: "Indirizzo non valido" };

  // 3. Mappatura campi
  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;
  const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";

  // 4. Aggiornamento in MongoDB
  const client = await clientPromise;
  const db = client.db("evently");

  const result = await db.collection("events").updateOne(
    { _id: ObjectId.createFromHexString(eventId) },
    {
      $set: {
        title,
        description,
        imageSrc: finalImageSrc,
        category,
        organizationId: new ObjectId(organizationId),
        eventDate: new Date(eventDate),
        indirizzo,
        comune,
        provincia,
        regione,
        latitudine: coords.latitude.toString(),
        longitudine: coords.longitude.toString(),
        isReservationActive,
        status: mappedStatus,
      },
    }
  );

  // 5. Controllo esistenza evento
  if (result.matchedCount === 0) return { error: "Evento non trovato" };

  // 6. Redirect
  redirect(`/events/${eventId}`);
  return {};
}

/** ***************************************************************************
 * SEZIONE 4: DELETE (D)
 * ****************************************************************************/

/**
 * deleteEvent
 * Elimina un documento “events” per _id. Ritorna messaggio di errore se non trovato.
 */
export async function deleteEvent(
  eventId: string
): Promise<{ success?: string; error?: string }> {
  const client = await clientPromise;
  const db = client.db("evently");

  const result = await db
    .collection("events")
    .deleteOne({ _id: ObjectId.createFromHexString(eventId) });

  if (result.deletedCount === 0) return { error: "Evento non trovato" };
  return { success: "Evento eliminato con successo" };
}
