import { db } from "@/lib/db"


export const getUserByEmail = async (email: string) => {
    try {
    const user = await db.user.findUnique({
        where: {
            email
        }
    })
    return user
    
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
    const user = await db.user.findUnique({
        where: {
            id
        }
    })
    return user;
    } catch (error){
        console.error(error);
        return null;
    }
}

export const getCountLikeForCatagoryEventsByUser = async (userId: string) => {
    if (!userId) {
        console.warn("⚠️ Nessun userId passato a getCountLike...");
        return 0;
      }
    try {
        // Ottieni l'utente con i suoi favoriti
        const user = await db.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.favoriteIds || user.favoriteIds.length === 0) {
            return {};
        }

        // Ottieni tutti gli eventi che l'utente ha messo tra i preferiti
        const favoriteEvents = await db.event.findMany({
            where: {
                id: {
                    in: user.favoriteIds
                }
            },
            select: {
                category: true
            }
        });

        // Conta quanti eventi ci sono per ogni categoria
        const categoryCount: Record<string, number> = {};
        
        favoriteEvents.forEach(event => {
            if (categoryCount[event.category]) {
                categoryCount[event.category]++;
            } else {
                categoryCount[event.category] = 1;
            }
        });

        return categoryCount;
    } catch (error) {
        console.error("Errore nel conteggio dei preferiti per categoria:", error);
        return {};
    }
}