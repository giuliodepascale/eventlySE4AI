"use server"

import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { CreateEventSchema } from "@/schemas";
import { z } from "zod";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  

  const { title, description, imageSrc, category, userId, price, isFree , eventDate, location} =
    validatedFields.data;

    console.log("userId: ", userId);

    const organizer = await getUserById(userId);
    console.log("organizzatore: ", organizer);
    if (!organizer) throw new Error("Organizzatore non trovato");

  try {
    

    const newEvent = await db.event.create({
      data: {
        title,
        description,
        imageSrc,
        location,
        category,
        eventDate,
        userId,
        price: price ?? 0,
        isFree: isFree ?? true,
      },
    });

    return { success: "Evento creato con successo!", event: newEvent };
  } catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione dell'evento" };
  }
}
