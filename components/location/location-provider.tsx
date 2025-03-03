"use client";

import { useState, useEffect } from "react";
import NearbyEvents from "@/components/events/nearby-events";
import { User } from "@prisma/client";

interface LocationProviderProps {
  currentUser: User | null;
}

const LocationProvider: React.FC<LocationProviderProps> = ({ currentUser }) => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Funzione per ottenere la posizione
  const getLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Errore nel recupero della posizione:", error);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocalizzazione non supportata");
      setLoadingLocation(false);
    }
  };

  // Richiede la posizione al primo caricamento
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      {/* Pulsante per aggiornare la posizione */}
      <div className="flex justify-center my-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md transition hover:bg-blue-700"
          onClick={getLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? "Aggiornamento..." : "Aggiorna Posizione"}
        </button>
      </div>

      {/* Mostra gli eventi solo se abbiamo le coordinate */}
      {loadingLocation ? (
        <div className="text-center">Recupero posizione in corso...</div>
      ) : (
        <NearbyEvents currentUser={currentUser} userCoords={userCoords} />
      )}
    </div>
  );
};

export default LocationProvider;
