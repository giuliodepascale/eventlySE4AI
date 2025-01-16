"use server"

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

  

  const { title, description, imageSrc, category, userId, price, eventDate, location} =
    validatedFields.data;

    

    const organizer = await getUserById(userId);
  
    if (!organizer) throw new Error("Organizzatore non trovato");
   
   
    const finalPrice = price ? parseInt(price, 10) : 0;

    const isFree = finalPrice === 0
    
    

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
        price: finalPrice,
        isFree: isFree,
      },
    });
  
   
    //return { success: "Evento creato con successo!", event: newEvent };
    redirect(`/events/${newEvent.id}`);
   }
   catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione dell'evento" };
  }
  
}
