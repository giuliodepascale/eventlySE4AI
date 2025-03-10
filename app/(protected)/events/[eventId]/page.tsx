import { getOrganizationById } from "@/actions/organization";
import { SafeEvent, SafeOrganization, SafeTicketType } from "@/app/types";
import EmptyState from "@/components/altre/empty-state";
import EventClient from "@/components/events/event-client";
import { getEventById, getRelatedEventsByCategory } from "@/data/event";
import { hasUserReservation } from "@/data/prenotazione";
import { getActiveTicketsByEvent } from "@/data/ticket-type";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";


interface EventPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function EventPage({ params }: EventPageProps) {
    
    const {eventId} = await params;
    
    // Estrai l'ID dai parametri di ricerca

  
    const event = await getEventById(eventId as string || '');

   

    if(!event) {
        return (
                <EmptyState title="Evento non trovato" subtitle="La pagina che stai cercando non esiste " />
        )
    }

    const organizer = await getOrganizationById(event?.organizationId)
    
    const user = await currentUser();

    let fullUser = null;
    if(user && user.id){
    fullUser = await getUserById(user.id);
    }
     else {
        return (
            <EmptyState title="Effettua il login" subtitle="Qualcosa è andato storto" showToHome />
    )
     }

     const relatedEventsCategory = await getRelatedEventsByCategory(event.category, 5, event.id);


        let ticketTypes = null;
     
         ticketTypes = await getActiveTicketsByEvent(event.id);
   

         let reservationId: string | null = null;
     
         if (event.isReservationActive && fullUser?.id) {
            reservationId = await hasUserReservation(fullUser.id, event.id);
          }
       
     
    

     return (
                <EventClient 
                     event={event as SafeEvent}
                     organization={organizer.organization as SafeOrganization}
                     currentUser= {fullUser || null}
                     relatedEventsCategory={relatedEventsCategory}
                     ticketTypes={ticketTypes as SafeTicketType[]}
                     reservationId={reservationId || undefined}
                />
    )
}

