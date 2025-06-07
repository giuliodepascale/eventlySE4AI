"use server"

import { Suspense } from "react";
import UpcomingEvents from "@/components/events/upcoming-events";
import Section from "@/components/events/section";
import NearbyEvents from "@/components/events/nearby-events";
import Loading from "../loading";
import { currentUser } from "@/lib/auth";
import { User } from "@prisma/client";
import DateFilterBar from "@/components/altre/date-filter-bar";

import AIComponent from "@/components/ML-AI/ai";
import { getCountLikeForCatagoryEventsByUser, getUserById } from "@/data/user";
import { SafeEvent } from "../types";
import { getAllActiveEvents } from "@/MONGODB/CRUD/events";

export default async function Home() {
  const user = await currentUser();
  const fullUser = user?.id ? await getUserById(user.id) : null;

  const allActiveEvents = await getAllActiveEvents();

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
          <AIComponent 
            user={fullUser} 
            events={allActiveEvents as unknown as SafeEvent[]} 
            categoryCount={categoryCount as Record<string, number> | null}
          />
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
