import { Suspense } from "react";
import { getOrganizationById } from "@/actions/organization";
import { SafeEvent, SafeOrganization, SafeTicketType } from "@/app/types";
import EmptyState from "@/components/altre/empty-state";
import EventClient from "@/components/events/event-client";
// You'll need to create this
import { getEventById, getRelatedEventsByCategory } from "@/data/event";
import { hasUserReservation } from "@/data/prenotazione";
import { getActiveTicketsByEvent } from "@/data/ticket-type";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import EventSkeleton from "@/components/events/event-skeleton";

interface EventPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  // Fetch the event first as it's critical
  const event = await getEventById(eventId as string || '');

  if (!event) {
    return (
      <EmptyState title="Evento non trovato" subtitle="La pagina che stai cercando non esiste " />
    );
  }

  // Return the page shell immediately with Suspense boundaries
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventDetails eventId={event.id} event={event} />
    </Suspense>
  );
}

// Move the heavy data fetching to a separate component
async function EventDetails({ eventId, event }: { eventId: string, event: SafeEvent }) {
  // Fetch all data in parallel
  const [organizerPromise, userPromise, relatedEventsPromise, ticketTypesPromise] = await Promise.allSettled([
    getOrganizationById(event.organizationId),
    currentUser().then(user => user?.id ? getUserById(user.id) : null),
    getRelatedEventsByCategory(event.category, 5, event.id),
    getActiveTicketsByEvent(event.id)
  ]);

  // Extract results
  const organizer = organizerPromise.status === 'fulfilled' ? organizerPromise.value : { organization: null };
  const fullUser = userPromise.status === 'fulfilled' ? userPromise.value : null;
  const relatedEventsCategory = relatedEventsPromise.status === 'fulfilled' ? relatedEventsPromise.value : [];
  const ticketTypes = ticketTypesPromise.status === 'fulfilled' ? ticketTypesPromise.value : [];

  // Check if user is authenticated
  if (!fullUser) {
    return (
      <EmptyState title="Effettua il login" subtitle="Qualcosa è andato storto" showToHome />
    );
  }

  // Check for reservation in parallel with rendering
  let reservationId: string | undefined = undefined;
  if (event.isReservationActive && fullUser?.id) {
    reservationId = await hasUserReservation(fullUser.id, event.id) || undefined;
  }

  return (
    <EventClient
      event={event as SafeEvent}
      organization={organizer.organization as SafeOrganization}
      currentUser={fullUser || null}
      relatedEventsCategory={relatedEventsCategory}
      ticketTypes={ticketTypes as SafeTicketType[]}
      reservationId={reservationId}
    />
  );
}

