"use server";

import { db } from "@/lib/db";
import { CreateEventSchema } from "@/schemas";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getOrganizationById, getOrganizationOrganizers } from "./organization";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const { title, description, imageSrc, category, organizationId, price, eventDate, indirizzo, comune, provincia, regione } = validatedFields.data;

  const organizer = await getOrganizationOrganizers(organizationId);
  if (!organizer || !organizer.organizers) {
    return { error: "Organizzatore non trovato" };
  }
  
  const organization = await getOrganizationById(organizationId);
  if (!organization || !organization.organization) {
    return { error: "Organizzazione non trovata" };
  }

  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;

  const finalPrice = price ? parseInt(price, 10) : 0;
  const isFree = finalPrice === 0;

  let newEvent;
  try {
    newEvent = await db.event.create({
      data: {
        title: title,
        description: description,
        imageSrc: finalImageSrc,
        indirizzo: indirizzo,
        category: category,
        eventDate: eventDate,
        comune: comune,
        provincia: provincia,
        regione: regione,
        organizationId: organizationId,
        price: finalPrice,
        isFree: isFree,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione dell'evento" };
  }

  // Effettua il redirect al di fuori del blocco try...catch
  redirect(`/events/${newEvent.id}`);
}



export const getAllEvents = async (query = "", limit = 6, page = 1, category = "") => {
  try {
    // Calcolo dell'offset per la paginazione
    const offset = (page - 1) * limit;

    // Creazione della query dinamica per Prisma
    const filters = {
      where: {
        AND: [
          ...(category ? [{ category: category }] : []),
          ...(query ? [{ title: { contains: query, mode: "insensitive" as const } }] : []),
          { eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) } }, // Filtra eventi con data entro 4 ore dal presente (5 ore per  orario)
        ],
      },
      take: limit,
      skip: offset,
      orderBy: {
        eventDate: "asc" as const, // Ordina per data di creazione, dal più recente
      },
    };

    // Eseguo la query con Prisma
    const events = await db.event.findMany(filters);

    // Conta totale degli eventi per la paginazione
    const totalEvents = await db.event.count({ where: filters.where });

    // Ritorno dei risultati e della paginazione
    return {
      events: events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(),
      })),
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      events: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
};



/**
 * Recupera tutti gli eventi associati a una specifica organizzazione.
 *
 * @param organizationId - L'ID dell'organizzazione.
 * @param limit - Numero massimo di eventi da restituire per pagina (default: 6).
 * @param page - Numero di pagina per la paginazione (default: 1).
 * @returns Un oggetto contenente gli eventi e le informazioni di paginazione o un messaggio di errore.
 */
export const getEventsByOrganization = async (organizationId : string, limit = 6, page = 1) => {
  try {
    // Validazione dell'ID organizzazione
    if (!organizationId || typeof organizationId !== "string") {
      return { error: "ID organizzazione non valido o non fornito." };
    }

    // Calcolo dell'offset per la paginazione
    const offset = (page - 1) * limit;

    // Recupero eventi associati all'organizzazione con paginazione
    const filters = {
      where: {
        organizationId: organizationId,
        eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) }, // Filtra eventi con data entro 4 ore dal presente
      },
      take: limit,
      skip: offset,
      orderBy: {
        eventDate: "asc" as const, // Ordina per data dell'evento in ordine crescente
      },
    };

    // Eseguo la query per ottenere gli eventi
    const events = await db.event.findMany(filters);

    // Conta totale degli eventi per la paginazione
    const totalEvents = await db.event.count({ where: filters.where });

    // Ritorno dei risultati e della paginazione
    return {
      events: events.map((event) => ({
        ...event,
        eventDate: event.eventDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
      })),
      pagination: {
        total: totalEvents,
        page,
        limit,
        totalPages: Math.ceil(totalEvents / limit),
      },
    };
  } catch (error) {
    console.error("Errore nel recuperare gli eventi per l'organizzazione:", error);
    return {
      events: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
      error: "Errore nel recuperare gli eventi. Riprova più tardi.",
    };
  }
};


export async function updateEvent(
  eventId: string,
  values: z.infer<typeof CreateEventSchema>
) {
  // Validazione dei campi in ingresso
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const {
    title,
    description,
    imageSrc,
    category,
    organizationId,
    price,
    eventDate,
    indirizzo,
    comune,
    provincia,
    regione,
  } = validatedFields.data;

  // Controlla che l'evento esista
  const existingEvent = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!existingEvent) {
    return { error: "Evento non trovato" };
  }

  // Verifica che l'organizzazione e i suoi organizzatori esistano
  const organizer = await getOrganizationOrganizers(organizationId);
  if (!organizer || !organizer.organizers) {
    return { error: "Organizzatore non trovato" };
  }

  const organization = await getOrganizationById(organizationId);
  if (!organization || !organization.organization) {
    return { error: "Organizzazione non trovata" };
  }

  // Gestione dell'immagine: se è una stringa vuota, la trasformiamo in undefined
  const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;

  // Convertiamo il prezzo in numero e definiamo se l'evento è gratuito
  const finalPrice = price ? parseInt(price, 10) : 0;
  const isFree = finalPrice === 0;

  // Proviamo ad aggiornare l'evento nel database
  let updatedEvent;
  try {
    updatedEvent = await db.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        imageSrc: finalImageSrc,
        indirizzo,
        category,
        eventDate,
        comune,
        provincia,
        regione,
        organizationId,
        price: finalPrice,
        isFree,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Errore durante l'aggiornamento dell'evento" };
  }

  // Una volta aggiornato, si redirige alla pagina dell'evento
  redirect(`/events/${updatedEvent.id}`);
}