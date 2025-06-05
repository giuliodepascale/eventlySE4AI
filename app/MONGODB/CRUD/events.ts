"use server";

import { getCoordinatesFromOSM } from "@/lib/map";
import clientPromise from "@/lib/mongoDB";
import { CreateEventSchema } from "@/schemas";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function createEvent(values: z.infer<typeof CreateEventSchema>) {
    const validatedFields = await CreateEventSchema.safeParseAsync(values);
    if (!validatedFields.success) return { error: "Campi non validi" };
  
    const {
      title,
      description,
      imageSrc,
      category,
      organizationId,
      eventDate,
      indirizzo,
      comune,
      provincia,
      regione,
      status,
      isReservationActive,
    } = validatedFields.data;
  
    const coords = await getCoordinatesFromOSM(indirizzo, comune);
    if (!coords.latitude || !coords.longitude) return { error: "Indirizzo non valido" };
  
    const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;
    const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";
  
    const event = {
      title,
      description,
      imageSrc: finalImageSrc,
      category,
      organizationId: new ObjectId(organizationId),
      eventDate: new Date(eventDate),
      indirizzo,
      comune,
      provincia,
      regione,
      latitudine: coords.latitude.toString(),
      longitudine: coords.longitude.toString(),
      isReservationActive,
      status: mappedStatus,
      createdAt: new Date(),
    };
  
    const client = await clientPromise;
    const db = client.db("evently");
    const result = await db.collection("events").insertOne(event);
  
    redirect(`/events/${result.insertedId}`);
  }
  
  export async function updateEvent(eventId: string, values: z.infer<typeof CreateEventSchema>) {
    const validatedFields = await CreateEventSchema.safeParseAsync(values);
    if (!validatedFields.success) return { error: "Campi non validi" };
  
    const {
      title,
      description,
      imageSrc,
      category,
      organizationId,
      eventDate,
      indirizzo,
      comune,
      provincia,
      regione,
      status,
      isReservationActive,
    } = validatedFields.data;
  
    const coords = await getCoordinatesFromOSM(indirizzo, comune);
    if (!coords.latitude || !coords.longitude) return { error: "Indirizzo non valido" };
  
    const finalImageSrc = imageSrc?.trim() === "" ? undefined : imageSrc;
    const mappedStatus = status === "pubblico" ? "ACTIVE" : "HIDDEN";
  
    const client = await clientPromise;
    const db = client.db("evently");
  
    const result = await db.collection("events").updateOne(
      { _id: new ObjectId(eventId) },
      {
        $set: {
          title,
          description,
          imageSrc: finalImageSrc,
          category,
          organizationId: new ObjectId(organizationId),
          eventDate: new Date(eventDate),
          indirizzo,
          comune,
          provincia,
          regione,
          latitudine: coords.latitude.toString(),
          longitudine: coords.longitude.toString(),
          isReservationActive,
          status: mappedStatus,
        },
      }
    );
  
    if (result.matchedCount === 0) return { error: "Evento non trovato" };
  
    redirect(`/events/${eventId}`);
  }
  
  export async function deleteEvent(eventId: string) {
    const client = await clientPromise;
    const db = client.db("evently");
    const result = await db.collection("events").deleteOne({ _id: new ObjectId(eventId) });
  
    if (result.deletedCount === 0) return { error: "Evento non trovato" };
    return { success: "Evento eliminato con successo" };
  }
  
