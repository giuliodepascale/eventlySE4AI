// components/events/prenotazione/reservation-list.tsx
import React from "react";
import Link from "next/link";
import { SafePrenotazioneEstesa } from "@/app/types";

interface Props {
  reservations: SafePrenotazioneEstesa[];
}

const ReservationList: React.FC<Props> = ({ reservations }) => {
  return (
    <>
      {reservations.map((res) => (
        <Link
          key={res.id}
          href={`/prenotazione/${res.id}`}
          className="bg-white rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg block"
        >
          {/* Se non hai coverImageUrl nel tipo eventInfo, rimuoviamo l'immagine */}
          {/* Altrimenti aggiungi `coverImageUrl` anche nel tipo SafePrenotazioneEstesa */}
          {/* <Image ... /> */}

          <div className="p-4">
            <h4 className="font-semibold text-lg">{res.eventInfo.title}</h4>
            <p className="text-sm text-gray-500">
              Data evento: {new Date(res.eventInfo.eventDate).toLocaleDateString()}
            </p>
            <p className="text-sm mt-2">
              Stato prenotazione:{" "}
              <span className="font-medium">{res.qrCode ? "Confermata" : "In attesa"}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Prenotata il {new Date(res.reservedAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </>
  );
};

export default ReservationList;
