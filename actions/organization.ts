// actions/organizations.ts

"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/data/user"; // Assicurati che il percorso sia corretto
import { organizationSchema } from "@/schemas";
import { z } from "zod";
import { OrganizationRole } from "@prisma/client"; // Assicurati che il ruolo sia definito nel tuo schema Prisma

/**
 * Crea una nuova organizzazione e associa l'utente creatore come ADMIN.
 *
 * @param values - I dati dell'organizzazione da creare, conformi a organizationSchema.
 * @param userId - L'ID dell'utente che sta creando l'organizzazione.
 * @returns Un oggetto contenente `success` in caso di successo o `error` in caso di fallimento.
 */
export async function createOrganization(
  values: z.infer<typeof organizationSchema>,
  userId: string
) {
  // 1. Validazione dei dati
  const validatedFields = organizationSchema.safeParse(values);

  if (!validatedFields.success) {
    // Puoi personalizzare il messaggio di errore o restituire dettagli specifici
    return { error: "Campi non validi. Per favore, verifica i dati inseriti." };
  }

  const {
    name,
    description,
    address,
    phone,
    email,
    linkEsterno,
    imageSrc,
    // location, // Se necessario, aggiungi questo campo nel tuo modello Prisma
  } = validatedFields.data;

  // 2. Verifica che l'utente esista
  const user = await getUserById(userId);
  if (!user || user.role === "USER") {
    return { error: "Assicurati di essere un organizzatore." };
  }

  const finalImageSrc = imageSrc?.trim() === "" ? "images/evently-logo.png" : imageSrc;
  // 3. Creazione dell'organizzazione
  let newOrganization;
  try {
    newOrganization = await db.organization.create({
      data: {
        name,
        description,
        address,
        phone,
        email,
        linkEsterno,
        imageSrc: finalImageSrc,
      },
    });
  } catch (error) {
    console.error("Errore durante la creazione dell'organizzazione:", error);
    return { error: "Errore durante la creazione dell'organizzazione. Riprova più tardi." };
  }

  // 4. Associazione Utente-Organizzazione
  try {
    await db.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: newOrganization.id,
        role: OrganizationRole.ADMIN_ORGANIZZATORE, // Imposta il ruolo desiderato
      },
    });
  } catch (error) {
    console.error("Errore durante l'associazione utente-organizzazione:", error);
    // Se l'associazione fallisce, potresti voler eliminare l'organizzazione creata
    await db.organization.delete({ where: { id: newOrganization.id } });
    return { error: "Errore durante l'associazione con l'organizzazione. Riprova più tardi." };
  }

  // 5. Restituzione del Successo
  return { success: "Organizzazione creata con successo!" };
}
