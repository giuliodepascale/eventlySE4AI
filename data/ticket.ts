"use server";
import { db } from "@/lib/db";

export async function getTicketTypesForEvent(eventId: string) {
  try {
    return await db.ticketType.findMany({
      where: { eventId },
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}