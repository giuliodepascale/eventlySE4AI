import {Event, Reservation} from "@prisma/client"



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

export type SearchParams = Promise<{
    [key: string]: string | string[] | undefined;
  }>;