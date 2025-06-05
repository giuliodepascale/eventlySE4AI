"use server";
/**
 * FILE: join-operation.ts
 * Descrizione: Utilizza l’operazione di aggregation ($lookup + $unwind + $project)
 * su MongoDB per unire i dati della collection “events” con la collection “organizations”.
 * Restituisce per ogni evento: titolo, data evento e alcuni campi dell’organizzazione (nome e regione).
 */

/** ––––––––––––––––––––––––––––––––––––––––––
 * IMPORTS
 * –––––––––––––––––––––––––––––––––––––––––– */
import clientPromise from "@/lib/mongoDB";

/** ***************************************************************************
 * JOIN: getEventsWithOrganizationData
 * Descrizione:
 *   - Connette al database “evently” tramite clientPromise.
 *   - Esegue un aggregation pipeline sulla collection “events”:
 *     1. $lookup: unisce la collection “organizations” (corrispondenza sui campi organizationId -> _id).
 *     2. $unwind: “estrae” il singolo documento di organization dal risultato array di $lookup.
 *     3. $project: seleziona solo i campi desiderati (title, eventDate, organizationInfo.name, organizationInfo.regione).
 *   - Ritorna un array di documenti con forma:
 *       {
 *         _id: ObjectId,               // ID evento
 *         title: string,               // Titolo evento
 *         eventDate: Date,             // Data evento
 *         organizationInfo: {
 *           _id: ObjectId,             // ID organizzazione
 *           name: string,              // Nome organizzazione
 *           regione: string            // Regione organizzazione
 *         }
 *       }
 *
 *
 */
export async function getEventsWithOrganizationData() {
  // 1. Ottieni il client MongoDB già connesso
  const client = await clientPromise;
  const db = client.db("evently");

  // 2. Definisci la pipeline di aggregation
  const pipeline = [
    {
      // $lookup: unisce “organizations” usando organizationId -> _id
      $lookup: {
        from: "organizations",        // Collection da unire
        localField: "organizationId", // Campo in “events”
        foreignField: "_id",          // Campo in “organizations”
        as: "organizationInfo",       // Nome del campo array di output
      },
    },
    {
      // $unwind: trasforma l’array di “organizationInfo” in un singolo oggetto
      $unwind: "$organizationInfo",
    },
    {
      // $project: seleziona solo i campi desiderati
      $project: {
        title: 1,
        eventDate: 1,
        "organizationInfo._id": 1,
        "organizationInfo.name": 1,
        "organizationInfo.regione": 1,
      },
    },
  ];

  // 3. Esegui l’aggregation e converte in array
  const result = await db.collection("events").aggregate(pipeline).toArray();

  // 4. Restituisci il risultato: array di documenti formattati
  return result;
}
