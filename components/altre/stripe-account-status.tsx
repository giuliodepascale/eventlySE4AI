"use client";

import { useEffect, useState } from "react";

interface StripeAccountStatusProps {
  organizationId: string;
}

export default function StripeAccountStatus({ organizationId }: StripeAccountStatusProps) {
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [status, setStatus] = useState<null | {
    payouts_enabled: boolean;
    charges_enabled: boolean;
    details_submitted: boolean;
    stripeAccountId: string;
    requirements: string[];
  }>(null);

  const checkAccountStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/check-account-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (data.error) {
        alert("Errore: " + data.error);
      } else {
        setStatus(data);
      }
    } catch (error) {
      console.error("Errore durante il recupero dello stato dell'account Stripe:", error);
      alert("Errore imprevisto durante la verifica dell'account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginToStripe = async () => {
    setLoginLoading(true);
    try {
      const response = await fetch("/api/stripe/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
  
      const data = await response.json();
  
      if (data.url) {
        window.open(data.url, "_blank"); // ✅ Apre la dashboard in una nuova scheda
      } else {
        alert("Errore nell'accesso alla dashboard Stripe: " + data.error);
      }
    } catch (error) {
      console.error("Errore durante il login a Stripe:", error);
      alert("Errore imprevisto durante il login a Stripe.");
    } finally {
      setLoginLoading(false);
    }
  };
  

  useEffect(() => {
    checkAccountStatus();
  }, []);

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-semibold">Stato Account Stripe</h2>

      {loading ? (
        <p>Caricamento...</p>
      ) : status ? (
        <div className="mt-2">
          <p>🔹 **Account Stripe ID:** {status.stripeAccountId}</p>
          <p>🔹 **Può accettare pagamenti:** {status.charges_enabled ? "✅ Sì" : "❌ No"}</p>
          <p>🔹 **Può ricevere fondi:** {status.payouts_enabled ? "✅ Sì" : "❌ No"}</p>
          <p>🔹 **Dati inviati:** {status.details_submitted ? "✅ Completo" : "❌ Incompleto"}</p>

          {!status.payouts_enabled && (
            <div className="mt-4">
              <p className="text-red-600">
                ⚠️ Completa la verifica per ricevere i pagamenti sul tuo conto bancario.
              </p>
            </div>
          )}

          {/* ✅ Bottone per accedere alla dashboard Stripe */}
          <div className="mt-4">
            <button
              onClick={handleLoginToStripe}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loginLoading}
            >
              {loginLoading ? "Reindirizzamento..." : "Accedi alla Dashboard Stripe"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-red-500">⚠️ Nessun dato trovato per questo account.</p>
      )}
    </div>
  );
}
