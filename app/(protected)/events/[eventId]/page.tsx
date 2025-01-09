import EmptyState from "@/components/altre/empty-state";
import EventClient from "@/components/altre/event-client";
import { getEventById } from "@/data/event";
import  {currentUser}  from "@/lib/auth";


interface EventPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function EventPage({ searchParams }: EventPageProps) {
    
    const params = await searchParams;
    
    // Estrai l'ID dai parametri di ricerca

    const id = typeof params.id === 'string' ? params.id : "";

    const event = await getEventById(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = await currentUser();

    if(!event) {
        return (
                <EmptyState />
        )
    }

    return (
            
                <EventClient 
                  //  event={event}
                   // currentUser={user}
                />
           
    )
}

