
"use client";

import { useEffect } from "react";

// Estendiamo l'interfaccia globale per TypeScript
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

const RequestLocation = () => {
  const sendRequest = () => {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
      console.log("Invio richiesta di posizione dalla pagina web tramite bottone");
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "request-location" })
      );
    } else {
      console.log("ReactNativeWebView non disponibile nella pagina web");
    }
  };

  useEffect(() => {
    console.log("RequestLocation montato");
    // Prova a inviare subito la richiesta all'avvio (opzionale)
    sendRequest();
  }, []);

  return (
    <div style={{ padding: "10px", background: "#f9f9f9", textAlign: "center" }}>
      <p>Premi il bottone per richiedere la posizione:</p>
      <button onClick={sendRequest}>Richiedi Posizione</button>
    </div>
  );
};

export default RequestLocation;
