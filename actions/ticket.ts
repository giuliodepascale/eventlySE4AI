import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { eventId, name, description, price, quantity, maxPerUser, isActive } = await req.json();

    // ✅ Validazione input
    if (!eventId || !name || price === undefined || quantity === undefined) {
      return NextResponse.json({ error: "Manca un campo obbligatorio." }, { status: 400 });
    }

    // 🔄 Creazione del nuovo tipo di biglietto
    const newTicketType = await db.ticketType.create({
      data: {
        eventId,
        name,
        description: description || null,
        price,
        quantity,
        maxPerUser: maxPerUser || null,
        isActive: isActive ?? true, // Default true se non specificato
      },
    });

    console.log("🎟️ Nuovo TicketType creato:", newTicketType);

    return NextResponse.json({ ticketType: newTicketType }, { status: 201 });
  } catch (error) {
    console.error("❌ Errore nella creazione del TicketType:", error);
    return NextResponse.json({ error: "Errore interno del server." }, { status: 500 });
  }
}
