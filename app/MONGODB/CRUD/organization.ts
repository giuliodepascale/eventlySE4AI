"use server";

import { ObjectId } from "mongodb";
import { organizationSchema } from "@/schemas";
import { z } from "zod";
import { getCoordinatesFromOSM } from "@/lib/map";
import { getUserById } from "@/data/user";
import clientPromise from "@/lib/mongoDB";

import { SafeOrganization } from "@/app/types";
import { transformMongoDocToSafeOrganization, transformMongoOrganizations } from "@/lib/utils";

/**
 * Crea una nuova organizzazione e restituisce l’ID inserito.
 */
export async function createOrganization(
  values: z.infer<typeof organizationSchema>,
  userId: string
): Promise<{ success?: string; id?: string; error?: string }> {
  const validatedFields = organizationSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Campi non validi." };

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
  } = validatedFields.data;

  const user = await getUserById(userId);
  if (!user || user.role === "USER")
    return { error: "Assicurati di essere un organizzatore." };

  const finalImageSrc =
    imageSrc?.trim() === "" ? "/images/NERO500.jpg" : imageSrc;
  const finalSeoUrl = seoUrl || "";

  let latitudine: string | null = null;
  let longitudine: string | null = null;
  if (indirizzo && comune) {
    const coords = await getCoordinatesFromOSM(indirizzo, comune);
    latitudine = coords.latitude?.toString() ?? null;
    longitudine = coords.longitude?.toString() ?? null;
  }

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

/**
 * Aggiorna un'organizzazione esistente (solo se l'utente è nell'array organizerIds).
 */
export async function updateOrganization(
  organizationId: string,
  values: Partial<z.infer<typeof organizationSchema>>,
  userId: string
): Promise<{ success?: string; error?: string }> {
  const validatedFields = organizationSchema.partial().safeParse(values);
  if (!validatedFields.success) return { error: "Campi non validi." };

  const updateData = validatedFields.data;
  if (updateData.imageSrc?.trim() === "") {
    updateData.imageSrc = "/images/NERO500.jpg";
  }

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

/**
 * Elimina un'organizzazione per ID.
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

/**
 * Recupera una singola organizzazione per ID e la trasforma in SafeOrganization.
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
 * Recupera tutte le organizzazioni in cui l'utente è associato
 * (ricerca sull'array organizerIds), e le trasforma in SafeOrganization[].
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
