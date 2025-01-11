"use server";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export async function addFavorite(eventId: string, userId: string) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("ID dell'evento non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    // Recupera l'utente dal database
    const user = await getUserById(userId);

    if (!user) {
      throw new Error("Utente non trovato.");
    }

    // Aggiungi l'evento ai preferiti
    const favoriteIds = [...(user.favoriteIds || [])];
    favoriteIds.push(eventId);

    // Aggiorna l'utente
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { favoriteIds },
    });

    return updatedUser;
  } catch (error) {
    console.error("Errore durante l'aggiunta ai preferiti:", error);
    throw new Error("Errore durante l'aggiunta ai preferiti.");
  }
}

export async function removeFavorite(eventId: string, userId: string) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("ID dell'evento non valido.");
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("ID dell'utente non valido.");
  }

  try {
    // Recupera l'utente dal database
    const user = await getUserById(userId);

    if (!user) {
      throw new Error("Utente non trovato.");
    }

    // Rimuovi l'evento dai preferiti
    const favoriteIds = [...(user.favoriteIds || [])].filter((id) => id !== eventId);

    // Aggiorna l'utente
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { favoriteIds },
    });

    return updatedUser;
  } catch (error) {
    console.error("Errore durante la rimozione dai preferiti:", error);
    throw new Error("Errore durante la rimozione dai preferiti.");
  }
}

