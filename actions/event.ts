import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { CreateEventSchema } from "@/schemas";
import { z } from "zod";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
  const validatedFields = await CreateEventSchema.safeParseAsync(values);

  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const { title, description, imageSrc, category, userId, price, isFree } =
    validatedFields.data;

  try {
    const organizer = await getUserById(userId);
    if (!organizer) throw new Error("Organizzatore non trovato");

    const newEvent = await db.event.create({
      data: {
        title,
        description,
        imageSrc,
        category,
        userId,
        price: price ?? null,
        isFree: isFree ?? false,
      },
    });

    return { success: "Evento creato con successo!", event: newEvent };
  } catch (error) {
    console.error(error);
    return { error: "Errore durante la creazione dell'evento" };
  }
}
