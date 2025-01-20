import { getOrganizationById } from "@/actions/organization";
import { SafeEvent, SafeOrganization } from "@/app/types";
import EmptyState from "@/components/altre/empty-state";
import EventClient from "@/components/altre/event-client";
import { getEventById } from "@/data/event";
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


    

    return (
                <EventClient 
                     event={event as SafeEvent}
                     organizer={organizer.organization as SafeOrganization}
                     currentUser= {fullUser || null}
                />
    )
}

