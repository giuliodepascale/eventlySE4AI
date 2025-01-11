'use client';

import { useRouter } from "next/navigation";
import { SafeEvent } from "@/app/types";
import HeartButton from "../altre/heart-button";
import Image from "next/image";
import { User } from "@prisma/client";
import DateFormatter from "../altre/date-formatter";
import { Suspense } from "react";
import Loading from "@/app/loading";

interface EventCardProps {
    data: SafeEvent;
    currentUser?: User | null
}

const EventCard:React.FC<EventCardProps> = ({
    data,
    currentUser
}) => {

    const router = useRouter()


// Crea un oggetto Date a partire dalla stringa ISO



    return (
        <div 
        onClick={()=> router.push(`/events/${data.id}`)}
        className="
            col-span-1 cursor-pointer group p-4  border transition rounded-xl
        ">
            <div className="flex flex-col gap-2 w-full">
                <div className="
                    aspect-square
                    w-full
                    relative
                    overflow-hidden
                    rounded-xl
                ">
                    <Suspense fallback={<Loading />}>
                    <Image 
                    alt="Evento"
                    src={data.imageSrc}
                    fill
                    className="
                        object-cover
                        h-full
                        w-full
                        group-hover:scale-110
                        transition

                    "/>
                    </Suspense>
                    <div className="absolute top-3 right-3">
                        <HeartButton 
                            eventId={data.id}
                            currentUser={currentUser}
                            
                            />
                    </div>
                </div>
                <div className="font-semibold text-lg">
                    {data.title}
                </div>
                <div className="font-light text-neutral-500">
                        <DateFormatter dateISO={data.eventDate} />
                       
                </div>
            
                        <div className="font-semibold">
                            Ingresso € {data.price}
                        </div>
                
            </div>
        </div>
        
      
    )
}

export default EventCard;