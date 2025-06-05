"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaEdit } from "react-icons/fa";
import { deleteOrganization } from "@/MONGODB/CRUD/organization";



interface OrganizationCardProps {
  id: string;
  name: string;
  imageSrc?: string;
  isOrganizationCreator?: boolean;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  id,
  name,
  imageSrc,
  isOrganizationCreator,
}) => {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare questa organizzazione? Questa azione è irreversibile."
    );

    if (!confirmed) return;

    try {
      await deleteOrganization(id);
      alert("Organizzazione eliminata con successo.");
      router.refresh(); // o router.push('/qualchepagina') se vuoi redirigere
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Si è verificato un errore durante l'eliminazione.");
    }
  };

  return (
    <Suspense>
      <div
        className="group block overflow-hidden rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow p-4 bg-white text-neutral-800"
      >
        <Link href={`/organization/manage-organization/${id}`}>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4">
            <Image
              alt="Organizzazione"
              src={imageSrc || "/images/NERO500.jpg"}
              priority
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {isOrganizationCreator && (
              <div className="absolute right-2 top-2 flex flex-row items-center gap-2">
                {/* Elimina */}
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center p-3 transition-colors duration-200 rounded-full bg-red-500 hover:bg-red-600 text-white focus:outline-none shadow-md"
                  title="Elimina"
                >
                  🗑️
                </button>
                {/* Modifica */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/organization/${id}/update`);
                  }}
                  className="flex items-center justify-center p-3 transition-colors duration-200 rounded-full bg-blue-500 hover:bg-blue-600 text-white focus:outline-none shadow-md"
                  title="Modifica"
                >
                  <FaEdit width={20} height={20} />
                </button>
              </div>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-1 break-words line-clamp-2">{name}</h3>
        </Link>
      </div>
    </Suspense>
  );
};

export default OrganizationCard;
