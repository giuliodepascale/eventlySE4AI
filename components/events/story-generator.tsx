"use client";

import { useRef, useEffect, useState } from "react";
import { SafeEvent } from "@/app/types";
import html2canvas from "html2canvas";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaInstagram, FaDownload } from "react-icons/fa";
import Loader from "@/components/loader";

interface StoryGeneratorProps {
  event: SafeEvent;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ event }) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Controlla se l'utente è su mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const downloadStory = async () => {
    if (!storyRef.current) return;

    const canvas = await html2canvas(storyRef.current, { useCORS: true });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${event.title.replace(/\s+/g, "_")}_instagram_story.png`;
    link.click();
  };

  const shareToInstagram = async () => {
    if (!storyRef.current) return;

    const canvas = await html2canvas(storyRef.current, { useCORS: true });
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "story.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `📅 ${event.title} - ${event.comune}, ${event.provincia}` });
      } else {
        window.location.href = `instagram://story-camera`;
      }
    }, "image/png");
  };

  if (!event) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
      <div className="container mx-auto px-4 lg:px-12 xl:px-20">
        
        {/* Bottone Torna Indietro */}
        <motion.button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <FaArrowLeft /> Torna Indietro
        </motion.button>

        {/* Contenitore della Storia Instagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center w-full"
        >
          <div
            ref={storyRef}
            className="relative w-full max-w-[400px] sm:max-w-[600px] md:max-w-[800px] aspect-[9/16] bg-black rounded-lg shadow-xl overflow-hidden flex items-center justify-center"
          >
            <Image
              src={event.imageSrc || "/images/NERO500.jpg"}
              alt={event.title}
              layout="fill"
              objectFit="cover"
              className="opacity-90"
            />
            
            {/* Effetto sfumatura per leggibilità */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black to-transparent p-4 sm:p-6 flex flex-col justify-end">
              <h1 className="text-white text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                {event.title}
              </h1>
              <p className="text-white text-md sm:text-lg md:text-2xl mt-1 sm:mt-2 font-medium">
                {event.comune}, {event.provincia}
              </p>
              <p className="text-white text-sm sm:text-lg mt-1 font-light">
                {new Date(event.eventDate).toLocaleDateString("it-IT", {
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>

          {/* Bottone Scarica Immagine */}
          <motion.button
            onClick={downloadStory}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 flex items-center justify-center gap-2 bg-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg transition duration-300"
          >
            <FaDownload size={24} />
            Scarica Immagine
          </motion.button>

          {/* Bottone Condividi su Instagram SOLO su Mobile */}
          {isMobile && (
            <motion.button
              onClick={shareToInstagram}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg transition duration-300"
            >
              <FaInstagram size={24} />
              Condividi su Instagram
            </motion.button>
          )}

         

          {/* Bottone "Vai su Instagram e pubblica ora la tua storia" SOLO su Desktop */}
          {!isMobile && (
            <motion.a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg shadow-lg transition duration-300"
            >
               
              <FaInstagram size={20}/>
              Vai su Instagram e pubblica ora la tua storia
            </motion.a>
            
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StoryGenerator;
