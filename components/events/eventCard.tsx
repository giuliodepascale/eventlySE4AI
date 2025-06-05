"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import HeartButton from "../altre/heart-button";
import { SafeEvent } from "@/app/types";
import { User } from "@prisma/client";
import DateFormatter from "../altre/date-formatter";
import { FaEdit } from "react-icons/fa";
import { deleteEvent } from "@/MONGODB/CRUD/events";


interface EventCardProps {
  data: SafeEvent & Partial<{ distance: number }>;
  currentUser?: User | null;
  isEventCreator?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ data, currentUser, isEventCreator }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const categoryLink =
    currentCategory === data.category ? "/" : `/?category=${data.category}`;

  return (
    <Suspense>
      <div
        className="
          group 
          block 
          overflow-hidden 
          rounded-xl 
          border 
          border-neutral-200 
          shadow-sm
          hover:shadow-md 
          transition-shadow 
          p-4
          bg-white 
          text-neutral-800
        "
      >
        <Link href={`/events/${data.id}`}>
          <div
            className="
              relative 
              aspect-square 
              w-full 
              overflow-hidden 
              rounded-lg
              mb-4
            "
          >
            <Image
              alt="Evento"
              src={data.imageSrc || "/images/NERO500.jpg"}
              priority
              fill
              className="
                object-cover 
                transition-transform 
                duration-300 
                group-hover:scale-110
              "
            />
            {isEventCreator ? (
              <div className="absolute right-2 top-2 flex flex-row-reverse items-center gap-2 transition-all">
                {/* Modifica */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/events/${data.id}/update/${data.organizationId}`);
                  }}
                  className="flex items-center justify-center p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors duration-200"
                  title="Modifica"
                >
                  <FaEdit width={20} height={20} />
                </button>

                {/* Elimina */}
                <form
                  action={async () => {
                    await deleteEvent(data.id);
                    alert("Evento eliminato con successo.");
                    router.refresh();
                  }}
                >
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.stopPropagation();
                      const confirmed = window.confirm(
                        "Sei sicuro di voler eliminare questo evento?"
                      );
                      if (!confirmed) e.preventDefault();
                    }}
                    className="flex items-center justify-center p-3 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md transition-colors duration-200"
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </form>
              </div>
            ) : (
              <div className="absolute top-3 right-3">
                <HeartButton eventId={data.id} currentUser={currentUser} />
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-1 break-words line-clamp-2">
            {data.title}
          </h3>
        </Link>

        <Link
          href={categoryLink}
          className="
            inline-block 
            mb-2 
            px-3 
            py-1 
            rounded-full 
            text-sm 
            font-medium 
            bg-gray-100 
            text-gray-600 
            hover:bg-gray-200
          "
        >
          {data.category}
        </Link>

        <Link href={`/events/${data.id}`}>
          <div className="text-sm text-neutral-500 mb-2">
            <DateFormatter dateISO={data.eventDate} showDayName />
          </div>

          {data.distance !== undefined && (
            <div className="text-sm text-gray-500 mt-1">
              Distanza: {data.distance.toFixed(2)} km
            </div>
          )}
        </Link>

        {isEventCreator && (
          <Link href={`/events/${data.id}/ticket-management/${data.organizationId}`}>
            Gestisci Biglietteria
          </Link>
        )}
      </div>
    </Suspense>
  );
};

export default EventCard;
