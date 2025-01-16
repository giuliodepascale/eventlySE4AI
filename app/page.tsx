import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import { getEvents } from "@/data/event";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { Suspense } from "react";
import EventList from "@/components/events/events-list";
import Loading from "./loading";
import { User } from "@prisma/client";



export default async function Home() {
  const [events, user] = await Promise.all([getEvents(), currentUser()]);


  

  let fullUser = null;
  if(user && user.id){
    fullUser = await getUserById(user.id);
  }

  if (!events || events.length === 0)
    return <EmptyState showReset></EmptyState>;

  

  return (
    <main>
      <Container>
        <div
          className="
            pt-24
            grid
            grid-cols-1
            sm-grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
           <Suspense fallback={<Loading />}>
            <EventList events={events} currentUser={fullUser as User || null} />
          </Suspense>
              
        </div>
      </Container>
    </main>
  );
}
