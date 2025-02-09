"use client";

import { useState } from "react";
import EventList from "@/components/events/events-list";
import ClientPagination from "@/components/altre/pagination";
import { User } from "@prisma/client";
import { getAllEvents } from "@/actions/event";
import { SafeEvent } from "@/app/types";

interface ClientEventListProps {
  events: SafeEvent[];
  currentUser: User | null;
}

const ClientEventList: React.FC<ClientEventListProps> = ({ events, currentUser }) => {
  const [displayedEvents, setDisplayedEvents] = useState(events); // Mostriamo i primi eventi ricevuti
  const [page, setPage] = useState(1);
  const [serverPage, setServerPage] = useState(1); // Pagina per le chiamate API
  const eventsPerPage = 5;

  // Otteniamo solo gli eventi visibili nella pagina locale
  const startIndex = (page - 1) * eventsPerPage;
  const paginatedEvents = displayedEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(displayedEvents.length / eventsPerPage);

  // Funzione per recuperare più eventi dal server quando premiamo "Vedi Altro"
  const fetchMoreEvents = async () => {
    const newServerPage = serverPage + 1;
    const newEvents = await getAllEvents("", 10, newServerPage, ""); // Recuperiamo 10 eventi

    if (newEvents.events.length > 0) {
      setDisplayedEvents(newEvents.events); // Sostituiamo gli eventi attuali con i nuovi
      setPage(1); // Resettiamo la paginazione locale
      setServerPage(newServerPage); // Aggiorniamo la pagina server
    }
  };

  return (
    <div>
      <div className="pt-5 grid grid-cols-1 sm-grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        <EventList events={paginatedEvents} currentUser={currentUser as User} />
      </div>

      {/* Paginazione locale per navigare tra i 10 eventi già caricati */}
      <ClientPagination totalPages={totalPages} page={page} setPage={setPage} />

      {/* Bottone "Vedi Altro" per sostituire gli eventi visibili con nuovi eventi dal server */}
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={fetchMoreEvents}
        >
          Vedi Altro
        </button>
      </div>
    </div>
  );
};

export default ClientEventList;
