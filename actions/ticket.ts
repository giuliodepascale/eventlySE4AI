"use server";

import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function createTicketAction(
  eventId: string,
  userId: string,
  ticketTypeId: string,
  paymentStripeId: string,
  methodPaymentId: string,
  paid: number
) {
  try {
    // Genera un codice univoco per il biglietto (QR Code)
    const ticketCode = uuidv4();

    // Creazione del biglietto nel database
    const ticket = await db.ticket.create({
      data: {
        eventId,
        userId,
        ticketTypeId,
        qrCode: ticketCode,
        isValid: true,
        paymentStripeId,
        methodPaymentId,
        paid,
      },
    });

    console.log("✅ Biglietto creato con successo:", ticket);
    return { success: true, ticket };
  } catch (error) {
    console.error("❌ Errore nella creazione del biglietto:", error);
    return { success: false, error: "Errore nella creazione del biglietto" };
  }
}
