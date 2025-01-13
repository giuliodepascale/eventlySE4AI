"use client"

import React from "react";
import { SafeEvent } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { User } from "@prisma/client";

interface EventClientProps {
  organizer: User | null// user con il ruolo (Extended user definito nel file next-auth.d.ts)
  event: SafeEvent;
}

const EventClient: React.FC<EventClientProps> = ({ organizer, event }) => {
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-6xl ">
    <Image
      src={event.imageSrc}
      alt="Event Image"
      width={1000}
      height={1000}
      className="h-full min-h-[300px] object-cover object-center"
    />
    <div className="flex flex-col w-full gap-8 p-5 md:p-10">
      <div className="flex flex-col gap-6">
        <h2 className="h2-bold">{event.title}</h2>

        <div className="flex flex-col gap-3 sm:flex-row md:items-center">
          <div className="flex gap-3">
            <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
              {event.isFree ? "GRATIS" : `$${event.price}`}
            </p>
            <Link href={`/?category=${event.category}#events`}>
              <p className="hover:text-primary p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                #{event.category}
              </p>
            </Link>
          </div>
          <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
            By{" "}
            <Link
              href={`/profile/${organizer?.id}`}
              className="text-primary-500 "
            >
             {organizer?.name}
            </Link>
          </p>
        </div>
      </div>
      </div> </div>
      </>
      
  );
};

export default EventClient;
