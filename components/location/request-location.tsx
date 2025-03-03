// components/RequestLocation.tsx
"use client";

import { useEffect } from "react";

// Estendi l'interfaccia globale per dichiarare la proprietà ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

const RequestLocation = () => {
  useEffect(() => {
    if (
      window.ReactNativeWebView &&
      typeof window.ReactNativeWebView.postMessage === "function"
    ) {
      console.log("Invio richiesta di posizione dalla pagina web");
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "request-location" })
      );
    } else {
      console.log("ReactNativeWebView non disponibile");
    }
  }, []);

  return null;
};

export default RequestLocation;
