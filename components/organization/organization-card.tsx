"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OrganizationCardProps {
  id: string;
  name: string;
  imageSrc?: string;
  isOrganizationCreator?: boolean;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({ id, name, imageSrc, isOrganizationCreator }) => {

  const router = useRouter();

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
            {isOrganizationCreator && (
                    <div className="absolute right-2 top-2 flex flex-col gap-2 rounded-xl bg-white dark:bg-black/80 p-3 shadow-sm transition-all">
                    
                    <Image
                      onClick={(e) => {
                        e.preventDefault(); // Blocca il comportamento predefinito del link
                        e.stopPropagation(); // Ferma l'evento dal salire al parent
                        router.push(`/organization/${id}/update`);
                      }}
                      src="/edit.svg"
                      alt="edit"
                      width={20}
                      height={20}
                    />
                     
                      <span className="w-full bg-black dark:bg-white h-[1px] opacity-20"></span>
                     {//todo <DeleteConfirmation eventId={data.id} />
                     }
                </div>  )}
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
