"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventList from "./events-list";
import { SafeNearbyEvent } from "@/app/types/nearby";
import { User } from "@prisma/client";
import ClientPagination from "../altre/pagination";

interface NearbyEventsProps {
  currentUser?: User | null;
}

const NearbyEvents: React.FC<NearbyEventsProps> = ({ currentUser }) => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const query = searchParams.get("query") || "";

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<SafeNearbyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [pageNearby, setPageNearby] = useState<number>(1); // Pagina locale (tra gli eventi già caricati)
  const [serverPage, setServerPage] = useState<number>(1); // Pagina delle chiamate API
  const eventsPerPage = 4; // Mostriamo solo 4 eventi per pagina locale

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
        },
        () => setLoading(false)
      );
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userCoords) {
      const fetchNearbyEvents = async () => {
        try {
          const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(category)}&query=${encodeURIComponent(query)}&limit=10&page=1`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.error) {
            setNearbyEvents([]);
          } else {
            setNearbyEvents(data.events as SafeNearbyEvent[]);
          }
        } catch {
          setNearbyEvents([]);
        } finally {
          setLoading(false);
        }
      };
      fetchNearbyEvents();
    }
  }, [userCoords, category, query]);

  if (loading) return null;
  if (!userCoords) return null;
  if (!nearbyEvents || nearbyEvents.length === 0) return <div>Nessun evento vicino trovato.</div>;

  // Paginazione locale: Mostriamo solo una parte degli eventi già caricati
  const startIndex = (pageNearby - 1) * eventsPerPage;
  const paginatedEvents = nearbyEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(nearbyEvents.length / eventsPerPage);

  // Funzione "Vedi Altro" per recuperare nuovi eventi dal server e sostituire quelli attuali
  const fetchMoreEvents = async () => {
    const newServerPage = serverPage + 1;
    const url = `/api/nearby-events?lat=${userCoords!.lat}&lng=${userCoords!.lng}&category=${encodeURIComponent(category)}&query=${encodeURIComponent(query)}&limit=10&page=${newServerPage}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.events.length > 0) {
        setNearbyEvents(data.events); // Sostituiamo gli eventi attuali con i nuovi eventi dal server
        setPageNearby(1); // Resettiamo la paginazione locale
        setServerPage(newServerPage); // Aggiorniamo la pagina delle chiamate API
      }
    } catch {
      console.error("Errore nel caricamento degli eventi vicini.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold pt-5">Eventi Vicini a Te</h2>
      <div className="pt-5 grid grid-cols-1 sm-grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
        <EventList events={paginatedEvents} currentUser={currentUser as User || null} />
      </div>

      {/* Paginazione locale per navigare tra eventi già caricati */}
      <ClientPagination totalPages={totalPages} page={pageNearby} setPage={setPageNearby} />

      {/* Bottone "Vedi Altro" per caricare più eventi dal server */}
      {nearbyEvents.length >= eventsPerPage && (
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={fetchMoreEvents}
          >
            Vedi Altro
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyEvents;
