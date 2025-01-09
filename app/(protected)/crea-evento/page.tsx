"use client";

import EventForm from '@/components/altre/event-form';
import { useCurrentUser } from '@/hooks/use-current-user';


const CreateEventPage = () => {

    const user = useCurrentUser();
    console.log(user);

    return (
            <div>
                <EventForm userIdprops={user?.id || ''}  type="create"/>
            </div>
    )
}

export default CreateEventPage;