"use server";

import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { CreateEventSchema } from "@/schemas";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const { title, description, imageSrc, category, userId, price, eventDate, location } = validatedFields.data;

  const organizer = await getUserById(userId);
  if (!organizer) {
    return { error: "Organizzatore non trovato" };
  }

  const finalPrice = price ? parseInt(price, 10) : 0;
  const isFree = finalPrice === 0;

  let newEvent;
  try {
    newEvent = await db.event.create({
      data: {
        title,
        description,
        imageSrc,
        location,
        category,
        eventDate,
        userId,
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
