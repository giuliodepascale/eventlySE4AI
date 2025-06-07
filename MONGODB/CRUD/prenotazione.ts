/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

/**
 * FILE: CRUD/prenotazione.ts
 * Descrizione: Tutte le operazioni CRUD per la collection "prenotazione" in MongoDB,
 * più le query di lettura avanzate (filtri, paginazione, eventi correlati).
 * Ogni funzione gira lato server e restituisce dati già trasformati in oggetti “plain”
 */

/** ––––––––––––––––––––––––––––––––––––––––––
 * IMPORTS
 * –––––––––––––––––––––––––––––––––––––––––– */
import { z } from "zod";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/lib/mongoDB";

// eventuali schemi zod
import { CreatePrenotazioneSchema } from "@/schemas";

// helper trasformazione dati se serve
import {
  transformMongoDocToSafePrenotazione,
  transformMongoPrenotazioni,
} from "@/lib/utils";

// eventuali tipi TS personalizzati
import type { SafePrenotazione } from "@/app/types";

/** ***************************************************************************
 * SEZIONE 1: CREATE (C)
 * ****************************************************************************/

/**
 * createPrenotazione
 * Valida i campi con CreatePrenotazioneSchema,
 * e inserisce il documento in Mongo. Infine effettua redirect
 * alla pagina dell’evento appena prenotato.
 */

export async function createPrenotazione(
  values: z.infer<typeof CreatePrenotazioneSchema>
): Promise<{ error?: string }> {
  // 1. Validazione con Zod
  const validated = await CreatePrenotazioneSchema.safeParseAsync(values);
  if (!validated.success) return { error: "Dati non validi per la prenotazione" };

  const { 
    eventId, 
    userId,  
  } = validated.data;

  const bookingCode = uuidv4();

  // 2. Prepara l’oggetto prenotazione
  const prenotazioneDoc = {
    eventId: new ObjectId(eventId),
    userId: new ObjectId(userId),
    reservedAt: new Date(),
    qrCode: bookingCode,
  };

  // 3. Inserisci in MongoDB
  const client = await clientPromise;
  const db = client.db("evently");
  const result = await db.collection("prenotazioni").insertOne(prenotazioneDoc);

  // 4. Redirect alla pagina dell’evento prenotato
  redirect(`/events/${eventId}`);
}

/** ***************************************************************************
 * SEZIONE 2: READ (R)
 * ****************************************************************************/
/**
 * Restituisce una singola prenotazione (SafePrenotazione) o null se non esiste.
 */
export async function getPrenotazioneById(id: string): Promise<SafePrenotazione | null> {
  const client = await clientPromise;
  const db = client.db("evently");

  const rawDoc = await db
    .collection("prenotazioni")
    .findOne({ _id: ObjectId.createFromHexString(id) });
  if (!rawDoc) return null;

  return transformMongoDocToSafePrenotazione(rawDoc);
}

/** ***************************************************************************
 * SEZIONE 3: UPDATE (U)
 * ****************************************************************************/

/**
 * updatePrenotazione
 * Valida i campi e aggiorna  il documento esistente. 
 * Se successo, redirige sulla pagina evento.
 */
export async function updatePrenotazione(
  prenotazioneId: string,
  values: z.infer<typeof CreatePrenotazioneSchema>
): Promise<{ error?: string }> {
  // 1. Validazione (se vuoi)
  const validated = await CreatePrenotazioneSchema.safeParseAsync(values);
  if (!validated.success) return { error: "Campi non validi" };

  const { 
    eventId, 
    userId, 
  } = validated.data;

  const client = await clientPromise;
  const db = client.db("evently");

  // 2. Aggiorna la prenotazione
  const result = await db.collection("prenotazioni").updateOne(
    { _id: ObjectId.createFromHexString(prenotazioneId) },
    {
      $set: {
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId),
      },
    }
  );

  // 3. Controlla se la prenotazione esiste
  if (result.matchedCount === 0) return { error: "Prenotazione non trovata" };

  // 4. Redirect all’evento associato (quello aggiornato)
  redirect(`/events/${eventId}`);
}


/** ***************************************************************************
 * SEZIONE 4: DELETE (D)
 * ****************************************************************************/

/**
 * Elimina un documento "prenotazioni" per _id. Ritorna messaggio di errore se non trovato.
 */
export async function deletePrenotazione(
  prenotazioneId: string
): Promise<{ success?: string; error?: string }> {
  const client = await clientPromise;
  const db = client.db("evently");

  const result = await db
    .collection("prenotazioni")
    .deleteOne({ _id: ObjectId.createFromHexString(prenotazioneId) });

  if (result.deletedCount === 0) return { error: "Prenotazione non trovata" };
  return { success: "Prenotazione eliminata con successo" };
}

/**
 * getPrenotazioni
 * Restituisce tutte le prenotazioni (array di SafePrenotazione).
 */
export async function getPrenotazioni(): Promise<SafePrenotazione[]> {
  const client = await clientPromise;
  const db = client.db("evently");

  const rawDocs = await db.collection("prenotazioni").find().toArray();
  return transformMongoPrenotazioni(rawDocs);
}

