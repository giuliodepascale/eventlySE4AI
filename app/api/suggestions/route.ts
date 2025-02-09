// app/api/suggestions/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "";

  // Se non c'è una query valida, restituisci un array vuoto
  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  let suggestions: { id: string; name: string }[] = [];

  if (type === "events") {
    // Cerca nel campo title degli eventi
    const events = await db.event.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
      },
      select: { id: true, title: true },
      take: 5,
    });
    // Rinomina il campo title in name per uniformare l'interfaccia
    suggestions = events.map((event) => ({
      id: event.id,
      name: event.title,
    }));
  } else if (type === "organizations") {
    // Cerca nel campo name delle organizzazioni
    const organizations = await db.organization.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true },
      take: 5,
    });
    suggestions = organizations;
  }

  return NextResponse.json({ suggestions });
}
