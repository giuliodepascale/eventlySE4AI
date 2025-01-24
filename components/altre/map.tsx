import React from "react";

interface MapProps {
  src: string; // URL della mappa
}

const Map: React.FC<MapProps> = ({ src }) => {
  return (
    <div className="mt-8">
      <h3 className="text-2xl font-semibold text-black">Dove Trovarci</h3>
      <div className="mt-4 w-full h-[450px] rounded-xl overflow-hidden">
        <div className="w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden shadow-md">
          <iframe
            src={src}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Map;
