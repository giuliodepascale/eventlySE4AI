// components/events/NearbyEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventList from "@/components/events/events-list";
import { SafeNearbyEvent } from "@/app/types/nearby";
import { User } from "@prisma/client";
import ClientPagination from "@/components/altre/pagination";
import Link from "next/link";
import { Button } from "../ui/button";
import RequestLocation from "../location/request-location";
 // Importa il componente

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
  const [pageNearby, setPageNearby] = useState<number>(1);
  const [serverPage, setServerPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState(true);
  const eventsPerPage = 5;

  // Ascolta i messaggi inviati dalla WebView (dall'app Expo)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Messaggio ricevuto dalla WebView:", event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location' && data.coords) {
          setUserCoords(data.coords);
          setLoading(false);
        }
      } catch (error) {
        console.error("Errore nel parsing del messaggio:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fallback: se non riceviamo coordinate, usa navigator.geolocation
  useEffect(() => {
    if (!userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
  }, [userCoords]);

  // Ricarica gli eventi quando le coordinate o i filtri cambiano
  useEffect(() => {
    if (userCoords) {
      setNearbyEvents([]);
      setPageNearby(1);
      setServerPage(1);
      setHasMore(true);
      setLoading(true);

      const fetchNearbyEvents = async () => {
        try {
          const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
            category
          )}&query=${encodeURIComponent(query)}&limit=10&page=1`;
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
  if (!userCoords) return <div>Coordinate non disponibili.</div>;
  if (!nearbyEvents || nearbyEvents.length === 0)
    return (
      <>
        <div>Nessun evento trovato.</div>
        <Link href="/">
          <Button variant={"outline"} size={"default"}>
            Rimuovi i filtri
          </Button>
        </Link>
      </>
    );

  const startIndex = (pageNearby - 1) * eventsPerPage;
  const paginatedEvents = nearbyEvents.slice(startIndex, startIndex + eventsPerPage);
  const totalPages = Math.ceil(nearbyEvents.length / eventsPerPage);

  const fetchMoreEvents = async () => {
    const newServerPage = serverPage + 1;
    const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(
      category
    )}&query=${encodeURIComponent(query)}&limit=10&page=${newServerPage}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.events.length > 0) {
        setNearbyEvents((prev) => [...prev, ...data.events]);
        setServerPage(newServerPage);
        if (data.events.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      console.error("Errore nel caricamento degli eventi vicini.");
    }
  };

  return (
    <div>
      {/* Inserisci il componente che invia la richiesta di posizione */}
      <RequestLocation />
      <div
        key={pageNearby}
        className="pt-5 animate-slideIn grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8"
      >
        <EventList events={paginatedEvents} currentUser={currentUser as User} />
      </div>
      <ClientPagination totalPages={totalPages} page={pageNearby} setPage={setPageNearby} />
      {nearbyEvents.length >= eventsPerPage && (
        <div className="flex justify-center mt-4">
          <button
            disabled={!hasMore}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md transition ${
              !hasMore ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
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
