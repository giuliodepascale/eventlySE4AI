"use client";

import { SafeTicketType } from "@/app/types";
import { useState } from "react";

interface TicketRowProps {
  typeTicket: SafeTicketType
  userId: string;
}

export default function TicketRow({ typeTicket, userId }: TicketRowProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!userId) {
      alert("Devi essere loggato per acquistare un biglietto.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ ticketId: typeTicket.id, userId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Errore nel checkout: " + data.error);
      }
    } catch (error) {
      console.error("Errore durante il checkout:", error);
      alert("Errore imprevisto durante il checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col border-b py-4">
      <h3 className="text-lg font-semibold">{typeTicket.name}</h3>
      {typeTicket.description && <p className="text-sm text-gray-600 mb-2">{typeTicket.description}</p>}
      <p className="text-green-600 font-bold mb-2">€ {typeTicket.price.toFixed(2)}</p>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        {loading ? "Reindirizzamento..." : `Acquista ${typeTicket.name}`}
      </button>
    </div>
  );
}
