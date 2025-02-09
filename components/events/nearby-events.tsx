// components/events/nearbyEvents.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventList from "./events-list";
import { SafeNearbyEvent } from "@/app/types/nearby";
import { User } from "@prisma/client";

interface NearbyEventsProps {
  currentUser?: User | null;
}

const NearbyEvents: React.FC<NearbyEventsProps> = ({ currentUser }) => {
  // Acchiappa i parametri di ricerca dal URL (categoria, query, ecc.)
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const query = searchParams.get("query") || "";

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<SafeNearbyEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Otteniamo la posizione dell'utente come si faceva una volta con navigator.geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
        },
        () => {
          // Se l'utente non dà il permesso, non lanciamo errori, semplicemente smettiamo di caricare
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  // Effettua il fetch degli eventi vicini includendo i parametri di ricerca
  useEffect(() => {
    if (userCoords) {
      const fetchNearbyEvents = async () => {
        try {
          // Costruiamo l'URL includendo lat, lng, categoria e query
          const url = `/api/nearby-events?lat=${userCoords.lat}&lng=${userCoords.lng}&category=${encodeURIComponent(category)}&query=${encodeURIComponent(query)}`;
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

  if (loading) {
    return null;
  }

  // Se non abbiamo ottenuto le coordinate, non mostriamo niente
  if (!userCoords) {
    return null;
  }

  if (!nearbyEvents || nearbyEvents.length === 0) {
    return <div>Nessun evento vicino trovato.</div>;
  }

  return (
    <div>
        <h2 className="text-2xl font-bold pt-5">Eventi Vicini a Te</h2>
      <div
        className="
          pt-2
          grid
          grid-cols-1
          sm-grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
      >
      
        <EventList events={nearbyEvents} currentUser={currentUser as User || null} />
      </div>
    </div>
  );
};

export default NearbyEvents;
