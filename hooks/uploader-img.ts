import { useUploadThing } from "@/lib/uploadthing";

export function useImageUploader() {
  const { uploadFiles } = useUploadThing; // Estrai `uploadFiles`

  const startUpload = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error("Nessun file selezionato.");
    }

    try {
      // Crea i parametri richiesti
      const uploadParams = {
        files, // I file da caricare
        onUploadProgress: (opts: { file: File; progress: number; totalProgress: number }) => {
          console.log(`Progresso upload del file ${opts.file.name}: ${opts.progress}%`);
        },
        onUploadComplete: (opts: { file: string }) => {
          console.log(`Upload completato per il file: ${opts.file}`);
        },
      };

      const result = await uploadFiles("imageUploader", uploadParams); // Passa l'endpoint e i parametri
      return result; // Restituisci il risultato dell'upload
    } catch (error) {
      console.error("Errore durante l'upload:", error);
      throw error; // Gestione dell'errore
    }
  };

  return { startUpload }; // Restituisci la funzione per avviare l'upload
}
