import { SafeEvent } from "@/app/types";
import { db } from "@/lib/db";


export const getEventById = async (id: string) => {
    try {
    const event = await db.event.findUnique({
        where: {
            id
        },
    })
    if(!event) return null;
    return {
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(), 
        
        };// Converte la data in stringa ISO
    
    } catch (error){
        console.error(error);
        return null;
    }
}

export const getEvents = async () => {
    try {
    const events = await db.event.findMany({});
    if(!events) return null;
    return events.map((event) => ({
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(), // Converte la data in stringa ISO
    }));
    } catch (error){
        console.error(error);
        return null;
    }
}



export async function getRelatedEventsByCategory(
    category: string,
    limit: number = 5,
    excludeEventId?: string
  ): Promise<(SafeEvent & { eventDate: string; createdAt: string })[]> {
    try {
      // Costruiamo la clausola where per Prisma, includendo un filtro per la data (come nel tuo getAllEvents)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        category,
        eventDate: { gt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
      };
  
      // Se vogliamo escludere un evento specifico (per esempio, l'evento corrente)
      if (excludeEventId) {
        whereClause.id = { not: excludeEventId };
      }
  
      // Eseguiamo la query per trovare gli eventi correlati, ordinati per data
      const events = await db.event.findMany({
        where: whereClause,
        orderBy: {
          eventDate: "asc",
        },
        take: limit,
      });
  
      // Convertiamo le date in stringhe ISO per comodità lato client
      return events.map((event) => ({
        ...event,
        eventDate: event.eventDate.toISOString(),
        createdAt: event.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("Error in getRelatedEventsByCategory:", error);
      return [];
    }
  }