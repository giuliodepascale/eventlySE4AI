"use server"

import { Suspense } from "react";
import UpcomingEvents from "@/components/events/upcoming-events";
import Section from "@/components/events/section";
import NearbyEvents from "@/components/events/nearby-events";
import Loading from "../loading";
import { currentUser } from "@/lib/auth";
import { getUserByIdCached } from "@/lib/cache";
import { User } from "@prisma/client";
import DateFilterBar from "@/components/altre/date-filter-bar";
import { getAllActiveEventsNoLimits } from "@/data/event";
import AIComponent from "@/components/ML-AI/ai";
import { getCountLikeForCatagoryEventsByUser } from "@/data/user";

export default async function Home() {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserByIdCached(user.id) : null;

  const allActiveEvents = await getAllActiveEventsNoLimits();

  let categoryCount = null;
  if(fullUser?.id){
    categoryCount = await getCountLikeForCatagoryEventsByUser(user?.id as string);
  }
  // Renderizza immediatamente uno skeleton UI mentre i dati vengono caricati
  return (
    <main>
      <div className="pt-20">
        <DateFilterBar />
        <Section title="I prossimi eventi">
          <Suspense fallback={<Loading />}>
            <UpcomingEventsWrapper fullUser={fullUser} />
          </Suspense>
        </Section>
      </div>
      <Section title="Eventi Vicini a Te">
        <Suspense fallback={<Loading />}>
          <NearbyEventsWrapper fullUser={fullUser}/>
        </Suspense>
      </Section>

      
        <Suspense fallback={<Loading />}>
          {user && fullUser && fullUser.id &&
          <AIComponent user={fullUser} events={allActiveEvents} categoryCount={categoryCount as Record<string, number> | null}/>
        }
        </Suspense>
     
    </main>



  );
}

// Componenti wrapper per spostare il caricamento dei dati in componenti separati
async function UpcomingEventsWrapper({ fullUser }: { fullUser: User | null }) {
  return <UpcomingEvents currentUser={fullUser} />;
}

async function NearbyEventsWrapper({ fullUser }: { fullUser: User | null }) {
  return <NearbyEvents currentUser={fullUser} />;
}
