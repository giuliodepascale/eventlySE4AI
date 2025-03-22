"use server"

import { Suspense } from "react";
import UpcomingEvents from "@/components/events/upcoming-events";
import Section from "@/components/events/section";
import NearbyEvents from "@/components/events/nearby-events";
import Loading from "../loading";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";

export default async function Home() {
  // Renderizza immediatamente uno skeleton UI mentre i dati vengono caricati
  return (
    <main>
      <div className="pt-20">
        <Section title="I prossimi eventi">
          <Suspense fallback={<Loading />}>
            <UpcomingEventsWrapper />
          </Suspense>
        </Section>
      </div>
      <Section title="Eventi Vicini a Te">
        <Suspense fallback={<Loading />}>
          <NearbyEventsWrapper />
        </Suspense>
      </Section>
    </main>
  );
}

// Componenti wrapper per spostare il caricamento dei dati in componenti separati
async function UpcomingEventsWrapper() {
  const user = await currentUser();
  const fullUser = await getUserById(user?.id || "");
  return <UpcomingEvents currentUser={fullUser} />;
}

async function NearbyEventsWrapper() {
  const user = await currentUser();
  const fullUser = await getUserById(user?.id || "");
  return <NearbyEvents currentUser={fullUser} />;
}
