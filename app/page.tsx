
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { Suspense } from "react";
import Loading from "./loading";
import { SearchParams } from "./types";
import NearbyEvents from "@/components/events/nearby-events";

import UpcomingEvents from "@/components/events/upcoming-events";
import Section from "@/components/events/section";
import IpNearbyEvents from "@/components/events/ip-nearby-events";



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function Home(props: {searchParams: SearchParams}) {

  const user = await currentUser();


  let fullUser = null;
  if(user && user.id){
    fullUser = await getUserById(user.id);
  }





    
  return (
    <main>
      <div className="pt-20">
    <Section title="I prossimi eventi" >
      <Suspense fallback={<Loading />}>
        <UpcomingEvents currentUser={fullUser} />
      </Suspense>
    </Section>
    </div>
    <Section title="Eventi Vicini a Te">
      <Suspense fallback={<Loading />}>
        <NearbyEvents currentUser={fullUser} />
      </Suspense>
    </Section>
    <Section title="Eventi in base alla tua città">
      <Suspense fallback={<Loading />}>
        <IpNearbyEvents currentUser={fullUser} />
      </Suspense>
    </Section>
  </main>
  );
}
