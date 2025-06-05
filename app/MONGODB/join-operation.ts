"use server";

import clientPromise from "@/lib/mongoDB";

export async function getEventsWithOrganizationData() {
    const client = await clientPromise;
    const db = client.db("evently"); // Nome del DB, cambialo se necessario
  
    const result = await db.collection("events").aggregate([
      {
        $lookup: {
          from: "organizations",            // Nome della collection da unire
          localField: "organizationId",     // Chiave nei documenti `events`
          foreignField: "_id",              // Chiave nei documenti `organizations`
          as: "organizationInfo"            // Output array con dati dell'organizzazione
        }
      },
      {
        $unwind: "$organizationInfo"        // Rende i dati dell'organizzazione un singolo oggetto
      },
      {
        $project: {
          title: 1,
          eventDate: 1,
          "organizationInfo.name": 1,
          "organizationInfo.regione": 1,
        }
      }
    ]).toArray();
  
    return result;
  }
  
  