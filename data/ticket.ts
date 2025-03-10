"use server";

import { db } from "@/lib/db";

export async function getTicketById(ticketId: string) {
    try {
        const ticket = await db.ticket.findUnique({
            where: { id: ticketId },
            include: {
                event: true, // Includi i dettagli dell'evento
                ticketType: true, // Includi il tipo di biglietto
            },
        });
        return ticket;
    } catch (error) {
        console.error("Errore nel recupero del biglietto:", error);
        return null;
    }
}
