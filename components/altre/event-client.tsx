"use client"

import React from "react";
import { SafeEvent } from "@/app/types";
import { ExtendedUser } from "@/next-auth";
import { UserRole } from "@prisma/client";

interface EventClientProps {
  currentUser?: ExtendedUser | null// user con il ruolo (Extended user definito nel file next-auth.d.ts)
  event: SafeEvent;
}

const EventClient: React.FC<EventClientProps> = ({ currentUser, event }) => {
  return (
    <div className="event-client">
      <header className="event-client-header">
        <h1>{event?.title || "Event Details"}</h1>
        {event && (
          <p className="event-client-date">Date: {event.eventDate}</p>
        )}
      </header>

      <section className="event-client-details">
        {event ? (
          <div>
            <p>{event.description}</p>
            <p><strong>Location:</strong> {event.location}</p>
          </div>
        ) : (
          <p>No event details available.</p>
        )}
      </section>

      <section className="event-client-actions">
        {currentUser ? (
          <div>
            <p>Welcome, {currentUser.name}!</p>
            {currentUser.role === UserRole.ADMIN && (
              <button className="edit-event-button">Edit Event</button>
            )}
            <button className="join-event-button">Join Event</button>
          </div>
        ) : (
          <p>Please log in to interact with this event.</p>
        )}
      </section>
    </div>
  );
};

export default EventClient;
