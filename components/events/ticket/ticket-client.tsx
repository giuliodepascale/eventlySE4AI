import QRCode from "react-qr-code";


interface TicketDetailsProps {
    ticket: any;
    fullUser: any;
}

export default function TicketDetails({ ticket, fullUser }: TicketDetailsProps) {
    return (
        <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900">🎟 Biglietto per {ticket.event.name}</h2>
            <p className="text-gray-600">Acquistato da: {fullUser.name} ({fullUser.email})</p>
            <p className="text-gray-600">Tipo: {ticket.ticketType.name}</p>
            <p className="text-gray-600">Prezzo: €{(ticket.paid / 100).toFixed(2)}</p>
            <p className={`text-sm font-semibold ${ticket.isValid ? "text-green-600" : "text-red-600"}`}>
                {ticket.isValid ? "✅ Valido" : "❌ Non valido"}
            </p>

            {/* QR Code */}
            <div className="mt-4">
                <QRCode value={ticket.qrCode} size={150} />
            </div>

            <p className="text-sm text-gray-500 mt-2">Scansiona il codice per validare l'ingresso.</p>
        </div>
    );
}
