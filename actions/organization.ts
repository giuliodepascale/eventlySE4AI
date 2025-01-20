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

  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;
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


/**
 * Recupera l'organizzatore (o gli organizzatori) di una specifica organizzazione.
 *
 * @param organizationId - L'ID dell'organizzazione di cui recuperare l'organizzatore.
 * @returns Un oggetto contenente gli organizzatori o un messaggio di errore.
 */
export async function getOrganizationOrganizers(organizationId: string) {
  try {
    // Verifica che l'ID dell'organizzazione sia valido
    if (!organizationId) {
      return { error: "ID organizzazione non fornito." };
    }

    // Query per trovare tutti i record in OrganizationUser con ruolo ADMIN per l'organizzazione specificata
    const organizationUsers = await db.organizationUser.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        user: true, // Includi i dettagli dell'utente
      },
    });

    if (organizationUsers.length === 0) {
      return { error: "Nessun organizzatore trovato per questa organizzazione." };
    }

    // Estrai i dettagli degli utenti organizzatori
    const organizers = organizationUsers.map((orgUser) => orgUser.user);

    return { organizers };
  } catch (error) {
    console.error("Errore nel recuperare gli organizzatori:", error);
    return { error: "Errore nel recuperare gli organizzatori. Riprova più tardi." };
  }
}


/**
 * Recupera i dettagli di un'organizzazione specifica, inclusi gli organizzatori.
 *
 * @param organizationId - L'ID dell'organizzazione da recuperare.
 * @returns Un oggetto contenente l'organizzazione e i suoi organizzatori o un messaggio di errore.
 */
export async function getOrganizationById(organizationId: string) {
  try {
    // 1. Validazione dell'ID dell'organizzazione
    if (!organizationId || typeof organizationId !== "string") {
      return { error: "ID organizzazione non valido o non fornito." };
    }

    // 2. Recupero dell'organizzazione con i suoi organizzatori
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationUsers: {
          include: { user: true },
        },
      },
    });

    if (!organization) {
      return { error: "Organizzazione non trovata." };
    }

    // 3. Estrazione degli organizzatori
    const organizers = organization.organizationUsers.map((ou) => ou.user);

    // 4. Creazione di un oggetto sicuro per l'organizzazione (escludendo dati sensibili)
    const safeOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      linkEsterno: organization.linkEsterno,
      createdAt: organization.createdAt.toISOString(),
      imageSrc: organization.imageSrc,
      // Aggiungi altri campi se necessario
    };

    return { organization: safeOrganization, organizers };
  } catch (error) {
    console.error("Errore nel recuperare l'organizzazione:", error);
    return { error: "Errore nel recuperare l'organizzazione. Riprova più tardi." };
  }
}