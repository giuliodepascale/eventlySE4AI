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
import { FaPen } from "react-icons/fa6";
import HeartButton from "@/components/altre/heart-button";
import Loader from "../loader";
import Map from "@/components/altre/map";
import EventList from "./events-list";
import TicketRow from "../typetickets/ticket-row";


interface EventClientProps {
  organization: SafeOrganization;
  event: SafeEvent;
  currentUser?: User | null;
  relatedEventsCategory?: SafeEvent[];
  ticketTypes?: SafeTicketType[];
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
}) => {

  console.log(ticketTypes);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Container centrato con padding orizzontale reattivo:
          px-4 di default, lg:px-12 per schermi grandi e xl:px-20 per extra-large */}
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
                src={event.imageSrc || organization.imageSrc || "/images/NERO500.jpg"}
                alt="Event Image"
                fill
                className="object-cover object-center transition-transform duration-700 ease-in-out hover:scale-105"
                priority
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
                <span
                  className="px-4 py-2 rounded-full font-semibold bg-green-100 text-green-700"
                >
                  {event.noTickets ? "Ingresso libero" : `€  Inserire prezzo `}
                </span>
                <Link
                  href={`/?category=${event.category}`}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition duration-300"
                >
                  {event.category}
                </Link>
              </motion.div>
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
              {/* Blocco Descrizione spostato PRIMA del CheckoutButton */}
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
            {/* Bottone Checkout */}
            <motion.div variants={itemVariants} className="mt-6">
  {currentUser?.id && ticketTypes && ticketTypes.length > 0 ? (
    ticketTypes.map((ticket: SafeTicketType) => (
      <TicketRow key={ticket.id} typeTicket={ticket} userId={currentUser.id} />
    ))
  ) : (
    <p className="text-gray-500 text-sm">Nessun biglietto disponibile.</p>
  )}
</motion.div>

        </motion.div>
           
          </motion.div>
      

        {/* Sezione Mappa */}
        <motion.div
          variants={itemVariants}
          className="mt-12 rounded-xl overflow-hidden shadow-lg"
        >
          <Map placeName={`${event.indirizzo}, ${event.comune}, ${organization.name}`} />
        </motion.div>

        {/* Sezione EventList: Eventi correlati */}
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
            <EventList events={relatedEventsCategory || []} currentUser={currentUser as User} />
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default EventClient;
