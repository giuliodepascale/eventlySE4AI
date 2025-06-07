import {Event, Organization} from "@prisma/client"
import { TicketType } from "@prisma/client";



export type SafeEvent = Omit <
    Event,
    'createdAt' | 'eventDate'
> & {
    createdAt: string;
    eventDate: string;
    ticketTypes?: SafeTicketType[];

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



  
export type SafeTicketType = Omit<TicketType, "createdAt"> & {
  createdAt: string;
};


/**
 * SafePrenotazione rappresenta un modello di prenotazione "pulito" e serializzabile.
 * In particolare:
 * - 'reservedAt' è convertito in stringa ISO per facilitare la serializzazione JSON.
 * - Gli ID sono rappresentati come stringhe invece che come ObjectId di MongoDB.
 */
export type SafePrenotazione = {
  id: string;
  eventId: string;
  userId: string;
  reservedAt: string;
  qrCode: string;
};