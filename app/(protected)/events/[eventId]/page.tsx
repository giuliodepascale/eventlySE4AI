// app/event/[eventId]/page.tsx
import { Suspense } from "react";


import { getActiveTicketsByEvent } from "@/data/ticket-type";
import { hasUserReservation } from "@/data/prenotazione";
import { currentUser } from "@/lib/auth";
import EventClient from "@/components/events/event-client";
import EmptyState from "@/components/altre/empty-state";
import TicketRow from "@/components/typetickets/ticket-row";
import Link from "next/link";
import PrenotaOraButton from "@/components/events/prenotazione/prenota-button";
import EventList from "@/components/events/events-list";
import type { SafeTicketType } from "@/app/types";
import type { User } from "@prisma/client";

import { getOrganizationById } from "@/MONGODB/CRUD/organization";
import type { SafeOrganization } from "@/app/types";
import { getEventById, getRelatedEventsByCategory } from "@/MONGODB/CRUD/events";
import { getUserById } from "@/data/user";


interface EventPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;
  const user = await currentUser();

  const [event, fullUser] = await Promise.all([
    getEventById(eventId as string),
    user?.id ? getUserById(user.id) : Promise.resolve(null),
  ]);

  if (!event) {
    return (
      <EmptyState
        title="Evento non trovato"
        subtitle="La pagina che stai cercando non esiste"
      />
    );
  }

  return (
    <EventClient
      event={event}
      currentUser={fullUser}
      ticketSection={
        <Suspense fallback={<>Caricamento biglietti...</>}>
          <TicketSection eventId={event.id} />
        </Suspense>
      }
      organizationSection={
        <Suspense fallback={<>Caricamento organizzatore...</>}>
          <OrganizationSection organizationId={event.organizationId} />
        </Suspense>
      }
      relatedEventsSection={
        <Suspense fallback={<>Caricamento eventi correlati...</>}>
          <RelatedEventsSection
            eventId={event.id}
            category={event.category}
            currentUser={fullUser as User | null}
          />
        </Suspense>
      }
    />
  );
}

async function TicketSection({ eventId }: { eventId: string }) {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserById(user.id) : null;

  if (!fullUser) {
    return (
      <EmptyState
        title="Effettua il login"
        subtitle="Per acquistare biglietti"
      />
    );
  }

  const event = await getEventById(eventId);
  const ticketTypes: SafeTicketType[] = await getActiveTicketsByEvent(
    eventId
  );

  const reservationId =
    event?.isReservationActive && fullUser.id
      ? (await hasUserReservation(fullUser.id, eventId)) || undefined
      : undefined;

  return (
    <div className="mt-6 space-y-3">
      {ticketTypes.map((ticket) => (
        <TicketRow key={ticket.id} typeTicket={ticket} userId={fullUser.id} />
      ))}

      {event?.isReservationActive &&
        (reservationId ? (
          <Link href={`/prenotazione/${reservationId}`}>
            <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Vai alla tua prenotazione
            </button>
          </Link>
        ) : (
          <PrenotaOraButton eventId={eventId} userId={fullUser.id} />
        ))}
    </div>
  );
}

async function OrganizationSection({ organizationId }: { organizationId: string }) {
  // getOrganizationById ora restituisce SafeOrganization o { error: string }
  const result = await getOrganizationById(organizationId);
  if (!result || "error" in result) {
    return null;
  }
  const organization: SafeOrganization = result;

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-4">
        Organizzato da{" "}
        <Link
          href={`/organization/${organization.id}`}
          className="text-blue-600 hover:underline"
        >
          {organization.name}
        </Link>
      </p>
    </div>
  );
}

async function RelatedEventsSection({
  eventId,
  category,
  currentUser,
}: {
  eventId: string;
  category: string;
  currentUser: User | null;
}) {
  const relatedEvents = await getRelatedEventsByCategory(
    category,
    5,
    eventId
  );

  if (!relatedEvents?.length) return null;

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Nella stessa categoria
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <EventList 
          events={relatedEvents} 
          currentUser={currentUser as User} 
        />
      </div>
    </div>
  );
}
