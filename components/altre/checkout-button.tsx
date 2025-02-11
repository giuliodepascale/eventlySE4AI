"use client"

import { SafeEvent } from "@/app/types";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "../ui/button";

const CheckoutButton = ({event}:{event: SafeEvent}) =>{
   
    const user = useCurrentUser();
    const hasEventFinished = new Date(event.eventDate).getTime() < Date.now() - 4 * 60 * 60 * 1000;

    if(!user) return null

    
    return (
    <div  className="flex items-center gap-3"> 
        {/* cannot buy past events */}
        {hasEventFinished ? (
            <p className="p-2 text-red-400">Evento terminato</p>
        ) : (
        <>
        <Button disabled={!user} >
         Checkout
        </Button>
        </>
        )}
    </div>
    )
  }

export default CheckoutButton;