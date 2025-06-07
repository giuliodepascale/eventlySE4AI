// components/events/prenotazione/prenotazione-client.tsx
import QRCodeDisplay from "@/components/events/prenotazione/qrcode";

interface BookingDetailsProps {
  prenotazione: {
    id: string;
    userId: string;
    eventId: string;
    reservedAt: string;
    qrCode: string;
  };
  fullUser: {
    name?: string;
  } | null;
}

export default function BookingDetails({ prenotazione, fullUser }: BookingDetailsProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-2xl w-full bg-white bg-opacity-10 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-10">
        <h1 className="text-4xl font-bold text-center mb-6">🎟️ Prenotazione Confermata!</h1>

        <div className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md space-y-4">
          <p className="text-lg">
            <strong>📄 ID Prenotazione:</strong> <span className="font-mono">{prenotazione.id}</span>
          </p>
          <p className="text-lg">
            <strong>👤 Utente:</strong> {fullUser?.name || "Utente sconosciuto"}
          </p>
          <p className="text-lg">
            <strong>📅 Data Prenotazione:</strong>{" "}
            <span className="font-mono">{new Date(prenotazione.reservedAt).toLocaleString()}</span>
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mt-6">
          <h2 className="text-xl font-semibold mb-2">📌 Mostra questo codice quando entri</h2>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <QRCodeDisplay value={prenotazione.qrCode} />
          </div>
          <p className="text-sm mt-2 opacity-80">Scansiona il codice per accedere</p>
        </div>

        <p className="text-center text-sm opacity-70 mt-6">📩 Hai domande? Contatta il supporto Evently.</p>
      </div>
    </div>
  );
}
