import { db } from "@/lib/db";
import { calculateDistance } from "@/lib/map";

export const getEventById = async (id: string) => {
    try {
    const event = await db.event.findUnique({
        where: {
            id
        }
    })
    if(!event) return null;
    return {
        ...event,
        eventDate: event?.eventDate.toISOString(),
        createdAt: event?.createdAt.toISOString(), // Converte la data in stringa ISO
    };
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
export async function getNearbyEvents(userLat: number, userLon: number) {
    try {
        const events = await db.event.findMany({});
        if (!events) return null;
        
        return events.map(event => {
          // Calcola la distanza solo se le coordinate dell'evento sono presenti
          let distance = null;
          if (event.latitudine && event.longitudine) {
            const eventLat = parseFloat(event.latitudine);
            const eventLon = parseFloat(event.longitudine);
            distance = calculateDistance(userLat, userLon, eventLat, eventLon);
          }
          
          return {
            ...event,
            eventDate: event.eventDate ? event.eventDate.toISOString() : "",
            createdAt: event.createdAt ? event.createdAt.toISOString() : "",
            distance, // Aggiungiamo la distanza calcolata
          };
        });
        
      } catch (error) {
        console.error(error);
        return null;
      }
    };