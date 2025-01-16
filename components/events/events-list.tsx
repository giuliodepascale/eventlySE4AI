"use client";
import EventCard from "@/components/events/eventCard";
import { SafeEvent } from "@/app/types";
import { User } from "@prisma/client";


interface EventListProps {
  events: SafeEvent[];
  currentUser: User; 
}

const EventList: React.FC<EventListProps> = ({ events, currentUser }) => {
  return (
    <>
      
      {events.map((event: SafeEvent) => (
        <EventCard key={event.id} data={event} currentUser={currentUser} />
      ))}
      
    </>
  );
};

export default EventList;
