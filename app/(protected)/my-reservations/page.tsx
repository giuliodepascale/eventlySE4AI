
import Loading from "@/app/loading";
import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import ReservationList from "@/components/events/prenotazione/reservation-list";


import { currentUser } from "@/lib/auth";
import { getPrenotazioniConDatiEventoByUser } from "@/MONGODB/join-operation";
import { Suspense } from "react";


const ReservationsPage = async () => {
    const user = await currentUser();
   
    if (!user || !user.id) {
        return (
            <EmptyState title="Non hai i permessi" subtitle="Effettua il login" />    
        );
    }

    const result = await getPrenotazioniConDatiEventoByUser(user.id);

    if (result.length === 0) {
        return (
            <EmptyState title="Non hai prenotazioni attive" subtitle="Prenota un evento ora!" showToHome />
        );
    }

    return (
        <>
            <h3 className="text-2xl font-bold text-center">
                Le tue prenotazioni
            </h3>

            <Container>
                <div
                    className="
                        pt-5 md:pt-2
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        md:grid-cols-3
                        lg:grid-cols-4
                        xl:grid-cols-5
                        2xl:grid-cols-6
                        gap-8
                    "
                >
                    <Suspense fallback={<Loading />}>
                       <ReservationList reservations={result} />
                    </Suspense>
                </div>
            </Container>
        </>
    );
}

export default ReservationsPage;
