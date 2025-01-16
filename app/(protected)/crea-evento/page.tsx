"use client";

import EventForm from '@/components/altre/event-form';
import { useCurrentUser } from '@/hooks/use-current-user';


const CreateEventPage = () => {

    const user = useCurrentUser();
   

    return (
        <>
        <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
  
    <h3 className="text-2xl font-bold text-center  ">
      Crea il tuo Evento
    </h3>
  
</section>

            <div>
                <EventForm userIdprops={user?.id || ''}  type="create"/>
            </div>
            </>
    )
}

export default CreateEventPage;