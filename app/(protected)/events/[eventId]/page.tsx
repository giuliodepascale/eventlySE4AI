import { SafeEvent } from "@/app/types";
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

    const organizer = await getUserById(event?.userId as string || '');
    
    const user = await currentUser();

    let fullUser = null;
    if(user && user.id){
    fullUser = await getUserById(user.id);
    }

    if(!event) {
        return (
                <EmptyState />
        )
    }

    return (
                <EventClient 
                     event={event as SafeEvent}
                     organizer={organizer}
                     currentUser= {fullUser || null}
                />
    )
}

