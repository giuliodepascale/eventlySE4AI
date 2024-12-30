"use client";

import EventForm from '@/components/altre/event-form';
import { useCurrentUser } from '@/hooks/use-current-user';


const CreateEventPage = () => {

    const user = useCurrentUser();

    return (
            <div>
                <EventForm userId={user?.id || ''}  type="create"/>
            </div>
    )
}

export default CreateEventPage;