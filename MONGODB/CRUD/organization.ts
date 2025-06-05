"use server";

/**
 * FILE: CRUD/organizations.ts
 * Descrizione: Contiene tutte le operazioni CRUD per la collection “organizations” in MongoDB,
 * più le query di lettura per una singola organizzazione o per tutte le organizzazioni di un utente.
 * Ogni funzione gira lato server e restituisce dati già trasformati in oggetti “plain”
 * (SafeOrganization) o restituisce un errore al chiamante.
 */

/** ––––––––––––––––––––––––––––––––––––––––––
 * IMPORTS
 * –––––––––––––––––––––––––––––––––––––––––– */
import { z } from "zod";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongoDB";
import { getCoordinatesFromOSM } from "@/lib/map";
import { getUserById } from "@/data/user";
import { organizationSchema } from "@/schemas";
import {
  transformMongoDocToSafeOrganization,
  transformMongoOrganizations,
} from "@/lib/utils";
import type { SafeOrganization } from "@/app/types";

/** ***************************************************************************
 * SEZIONE 1: CREATE (C)
 * ****************************************************************************/

/**
 * createOrganization(values, userId)
 * 1. Valida i campi grazie a organizationSchema (Zod).
 * 2. Verifica che l’utente sia un ORGANIZER/ADMIN estraendolo da DB.
 * 3. Calcola latitudine e longitudine da OSM, se presente indirizzo+comune.
 * 4. Inserisce il nuovo documento nella collection “organizations” con organizerIds=[userId].
 * 5. Restituisce { success, id } oppure { error }.
 */
export async function createOrganization(
  values: z.infer<typeof organizationSchema>,
  userId: string
): Promise<{ success?: string; id?: string; error?: string }> {
  // 1. Validazione campi
  const validated = organizationSchema.safeParse(values);
  if (!validated.success) return { error: "Campi non validi." };

  const {
    name,
    description,
    indirizzo,
    phone,
    email,
    linkEsterno,
    imageSrc,
    comune,
    provincia,
    regione,
    seoUrl,
  } = validated.data;

  // 2. Verifica ruolo utente
  const user = await getUserById(userId);
  if (!user || user.role === "USER")
    return { error: "Assicurati di essere un organizzatore." };

  // 3. Gestione campi facoltativi
  const finalImageSrc =
    imageSrc?.trim() === "" ? "/images/NERO500.jpg" : imageSrc;
  const finalSeoUrl = seoUrl || "";

  // 4. Calcolo coordinate (se indirizzo+comune fornite)
  let latitudine: string | null = null;
  let longitudine: string | null = null;
  if (indirizzo && comune) {
    const coords = await getCoordinatesFromOSM(indirizzo, comune);
    latitudine = coords.latitude?.toString() ?? null;
    longitudine = coords.longitude?.toString() ?? null;
  }

  // 5. Inserimento in MongoDB
  try {
    const client = await clientPromise;
    const db = client.db("evently");

    const organizationRes = await db.collection("organizations").insertOne({
      name,
      description,
      indirizzo,
      phone,
      email,
      linkEsterno,
      imageSrc: finalImageSrc,
      comune,
      provincia,
      regione,
      seoUrl: finalSeoUrl,
      latitudine,
      longitudine,
      organizerIds: [userId],
      createdAt: new Date(),
      stripeAccountId: null,
      ticketingStatus: "no_stripe",
    });

    return {
      success: "Organizzazione creata con successo!",
      id: organizationRes.insertedId.toString(),
    };
  } catch (error) {
    console.error("Errore creazione:", error);
    return { error: "Errore durante la creazione dell'organizzazione." };
  }
}

/** ***************************************************************************
 * SEZIONE 2: READ (R)
 * ****************************************************************************/

/**
 * getOrganizationById(organizationId)
 * - Recupera un singolo documento dalla collection “organizations” tramite ObjectId.
 * - Se non trovato, restituisce { error }.
 * - Altrimenti trasforma in SafeOrganization “plain” e lo restituisce.
 */
export async function getOrganizationById(
  organizationId: string
): Promise<SafeOrganization | { error: string }> {
  try {
    const client = await clientPromise;
    const db = client.db("evently");

    const rawDoc = await db
      .collection("organizations")
      .findOne({ _id: ObjectId.createFromHexString(organizationId) });
    if (!rawDoc) return { error: "Organizzazione non trovata." };

    return transformMongoDocToSafeOrganization(rawDoc);
  } catch (error) {
    console.error("Errore get by ID:", error);
    return { error: "Errore durante il recupero dell'organizzazione." };
  }
}

/**
 * getOrganizationsByUser(userId)
 * - Recupera tutte le organizzazioni in cui l’utente è membro (organizerIds contiene userId).
 * - Se errore, restituisce { error }.
 * - Altrimenti trasforma ciascun documento in SafeOrganization e restituisce l’array.
 */
export async function getOrganizationsByUser(
  userId: string
): Promise<SafeOrganization[] | { error: string }> {
  try {
    const client = await clientPromise;
    const db = client.db("evently");

    const rawDocs = await db
      .collection("organizations")
      .find({ organizerIds: userId })
      .toArray();

    return transformMongoOrganizations(rawDocs);
  } catch (error) {
    console.error("Errore get by user:", error);
    return { error: "Errore durante il recupero delle organizzazioni." };
  }
}

/** ***************************************************************************
 * SEZIONE 3: UPDATE (U)
 * ****************************************************************************/

/**
 * updateOrganization(organizationId, values, userId)
 * 1. Valida campi con schema parziale.
 * 2. Controlla che l’utente sia tra organizerIds nel documento esistente.
 * 3. Calcola nuove coordinate se indirizzo+comune presenti.
 * 4. Effettua updateOne con $set dei campi forniti.
 * 5. Se matchedCount = 0 restituisce { error }.
 * 6. Altrimenti restituisce { success }.
 */
export async function updateOrganization(
  organizationId: string,
  values: Partial<z.infer<typeof organizationSchema>>,
  userId: string
): Promise<{ success?: string; error?: string }> {
  // 1. Validazione campi (parziale)
  const validated = organizationSchema.partial().safeParse(values);
  if (!validated.success) return { error: "Campi non validi." };

  const updateData = validated.data;
  if (updateData.imageSrc?.trim() === "") {
    updateData.imageSrc = "/images/NERO500.jpg";
  }

  // 2. Calcolo coordinate, se cambia indirizzo/comune
  let latitudine: string | null = null;
  let longitudine: string | null = null;
  if (updateData.indirizzo && updateData.comune) {
    const coords = await getCoordinatesFromOSM(
      updateData.indirizzo,
      updateData.comune
    );
    latitudine = coords.latitude?.toString() ?? null;
    longitudine = coords.longitude?.toString() ?? null;
  }

  const finalData = { ...updateData, latitudine, longitudine };

  // 3. Esecuzione update in MongoDB
  try {
    const client = await clientPromise;
    const db = client.db("evently");

    const result = await db.collection("organizations").updateOne(
      {
        _id: ObjectId.createFromHexString(organizationId),
        organizerIds: userId,
      },
      { $set: finalData }
    );

    if (result.matchedCount === 0)
      return { error: "Organizzazione non trovata o accesso negato." };
    return { success: "Organizzazione aggiornata." };
  } catch (error) {
    console.error("Errore aggiornamento:", error);
    return { error: "Errore durante l'aggiornamento." };
  }
}

/** ***************************************************************************
 * SEZIONE 4: DELETE (D)
 * ****************************************************************************/

/**
 * deleteOrganization(organizationId)
 * - Elimina il documento con _id corrispondente.
 * - Se deletedCount = 0, restituisce { error }.
 * - Altrimenti restituisce { success }.
 */
export async function deleteOrganization(
  organizationId: string
): Promise<{ success?: string; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db("evently");

    const result = await db
      .collection("organizations")
      .deleteOne({ _id: ObjectId.createFromHexString(organizationId) });

    if (result.deletedCount === 0)
      return { error: "Organizzazione non trovata." };
    return { success: "Organizzazione eliminata." };
  } catch (error) {
    console.error("Errore eliminazione:", error);
    return { error: "Errore durante l'eliminazione." };
  }
}
