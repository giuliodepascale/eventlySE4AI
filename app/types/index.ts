import {Event, Organization, Reservation} from "@prisma/client"



export type SafeEvent = Omit <
    Event,
    'createdAt' | 'eventDate'
> & {
    createdAt: string;
    eventDate: string;
}


export type SafeReservation = Omit <
    Reservation,
    'createdAt' |'event'
> & {
    createdAt: string;
    event: SafeEvent;
}

export type SafeOrganization = Omit <
Organization,
'createdAt' 
> & {
createdAt: string;
}

export type SearchParams = Promise<{
    [key: string]: string | string[] | undefined;
  }>;