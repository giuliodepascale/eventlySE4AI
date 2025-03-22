import { Suspense } from "react";
import { getOrganizationById } from "@/actions/organization";
import { SafeEvent, SafeTicketType } from "@/app/types";
import EmptyState from "@/components/altre/empty-state";
import EventClient from "@/components/events/event-client";

import { getEventById, getRelatedEventsByCategory } from "@/data/event";
import { hasUserReservation } from "@/data/prenotazione";
import { getActiveTicketsByEvent } from "@/data/ticket-type";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { User } from "@prisma/client";
import TicketRow from "@/components/typetickets/ticket-row";
import Link from "next/link";
import PrenotaOraButton from "@/components/events/prenotazione/prenota-button";
import EventList from "@/components/events/events-list";

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

  // Return the page shell immediately with the event data
  return (
    <EventClient event={event as SafeEvent}>
      <Suspense fallback={<TicketSectionSkeleton />}>
        <TicketSection eventId={event.id} />
      </Suspense>
      
      <Suspense fallback={<OrganizationSectionSkeleton />}>
        <OrganizationSection organizationId={event.organizationId} />
      </Suspense>
      
      <Suspense fallback={<RelatedEventsSkeleton />}>
        <RelatedEventsSection eventId={event.id} category={event.category} />
      </Suspense>
    </EventClient>
  );
}

// Ticket section skeleton that matches the actual ticket UI
function TicketSectionSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {/* Ticket item skeleton */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        
          </div>
      
     
      
      {/* Reservation button skeleton */}
      <div className="h-10 w-full sm:w-64 bg-green-200 rounded-md"></div>
    </div>
  );
}

// Organization section skeleton
function OrganizationSectionSkeleton() {
  return (
    <div className="mt-4">
      <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
    </div>
  );
}

// Related events section skeleton
function RelatedEventsSkeleton() {
  return (
    <div className="mt-16 space-y-6">
      <div className="h-8 w-64 bg-white border border-gray-100 rounded-md mx-auto animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-48 bg-white"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-white border border-gray-100 rounded-md"></div>
              <div className="h-4 w-1/2 bg-white border border-gray-100 rounded-md"></div>
              <div className="h-8 w-24 bg-white border border-gray-100 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Separate component for ticket information
async function TicketSection({ eventId }: { eventId: string }) {
  const user = await currentUser();
  let fullUser = null;
  
  if (user && user.id) {
    fullUser = await getUserById(user.id);
  } else {
    return <EmptyState title="Effettua il login" subtitle="Per acquistare biglietti" />;
  }
  
  const event = await getEventById(eventId);
  const ticketTypes = await getActiveTicketsByEvent(eventId);
  
  let reservationId: string | undefined = undefined;
  if (event?.isReservationActive && fullUser?.id) {
    reservationId = await hasUserReservation(fullUser.id, eventId) || undefined;
  }
  
  return (
    <div className="mt-6">
      {fullUser?.id && ticketTypes && ticketTypes.length > 0 && (
        ticketTypes.map((ticket: SafeTicketType) => (
          <TicketRow key={ticket.id} typeTicket={ticket} userId={fullUser.id} />
        ))
      )}
      
      {event?.isReservationActive && (
        reservationId ? (
          <Link href={`/prenotazione/${reservationId}`}>
            <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Vai alla tua prenotazione
            </button>
          </Link>
        ) : (
          <PrenotaOraButton eventId={eventId} userId={fullUser?.id || ""} />
        )
      )}
    </div>
  );
}

// Separate component for organization information
async function OrganizationSection({ organizationId }: { organizationId: string }) {
  const organizer = await getOrganizationById(organizationId);
  
  return (
    <div className="mt-4">
      {organizer.organization && (
        <p className="text-sm text-gray-500 mb-4">
          Organizzato da{" "}
          <Link
            href={`/organization/${organizer.organization.id}`}
            className="text-blue-600 hover:underline"
          >
            {organizer.organization.name}
          </Link>
        </p>
      )}
    </div>
  );
}

// Separate component for related events
async function RelatedEventsSection({ eventId, category }: { eventId: string, category: string }) {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserById(user.id) : null;
  const relatedEvents = await getRelatedEventsByCategory(category, 5, eventId);
  
  if (!relatedEvents || relatedEvents.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Nella stessa categoria
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <EventList events={relatedEvents} currentUser={fullUser as User} />
      </div>
    </div>
  );
}

