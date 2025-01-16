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
