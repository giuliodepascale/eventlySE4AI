"use client"

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { SafeEvent, SafeOrganization, SafeTicketType } from "@/app/types";
import Image from "next/image";
import Link from "next/link";
import { User } from "@prisma/client";
import DateFormatter from "@/components/altre/date-formatter";
import { FcCalendar } from "react-icons/fc";
import { CiLocationOn } from "react-icons/ci";
import { FaInstagram, FaPen } from "react-icons/fa6";
import HeartButton from "@/components/altre/heart-button";
import Loader from "../loader";
import Map from "@/components/altre/map";
import EventList from "./events-list";
import TicketRow from "../typetickets/ticket-row";
import PrenotaOraButton from "./prenotazione/prenota-button";

interface EventClientProps {
  event: SafeEvent;
  organization?: SafeOrganization;
  currentUser?: User | null;
  relatedEventsCategory?: SafeEvent[];
  ticketTypes?: SafeTicketType[];
  reservationId?: string;
  children?: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, duration: 0.5 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const EventClient: React.FC<EventClientProps> = ({
  organization,
  event,
  currentUser,
  relatedEventsCategory,
  ticketTypes,
  reservationId,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 lg:px-12 xl:px-20">
        {/* Layout a due colonne per schermi grandi */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Colonna sinistra: Immagine dell'evento */}
          <motion.div
            variants={itemVariants}
            className="relative w-full h-[70vh] rounded-xl overflow-hidden shadow-2xl"
          >
            <Suspense fallback={<Loader />}>
              <Image
                src={event.imageSrc || (organization?.imageSrc || "/images/NERO500.jpg")}
                alt="Event Image"
                fill
                className="object-cover object-center transition-transform duration-700 ease-in-out hover:scale-105"
              />
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-full p-2 flex items-center space-x-1"
              >
                <HeartButton eventId={event.id} currentUser={currentUser} />
                <span className="text-white text-sm">{event.favoriteCount}</span>
              </motion.div>
            </Suspense>
          </motion.div>

          {/* Colonna destra: Dettagli dell'evento */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between bg-white p-8 rounded-xl shadow-xl"
          >
            <div>
              <motion.h1
                variants={itemVariants}
                className="text-4xl font-extrabold text-gray-800 mb-4"
              >
                {event.title}
              </motion.h1>
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4"
              >
                <Link
                  href={`/?category=${event.category}`}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-300"
                >
                  {event.category}
                </Link>
              </motion.div>
              
              {organization && (
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-gray-500 mb-4"
                >
                  Organizzato da{" "}
                  <Link
                    href={`/organization/${organization?.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {organization?.name}
                  </Link>
                </motion.p>
              )}
              
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-4"
              >
                <FcCalendar size={28} />
                <span className="text-lg text-gray-700">
                  <DateFormatter dateISO={event.eventDate} showDayName={true} />
                </span>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-4"
              >
                <CiLocationOn size={28} />
                <span className="text-lg text-gray-700">
                  {`${event.indirizzo}, ${event.comune}, ${event.provincia}`}
                </span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <FaPen size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-600">
                    Descrizione Evento
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            </div>
            
            {/* Sezione Biglietti - Renderizzata in modo condizionale */}
            {children || (
              <>
                {/* Bottone Checkout */}
                <motion.div variants={itemVariants} className="mt-6 space-y-3">
                  {currentUser?.id && ticketTypes && ticketTypes.length > 0 && (
                    ticketTypes.map((ticket: SafeTicketType) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                        <TicketRow typeTicket={ticket} userId={currentUser.id} />
                      </div>
                    ))
                  )}
                </motion.div>

                {event.isReservationActive && (
                  reservationId ? (
                    <Link href={`/prenotazione/${reservationId}`}>
                      <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
                        Vai alla tua prenotazione
                      </button>
                    </Link>
                  ) : (
                    <PrenotaOraButton eventId={event.id} userId={currentUser?.id || ""} />
                  )
                )}
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Sezione Mappa */}
        <Suspense fallback={<div className="mt-12 h-[300px] bg-gray-200 rounded-xl animate-pulse" />}>
          <motion.div
            variants={itemVariants}
            className="mt-12 rounded-xl overflow-hidden shadow-lg"
          >
            <Map placeName={`${event.indirizzo}, ${event.comune}, ${organization?.name || ''}`} />
          </motion.div>
        </Suspense>

        <motion.div variants={itemVariants} className="mt-6">
          <Link
            href={`/instagram-story/${event.id}`}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 hover:scale-105"
          >
            <FaInstagram size={20} />
            Genera Storia Instagram
          </Link>
        </motion.div>

        {/* Sezione Eventi Correlati - Renderizzata in modo condizionale */}
        {relatedEventsCategory && relatedEventsCategory.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mt-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-center mb-8"
            >
              Nella stessa categoria
            </motion.h2>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              <EventList events={relatedEventsCategory} currentUser={currentUser as User} />
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default EventClient;
