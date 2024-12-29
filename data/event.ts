import { db } from "@/lib/db";

export const getEventById = async (id: string) => {
    try {
    const event = await db.event.findUnique({
        where: {
            id
        }
    })
    return event;
    } catch (error){
        console.error(error);
        return null;
    }
}