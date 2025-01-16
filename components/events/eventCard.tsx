'use client';

import { useRouter } from "next/navigation";
import { SafeEvent } from "@/app/types";
import HeartButton from "../altre/heart-button";
import Image from "next/image";
import { User } from "@prisma/client";
import DateFormatter from "../altre/date-formatter";
import { Suspense } from "react";


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
        <Suspense>
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
                    
                    <Image 
                    alt="Evento"
                    src={data.imageSrc}
                    priority
                    fill
                    className="
                        object-cover
                        h-full
                        w-full
                        group-hover:scale-110
                        transition

                    "/>
                   
                    <div className="absolute top-3 right-3">
                        <HeartButton 
                            eventId={data.id}
                            currentUser={currentUser}
                            
                            />
                    </div>
                </div>
                <div className="font-semibold text-lg break-words">
                    {data.title}
                </div>
                <div className="font-light text-neutral-500">
                        <DateFormatter dateISO={data.eventDate} />
                       
                </div>
            
                        <div className="font-semibold">
                           {data.isFree ? "Ingresso libero" : `€${data.price}`}
                        </div>
                
            </div>
        </div>
        
        </Suspense>
    )
}

export default EventCard;