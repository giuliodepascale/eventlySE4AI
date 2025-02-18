"use client";

import { SafeEvent } from "@/app/types";
import { useState } from "react";

interface CheckoutButtonProps {
    event: SafeEvent;
    userId: string;
  }

export default function CheckoutButton({ event, userId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!userId) {
      alert("Devi essere loggato per acquistare un biglietto.");
      return;
    }
  
    if (event.noTickets) {
      alert("Questo evento è gratuito!");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        body: JSON.stringify({ eventId: event.id, userId }),
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
  
      console.log("🔍 Checkout Session Response:", data); // ✅ LOG
      if (data.url) {
        window.location.href = data.url; // ✅ Reindirizza all'URL corretto di Stripe
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
  

  if (event.noTickets) return null;

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      {loading ? "Reindirizzamento..." : `Acquista Biglietto (€${event.price})`}
    </button>
  );
}
