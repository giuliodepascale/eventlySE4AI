"use client";

import { SafeEvent } from '@/app/types';
import { User } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import EventCard from '../events/eventCard';
 // Assicurati che il percorso sia corretto

interface AIComponentProps {
  user: User | null;
  events: SafeEvent[];
  categoryCount: Record<string, number>;
}

const AIComponent: React.FC<AIComponentProps> = ({ user, events, categoryCount }) => {
  const [eventScores, setEventScores] = useState<{prediction: number}[]>([]);

  useEffect(() => {
    const fetchEventScores = async () => {
      if (user && events.length > 0) {
        try {
          const scores = await getEventScores(user, events, categoryCount);
          setEventScores(scores);
        } catch (error) {
          console.error('Errore nel recupero dei punteggi degli eventi:', error);
        }
      }
    };

    fetchEventScores();
  }, [user, events, categoryCount]);

  // Ordina gli eventi per punteggio in ordine decrescente
  const sortedEvents = eventScores
    .map((score, index) => ({ ...score, event: events[index] }))
    .sort((a, b) => b.prediction - a.prediction);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
      {sortedEvents.map((item, index) => (
        <div key={index}>
          <p>Punteggio: {item.prediction}</p>
          <EventCard data={item.event} currentUser={user} />
        </div>
      ))}
      </div>
    </div>
  );
};

export default AIComponent;

const processEventsForPrediction = (user: User, events: SafeEvent[], categoryCount: Record<string, number>) => {
  return events.map(event => {
    // Esempio: region_match come confronto tra user.region e event.region
    const region_match = user.regione === event.regione ? 1 : 0;
   
    // Usa categoryCount per determinare quanti eventi di questa categoria l'utente ha messo tra i preferiti
    const user_likes_for_category = categoryCount[event.category] || 0;
    
    // Esempio: event_popularity da un campo event.likes
    const event_popularity = event.favoriteCount || 0;

    return {
      region_match,
      user_likes_for_category,
      event_popularity
    };
  });
};

const getEventScores = async (user: User, events: SafeEvent[], categoryCount: Record<string, number>) => {
  const inputData = processEventsForPrediction(user, events, categoryCount);
  console.log(inputData);
  const response = await fetch('https://eventlyml.onrender.com/batch-predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData)
  });

  if (!response.ok) {
    throw new Error('Errore nella richiesta all\'API');
  }

  const results = await response.json();
  // results sarà un array con prediction e input_data per ogni evento
  return results;
};
