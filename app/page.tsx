import Container from "@/components/altre/container";
import EmptyState from "@/components/altre/empty-state";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { Suspense } from "react";
import Loading from "./loading";
import { User } from "@prisma/client";
import { getAllEvents } from "@/actions/event";
import { SearchParams } from "./types";
import NearbyEvents from "@/components/events/nearby-events";

import ClientEventList from "@/components/altre/client-event-list";



export default async function Home(props: {searchParams: SearchParams}) {

  const searchParams = await props.searchParams;
  const query = (searchParams?.query as string) || "";
  const category = (searchParams?.category as string) || "";
  

  const [result, user] = await Promise.all([getAllEvents(
   query,
   10, //limit
   1,
   category,
   
   
  ), currentUser()]);


  let fullUser = null;
  if(user && user.id){
    fullUser = await getUserById(user.id);
  }

  if (!result.events || result.events.length === 0) {
  return <EmptyState showReset></EmptyState>;
  }



  {
    // INIZIO PAGINAZIONEEEE
  }



    
  return (
    <main>
      <Container>
      <h2 className=" text-2xl font-bold pt-24">I prossimi eventi</h2>
       
        
           
           <Suspense fallback={<Loading />}>
          
           <ClientEventList events={result.events} currentUser={fullUser} />
          </Suspense>
          </Container>
          {/* ClientPagination usa "page_main" per questa lista */}
          
       
          
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
