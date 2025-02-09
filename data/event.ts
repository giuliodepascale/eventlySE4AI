import { db } from "@/lib/db";


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
