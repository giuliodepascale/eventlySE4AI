"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";

interface OrganizationCardProps {
  id: string;
  name: string;
  imageSrc?: string;
  isOrganizationCreator?: boolean;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ id, name, imageSrc }) => {
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
        {/* Link per l'organizzazione (immagine + nome) */}
        <Link href={`/organization/manage-organization/${id}`}>
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
              alt="Organizzazione"
              src={imageSrc || "/images/NERO500.jpg"} // Immagine di fallback
              priority
              fill
              className="
                object-cover 
                transition-transform 
                duration-300 
                group-hover:scale-110
              "
            />
          </div>
          <h3 className="text-lg font-semibold mb-1 break-words line-clamp-2">
            {name}
          </h3>
        </Link>
      </div>
    </Suspense>
  );
};

export default OrganizationCard;
