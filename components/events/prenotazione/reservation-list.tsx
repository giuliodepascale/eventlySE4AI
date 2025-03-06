
import { Prenotazione, Event } from "@prisma/client";
import ReservationCard from "./reservation-card";

interface ReservationListProps {
    reservations: (Prenotazione & { event: Event })[];
    currentUser: any;
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations, currentUser }) => {
    return (
        <>
            {reservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} currentUser={currentUser} />
            ))}
        </>
    );
};

export default ReservationList;
