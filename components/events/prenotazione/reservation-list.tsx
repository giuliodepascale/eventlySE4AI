"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SafePrenotazioneEstesa } from "@/app/types";
import { deletePrenotazione } from "@/MONGODB/CRUD/prenotazione";


interface Props {
  reservations: SafePrenotazioneEstesa[];
}

const ReservationList: React.FC<Props> = ({ reservations }) => {
  const [localReservations, setLocalReservations] = useState(reservations);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Sei sicuro di voler annullare questa prenotazione?");
    if (!confirmed) return;

    try {
      await deletePrenotazione(id);
      setLocalReservations(prev => prev.filter(r => r.id !== id));
      alert("Prenotazione annullata con successo.");
    } catch (err) {
      console.error("Errore durante la cancellazione:", err);
      alert("Errore durante l'annullamento della prenotazione.");
    }
  };

  return (
    <>
      {localReservations.map((res) => (
        <div
          key={res.id}
          className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg block"
        >
          <Link href={`/prenotazione/${res.id}`}>
            <div className="p-4">
              <h4 className="font-semibold text-lg">{res.eventInfo.title}</h4>
              <p className="text-sm text-gray-500">
                Data evento: {new Date(res.eventInfo.eventDate).toISOString().slice(0, 10)}
              </p>
              <p className="text-sm mt-2">
                Stato prenotazione:{" "}
                <span className="font-medium">{res.qrCode ? "Confermata" : "In attesa"}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Prenotata il {new Date(res.reservedAt).toISOString().slice(0, 10)}
              </p>
            </div>
          </Link>

          <div className="px-4 pb-4">
            <button
              onClick={() => handleDelete(res.id)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Annulla prenotazione
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ReservationList;
