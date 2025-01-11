import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import EventCard from "@/components/events/eventCard";
import { getEvents } from "@/data/event";
import { SafeEvent } from "./types";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";


export default async function Home() {
  const events = await getEvents();

  const user = await currentUser();

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
            mt-20
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
           {events.map((event: SafeEvent) => {
                return (
                  <EventCard 
                  currentUser={fullUser || null}
                  data={event}
                  key={event.id}
                  />
                )
              })}
        </div>
      </Container>
    </main>
  );
}
