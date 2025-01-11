"use client";

import {  useCallback, useMemo } from "react";
import { addFavorite, removeFavorite } from "@/actions/favorites-event";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";


interface UseFavoriteProps {
  eventId: string;
  currentUser?: User | null;
}


export const useFavorite = ({ eventId, currentUser }: UseFavoriteProps)  => {
  const router = useRouter();
  
  const hasFavorited = useMemo(() => {
    if (currentUser?.favoriteIds) {
      return currentUser.favoriteIds.includes(eventId);
    }
    return false;
  }, [currentUser, eventId]);
 

    
  const toggleFavorite = useCallback(async(e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if(!currentUser){
          router.push("/auth/login")
          return;
      }

      if (!eventId) {
      toast.error("Invalid listing ID");
      return;
    }
    console.log("Event ID:", eventId); 
    try {
      let messaggio;
      if(hasFavorited){
        if(currentUser && currentUser.id) {
          await removeFavorite(eventId, currentUser.id);
          messaggio = "Evento rimosso dai preferiti.";
         
        }
      } else {
        if(currentUser && currentUser.id) {
          await addFavorite(eventId, currentUser.id);
          messaggio = "Evento aggiunto ai preferiti.";
        }
      }

   
      router.refresh();
      toast.success(messaggio);

  } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
  }
}, [currentUser, eventId, , hasFavorited, router]);

return { hasFavorited, toggleFavorite};

};

export default useFavorite;