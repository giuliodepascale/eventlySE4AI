// actions/organizations.ts

"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/data/user"; // Assicurati che il percorso sia corretto
import { organizationSchema } from "@/schemas";
import { z } from "zod";
import { OrganizationRole } from "@prisma/client"; // Assicurati che il ruolo sia definito nel tuo schema Prisma
import { redirect } from "next/navigation";
/**
 * Crea una nuova organizzazione.
 * @param values - I campi validati dall'organizationSchema.
 * @param userId - L'ID dell'utente che sta creando l'organizzazione.
 * @returns un oggetto con chiavi success o error.
 */
export async function createOrganization(
  values: z.infer<typeof organizationSchema>,
  userId: string
) {
  // 1. Validazione dei dati
  const validatedFields = organizationSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi. Per favore, verifica i dati inseriti." };
  }

  const {
    name,
    description,
    indirizzo,
    phone,
    email,
    linkEsterno,
    linkMaps,
    imageSrc,
    comune,
    provincia,
    regione,
    seoUrl,
  } = validatedFields.data;

  // 2. Verifica che l'utente esista e sia un ORGANIZER o ADMIN
  const user = await getUserById(userId);
  if (!user || user.role === "USER") {
    return { error: "Assicurati di essere un organizzatore." };
  }

  // 3. Parsing linkMaps (estrazione src="..." se necessario)
  let parsedLinkMaps = null;

  if (linkMaps) {
    parsedLinkMaps = linkMaps.match(/src="([^"]+)"/)?.[1] || linkMaps;
  }

  // 4. Pulizia del campo immagine
  const finalImageSrc = imageSrc?.trim() === "" ? "/images/NERO500.jpg" : imageSrc; //TODO

  // 5. Generazione dello SEO URL se non è stato fornito
  const finalSeoUrl = seoUrl ||""

  // 6. Creazione dell'organizzazione
  let newOrganization;
  try {
    newOrganization = await db.organization.create({
      data: {
        name,
        description,
        indirizzo,
        phone,
        email,
        linkEsterno,
        linkMaps: parsedLinkMaps,
        imageSrc: finalImageSrc,
        comune,
        regione,
        provincia,
        seoUrl: finalSeoUrl,
      },
    });
  } catch (error) {
    console.error("Errore durante la creazione dell'organizzazione:", error);
    return { error: "Errore durante la creazione dell'organizzazione. Riprova più tardi."
    };
  }

  // 7. Associazione Utente-Organizzazione
  try {
    await db.organizationUser.create({
      data: {
        userId: user.id,
        organizationId: newOrganization.id,
        role: OrganizationRole.ADMIN_ORGANIZZATORE,
      },
    });
  } catch (error) {
    console.error("Errore durante l'associazione utente-organizzazione:", error);
    // Se l'associazione fallisce, elimina l'organizzazione creata
    await db.organization.delete({ where: { id: newOrganization.id } });
    return {
      error: "Errore durante l'associazione con l'organizzazione. Riprova più tardi.",
    };
  }

  // 8. Restituzione del Successo
  return { success: "Organizzazione creata con successo!", organization: newOrganization };
}

/**
 * Recupera l'organizzatore (o gli organizzatori) di una specifica organizzazione.
 * @param organizationId - L'ID dell'organizzazione di cui recuperare l'organizzatore.
 * @returns Un oggetto contenente gli organizzatori o un messaggio di errore.
 */
export async function getOrganizationOrganizers(organizationId: string) {
  try {
    if (!organizationId) {
      return { error: "ID organizzazione non fornito." };
    }

    const organizationUsers = await db.organizationUser.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        user: true,
      },
    });

    if (organizationUsers.length === 0) {
      return {
        error: "Nessun organizzatore trovato per questa organizzazione.",
      };
    }

    const organizers = organizationUsers.map((orgUser) => orgUser.user);

    return { organizers };
  } catch (error) {
    console.error("Errore nel recuperare gli organizzatori:", error);
    return { error: "Errore nel recuperare gli organizzatori. Riprova più tardi." };
  }
}

/**
 * Recupera i dettagli di un'organizzazione specifica, inclusi gli organizzatori.
 * @param organizationId - L'ID dell'organizzazione da recuperare.
 * @returns Un oggetto contenente l'organizzazione e i suoi organizzatori o un messaggio di errore.
 */
export async function getOrganizationById(organizationId: string) {
  try {
    if (!organizationId || typeof organizationId !== "string") {
      return { error: "ID organizzazione non valido o non fornito." };
    }

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        organizationUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organization) {
      return { error: "Organizzazione non trovata." };
    }

    const organizers = organization.organizationUsers.map((ou) => ou.user);

    // Campi "sicuri" da restituire
    const safeOrganization = {
      id: organization.id,
      name: organization.name,
      description: organization.description,
      indirizzo: organization.indirizzo,
      phone: organization.phone,
      email: organization.email,
      comune: organization.comune,
      provincia: organization.provincia,
      regione: organization.regione,
      linkEsterno: organization.linkEsterno,
      linkMaps: organization.linkMaps,
      createdAt: organization.createdAt.toISOString(),
      imageSrc: organization.imageSrc,
      seoUrl: organization.seoUrl,
    };

    return { organization: safeOrganization, organizers };
  } catch (error) {
    console.error("Errore nel recuperare l'organizzazione:", error);
    return {
      error: "Errore nel recuperare l'organizzazione. Riprova più tardi.",
    };
  }
}

/**
 * Recupera tutte le organizzazioni gestite da un utente specifico.
 * @param userId - L'ID dell'utente di cui recuperare le organizzazioni gestite.
 * @returns Un oggetto contenente un array di organizzazioni o un messaggio di errore.
 */
export async function getOrganizationsByUser(userId: string) {
  try {
    if (!userId || typeof userId !== "string") {
      return { error: "ID utente non valido o non fornito." };
    }

    const userOrganizations = await db.organizationUser.findMany({
      where: {
        userId: userId,
      },
      include: {
        organization: true,
      },
    });

    if (userOrganizations.length === 0) {
      return { error: "Nessuna organizzazione trovata per questo utente." };
    }

    const organizations = userOrganizations.map((orgUser) => {
      const organization = orgUser.organization;
      return {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        indirizzo: organization.indirizzo,
        phone: organization.phone,
        email: organization.email,
        comune: organization.comune,
        provincia: organization.provincia,
        regione: organization.regione,
        linkEsterno: organization.linkEsterno,
        linkMaps: organization.linkMaps,
        createdAt: organization.createdAt.toISOString(),
        imageSrc: organization.imageSrc,
        seoUrl: organization.seoUrl,
      };
    });

    return { organizations };
  } catch (error) {
    console.error("Errore nel recuperare le organizzazioni dell'utente:", error);
    return {
      error: "Errore nel recuperare le organizzazioni. Riprova più tardi.",
    };
  }
}

/**
 * Aggiorna un'organizzazione esistente.
 * @param organizationId - L'ID dell'organizzazione da aggiornare.
 * @param values - I campi da aggiornare, validati tramite lo schema parziale di organizationSchema.
 * @param userId - L'ID dell'utente che sta tentando l'aggiornamento.
 * @returns Un oggetto contenente un messaggio di successo e l'organizzazione aggiornata, oppure un messaggio di errore.
 */
export async function updateOrganization(
  organizationId: string,
  values: Partial<z.infer<typeof organizationSchema>>,
  userId: string
) {
  // 1. Validazione dei dati con uno schema parziale (aggiornare non significa dover reinserire tutto)
  const validatedFields = organizationSchema.partial().safeParse(values);
  if (!validatedFields.success) {
    return { error: "Campi non validi. Per favore, verifica i dati inseriti." };
  }
  const updateData = validatedFields.data;

  // 2. Verifica che l'organizzazione esista
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) {
    return { error: "Organizzazione non trovata." };
  }

  // 3. Verifica che l'utente esista ed è autorizzato ad aggiornare l'organizzazione
  //    Qui controlliamo che l'utente sia associato all'organizzazione come ADMIN_ORGANIZZATORE.
  const organizationUser = await db.organizationUser.findFirst({
    where: {
      organizationId,
      userId,
    },
  });
  if (!organizationUser) {
    return { error: "Non hai i permessi per aggiornare questa organizzazione." };
  }

  // 4. Parsing di linkMaps, se presente: estraiamo l'URL se il campo contiene un tag HTML
  if (updateData.linkMaps) {
    updateData.linkMaps = updateData.linkMaps.match(/src="([^"]+)"/)?.[1] || updateData.linkMaps;
  }

  // 5. Pulizia del campo immagine: se l'immagine è una stringa vuota, forniamo quella di default
  if ("imageSrc" in updateData) {
    updateData.imageSrc =
      updateData.imageSrc?.trim() === "" ? "/images/NERO500.jpg" : updateData.imageSrc;
  }

  // 6. Aggiornamento dell'organizzazione nel database
  let updatedOrganization;
  try {
    updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
      
    // Una volta aggiornato, si redirige alla pagina dell'organizzazione
    
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'organizzazione:", error);
    return { error: "Errore durante l'aggiornamento dell'organizzazione. Riprova più tardi." };
  }
   // Una volta aggiornato, si redirige alla pagina dell'evento
   redirect(`/organization/${updatedOrganization.id}`);
}
