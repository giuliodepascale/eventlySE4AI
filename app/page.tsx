import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { Suspense } from "react";
import EventList from "@/components/events/events-list";
import Loading from "./loading";
import { User } from "@prisma/client";
import { getAllEvents } from "@/actions/event";
import { SearchParams } from "./types";
import NearbyEvents from "@/components/events/nearby-events";



export default async function Home(props: {searchParams: SearchParams}) {
  
 


  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const query = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";

  const [result, user] = await Promise.all([getAllEvents(
   query,
   13, //limit
   page,
   category,
   
   
  ), currentUser()]);


  let fullUser = null;
  if(user && user.id){
    fullUser = await getUserById(user.id);
  }

  if (!result.events || result.events.length === 0) {
  return <EmptyState showReset></EmptyState>;
  }

    
  return (
    <main>
      <Container>
      <h2 className=" text-2xl font-bold pt-24">I prossimi eventi</h2>
        <div
          className="
            pt-5
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
          
            <EventList events={result.events} currentUser={fullUser as User || null} /> 
          </Suspense>
          </div>
          </Container>
          {//<LocationPicker />
}
            {/* Sezione per gli eventi vicini, se disponibili */}
            {//nearbyResult.events && nearbyResult.events.length > 0 && (
            }
             <Container>
           
             <Suspense fallback={<Loading />}>
             
            <NearbyEvents
            currentUser={fullUser as User || null}
            />
            </Suspense>
              </Container>
  
    </main>
  );
}
