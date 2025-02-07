"use client"

import React, { Suspense } from "react";
import { SafeEvent, SafeOrganization } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { User } from "@prisma/client";
import DateFormatter from "@/components/altre/date-formatter";
import { FcCalendar } from "react-icons/fc";
import { CiLocationOn } from "react-icons/ci";
import { FaPen } from "react-icons/fa6";
import HeartButton from "@/components/altre/heart-button";
import Loader from "../loader";
import Map from "@/components/altre/map";




interface EventClientProps {
  organization: SafeOrganization// user con il ruolo (Extended user definito nel file next-auth.d.ts)
  event: SafeEvent;
  currentUser?: User | null
}

const EventClient: React.FC<EventClientProps> = ({ organization, event, currentUser }) => {
 
  return (
    <>
     
      <div className="grid grid-cols-1 md:grid-cols-[500px,1fr] 2xl:max-w-6xl">
      <Suspense fallback={<Loader/>}>
        <div className="w-full h-[70vh] overflow-hidden
        rounded-xl
        relative flex-shrink-0">
          <Image
            src={event.imageSrc || organization.imageSrc || "/images/NERO500.jpg"}
            priority
            alt="Event Image"
            fill
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute top-5 right-5 flex items-center space-x-2  bg-black bg-opacity-75  rounded-full px-2 py-1">
              <HeartButton eventId={event.id} currentUser={currentUser} />
              <p className="text-white  text-sm font-medium">{event.favoriteCount}</p>
          </div>
        </div>
        </Suspense>
        <div className="flex flex-col w-full gap-8 p-5 md:p-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-bold text-black break-words">{event.title}</h2>
  
            <div className="flex flex-col gap-3 sm:flex-row md:items-center">
              <div className="flex gap-3">
                <p className={`rounded-full px-5 py-2 ${event.isFree ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                  {event.isFree ? "Ingresso libero" : `€${event.price}`}
                </p>
                <Link href={`/?category=${event.category}`}>
                  <p className="hover:text-primary rounded-full bg-gray-100 px-4 py-2.5 text-gray-500">
                    {event.category}
                  </p>
                </Link>
              </div>
              <p className="mt-2 ml-2 text-sm text-gray-700 sm:mt-0">
                By{" "}
                <Link href={`/organization/${organization?.id}`} className="text-primary-500">
                  {organization?.name}
                </Link>
              </p>
            </div>
          </div>
  
          <div className="flex flex-col gap-5">
            <div className="flex gap-2 md:gap-3">
              <FcCalendar size={24} />
              <div className="flex flex-col items-center text-sm">
              <p className="font-bold text-lg text-gray-600"> <DateFormatter dateISO={event.eventDate} showDayName={true} /></p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CiLocationOn size={24} />
              <p className="font-bold text-lg text-gray-600 break-words">{event.indirizzo}, {event.comune}, {event.provincia}</p>
            </div>
          </div>
  
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <FaPen size={20} />
              <p className="font-bold text-gray-600">Descrizione Evento</p>
            </div>
            <p className="text-sm text-gray-700 break-words">{event.description}</p>

            <Map placeName={`${event.indirizzo}, ${event.comune}, ${organization.name}`} />

          </div>
        </div>
      </div>
    </>
  );
}
export default EventClient;
  