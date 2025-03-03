// components/RequestLocation.tsx
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
  useEffect(() => {
    // Controlla se siamo all'interno di una WebView di React Native
    if (
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === "function"
    ) {
      console.log("Invio richiesta di posizione dalla pagina web");
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "request-location" })
      );
    } else {
      console.log("ReactNativeWebView non disponibile nella pagina web");
    }
  }, []);

  return null;
};

export default RequestLocation;
