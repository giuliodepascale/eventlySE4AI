"use client";


import { User } from "@prisma/client";

interface LocationProviderProps {
  currentUser: User | null;
}

const LocationProvider: React.FC<LocationProviderProps> = ({  }) => {
  


  return (
    <div>
      {/* Pulsante per aggiornare la posizione */}
      <div className="flex justify-center my-4">
       
      </div>

      </div>
  );
};

export default LocationProvider;
