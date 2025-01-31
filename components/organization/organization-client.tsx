// components/OrganizationClient.tsx

"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { User } from "@prisma/client";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaExternalLinkAlt } from "react-icons/fa";
import Loader from "../loader";
import { SafeOrganization } from "@/app/types";
import Map from "@/components/altre/map";

interface OrganizationClientProps {
  organizers: User[]; // Lista di organizzatori
  organization: SafeOrganization;
  currentUser?: User | null;
}


const OrganizationClient: React.FC<OrganizationClientProps> = ({ organizers, organization, currentUser }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[500px,1fr] 2xl:max-w-6xl">
      <Suspense fallback={<Loader />}>
        <div className="w-full h-[70vh] overflow-hidden rounded-xl relative flex-shrink-0">
          <Image
            src={organization.imageSrc || "/images/NERO500.jpg"} // Immagine predefinita se non fornita
            priority
            alt="Organization Image"
            fill
            className="object-cover object-center w-full h-full"
          />
        </div>
      </Suspense>
      <div className="flex flex-col w-full gap-8 p-5 md:p-10">
        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-bold text-black break-words">{organization.name}</h2>

          <div className="flex flex-col gap-3 sm:flex-row md:items-center">
            {organization.email && (
              <div className="flex items-center gap-2">
                <FaEnvelope size={20} className="text-gray-600" />
                <a href={`mailto:${organization.email}`} className="text-primary-500 hover:underline">
                  {organization.email}
                </a>
              </div>
            )}
            {organization.phone && (
              <div className="flex items-center gap-2">
                <FaPhone size={20} className="text-gray-600" />
                <a href={`tel:${organization.phone}`} className="text-primary-500 hover:underline">
                  {organization.phone}
                </a>
              </div>
            )}
            {organization.indirizzo && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt size={20} className="text-gray-600" />
                <span className="text-gray-700">{organization.indirizzo}</span>
              </div>
            )}
            {organization.linkEsterno && (
              <div className="flex items-center gap-2">
                <FaExternalLinkAlt size={20} className="text-gray-600" />
                <a href={organization.linkEsterno} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                  Visita Sito
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 text-gray-700">
            {organization.description || "Nessuna descrizione disponibile."}
          </div>
        </div>

       

        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold text-black">Organizzatori</h3>
          <ul className="flex flex-col gap-3">
            {organizers.length > 0 ? (
              organizers.map((organizer) => (
                <li key={organizer.id} className="flex items-center gap-3">
                  <div>
                    {organizer.name || "Senza Nome"}
                    <p className="text-sm text-gray-600">{organizer.email}</p>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Nessun organizzatore trovato.</p>
            )}
          </ul>
        </div>

        {currentUser && organizers.some((org) => org.id === currentUser.id) && (
          <Link href={`/organizations/edit/${organization.id}`}>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
              Modifica Organizzazione
            </button>
          </Link>
        )}
        
        {organization.linkMaps &&
          <Map src={organization.linkMaps}/>
        }
      </div>
    </div>
  );
};

export default OrganizationClient;
